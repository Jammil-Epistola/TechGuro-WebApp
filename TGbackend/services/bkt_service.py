# services/bkt_service.py
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from TGbackend.models import (
    AssessmentResults,
    AssessmentQuestionResponse,
    UserLessonMastery,
    UserLessonMasteryHistory, 
    Lesson,
)

class BKTService:

    # Map lesson_id -
    SKILL_NAMES: Dict[int, str] = {
        # Computer Basics (1-5)
        1: "what_is_computer",
        2: "hardware_software", 
        3: "computer_use",
        4: "install_application",
        5: "basic_troubleshooting",
        
        # Internet Safety (6-10)
        6: "what_is_internet",
        7: "fake_news",
        8: "online_scams", 
        9: "avoiding_malware",
        10: "protect_privacy",
        
        # Digital Communication and Messaging (11-15)
        11: "communicating_online",
        12: "use_an_email",
        13: "use_messaging_apps",
        14: "video_communication", 
        15: "etiquette_safety",

        # Intro to Online Selling(11-15)
        16: "what_is_online_selling",
        17: "setting_up_selling",
        18: "creating_listing",
        19: "respond_buyers_orders",
    }

    def __init__(
        self,
        p_init: float = 0.2,   # prior knowledge P(L0)
        p_learn: float = 0.15, # learn rate P(T)
        p_slip: float = 0.1,   # slip P(incorrect | known)
        p_guess: float = 0.2,  # guess P(correct | unknown)
        min_responses_per_skill: int = 1,
    ):
        self.p_init = self._clamp(p_init)
        self.p_learn = self._clamp(p_learn)
        self.p_slip = self._clamp(p_slip)
        self.p_guess = self._clamp(p_guess)
        self.min_responses_per_skill = max(0, min_responses_per_skill)

    # ----------------------------
    # ENHANCED: Pre/Post Assessment Methods with History Tracking
    # ----------------------------

    def update_from_pre(self, user_id: int, course_id: int, db: Session) -> Dict:
        """
        Handle mastery updates when a PRE-assessment is submitted.
        - Uses BKT algorithm but with conservative estimates
        - Sets initial mastery baselines for lesson recommendations
        - Stores baseline in history for later improvement tracking
        """
        # Filter for pre-assessment responses only
        responses = self._fetch_user_responses(user_id, course_id, db, assessment_type="pre")
        
        if not responses:
            return {
                "status": "no_pre_data",
                "updated_masteries": {},
                "ai_enabled": False,
                "assessment_type": "pre"
            }

        # Use BKT algorithm with pre-assessment data
        result = self._process_responses(user_id, course_id, db, responses, source="pre_assessment")
        
        # Pre-assessment specific adjustments
        result["assessment_type"] = "pre"
        result["recommendations_note"] = "Based on diagnostic assessment - focus areas identified"
        
        return result

    def update_from_post(self, user_id: int, course_id: int, db: Session) -> Dict:
        """
        Handle mastery updates when a POST-assessment is submitted.
        Hybrid Rule:
        - Pass if (BKT mastery ≥ 0.8) OR (Overall score ≥ 0.75).
        - Provides eligibility_reason to explain why they passed/failed.
        """
        responses = self._fetch_user_responses(user_id, course_id, db, assessment_type="post")
        
        if not responses:
            return {
                "status": "no_post_data", 
                "updated_masteries": {},
                "completion_eligible": False,
                "assessment_type": "post",
                "eligibility_reason": "no_data",
                "debug_info": {
                    "responses_found": 0
                }
            }

        # Run BKT algorithm
        result = self._process_responses(user_id, course_id, db, responses, source="post_assessment")
        
        # Calculate raw score
        total_responses = len(responses)
        correct_responses = sum(1 for r in responses if r.is_correct)
        overall_score = correct_responses / total_responses if total_responses > 0 else 0

        # Evaluate criteria
        bkt_eligible = self._check_completion_eligibility(result["updated_masteries"], threshold=0.8)
        score_eligible = overall_score >= 0.75

        # Hybrid rule (OR instead of AND)
        if bkt_eligible and score_eligible:
            final_eligible = True
            eligibility_reason = "both_bkt_and_score"
        elif bkt_eligible:
            final_eligible = True
            eligibility_reason = "bkt_mastery_only"
        elif score_eligible:
            final_eligible = True
            eligibility_reason = "score_only"
        else:
            final_eligible = False
            eligibility_reason = "failed_both"

        # Update results
        result["assessment_type"] = "post"
        result["completion_eligible"] = final_eligible
        result["overall_score"] = overall_score
        result["bkt_eligible"] = bkt_eligible
        result["score_eligible"] = score_eligible
        result["eligibility_reason"] = eligibility_reason
        result["debug_info"] = {
            "responses_found": total_responses,   # 👈 NEW
            "mastery_count": sum(1 for m in result["updated_masteries"].values() if m >= 0.8),
            "total_lessons": len(result["updated_masteries"]),
            "overall_correct": correct_responses,
            "overall_total": total_responses
        }

        # Improvement analysis
        result["improvement_analysis"] = self._analyze_improvement_from_history(
            user_id, course_id, db, result["updated_masteries"]
        )

        # Recommendations if failed
        if not final_eligible:
            try:
                rec = self.get_recommendations(user_id, course_id, db, threshold=0.8)
                result["recommended_lessons_after_post"] = rec.get("recommended_lessons", [])
            except Exception:
                result["recommended_lessons_after_post"] = []

        return result



    # ----------------------------
    # EVENT-DRIVEN: Core BKT Logic (now with history tracking)
    # ----------------------------

    def update_from_assessments(self, user_id: int, course_id: int, db: Session, source: str = "general_assessment") -> Dict:
        """
        Event-driven method - call this when responses are submitted.
        Recompute mastery for all lessons with available responses.
        Writes to UserLessonMastery AND tracks history.
        Returns a summary (masteries + count).
        """
        responses = self._fetch_user_responses(user_id, course_id, db)
        return self._process_responses(user_id, course_id, db, responses, source)

    def _process_responses(self, user_id: int, course_id: int, db: Session, responses: List[AssessmentQuestionResponse], source: str = "general") -> Dict:
        """
        Core BKT processing logic with history tracking
        """
        if not responses:
            return {
                "status": "no_data",
                "updated_masteries": {},
                "ai_enabled": False,
            }

        # Group binary correctness by lesson_id, ordered by timestamp
        per_skill: Dict[int, List[int]] = {}
        for r in responses:
            if r.lesson_id is None:
                continue
            per_skill.setdefault(r.lesson_id, []).append(1 if r.is_correct else 0)

        updated: Dict[int, float] = {}
        for lesson_id, series in per_skill.items():
            if len(series) < self.min_responses_per_skill:
                continue
            mastery = self._run_bkt(series)
            
            # Persist to DB (create or update) AND track history
            self._upsert_mastery_with_history(db, user_id, course_id, lesson_id, mastery, source)
            updated[lesson_id] = mastery

        db.commit()

        return {
            "status": "ok" if updated else "no_updates",
            "updated_masteries": updated,
            "ai_enabled": bool(updated),
        }
    
    def _check_completion_eligibility(self, updated_masteries: Dict[int, float], threshold: float = 0.8) -> bool:
        """
        Checks if all lessons meet the mastery threshold.
        Returns True if every lesson in updated_masteries >= threshold.
        """
        if not updated_masteries:
            return False
        return all(mastery >= threshold for mastery in updated_masteries.values())


    # ----------------------------
    # EVENT-DRIVEN: Simplified Recommendations (just read from DB)
    # ----------------------------

    def get_recommendations(
        self,
        user_id: int,
        course_id: int,
        db: Session,
        threshold: float = 0.7,
        limit: int = 5,
    ) -> Dict:
        """
        SIMPLIFIED: Just read from already-updated mastery records.
        No more recomputation - assumes event-driven updates keep data fresh.
        """
        # Read all mastery records for the course
        q = (
            db.query(UserLessonMastery)
            .filter(
                UserLessonMastery.user_id == user_id,
                UserLessonMastery.course_id == course_id,
            )
        ).all()

        if not q:
            # No data — return safe fallback (avoids infinite loading)
            return {
                "recommended_lessons": [],
                "next_priority": None,
                "mastery_analysis": {},
                "suggested_path": [],
                "time_estimate": "Unknown",
                "data_status": "no_assessments_taken"
            }

        # Build list with mastery values
        items: List[Tuple[int, float]] = [(row.lesson_id, float(row.estimated_mastery or 0.0)) for row in q]

        # Sort by ascending mastery (lowest mastery = highest priority)
        items.sort(key=lambda t: t[1])

        # Recommend those below threshold
        below = [lesson_id for (lesson_id, m) in items if m < threshold]
        if below:
            top = below[:limit]
        else:
            # Find the minimum mastery value
            min_val = items[0][1] if items else 0
            # Recommend only lessons at that min mastery
            top = [lid for (lid, m) in items if m == min_val]

        # Prepare analysis for first 3 items
        mastery_lookup = {lid: m for (lid, m) in items}
        analysis = {}
        for lid in top[:3]:
            m = mastery_lookup.get(lid, 0.0)
            analysis[lid] = {
                "current_mastery": round(m, 3),
                "reason": self._reason(m, threshold),
                "priority": self._priority(m, threshold),
            }

        return {
            "recommended_lessons": top,
            "next_priority": top[0] if top else None,
            "mastery_analysis": analysis,
            "suggested_path": [lid for (lid, _) in items],  # full path: low->high mastery
            "time_estimate": f"{len(top)*15}-{len(top)*25} minutes" if top else "15-25 minutes",
            "data_status": "recommendations_ready"
        }

    # ----------------------------
    # ENHANCED: Helper Methods with Real Improvement Tracking
    # ----------------------------

    def _analyze_improvement_from_history(self, user_id: int, course_id: int, db: Session, current_masteries: Dict[int, float]) -> Dict:
        """
        REAL improvement tracking using history table.
        Compare current (post) masteries with historical (pre) masteries.
        """
        if not current_masteries:
            return {
                "avg_improvement": 0.0, 
                "lessons_improved": 0,
                "detailed_improvements": {}
            }

        # Get pre-assessment baseline from history
        pre_records = (
            db.query(UserLessonMasteryHistory)
            .filter(
                UserLessonMasteryHistory.user_id == user_id,
                UserLessonMasteryHistory.course_id == course_id,
                UserLessonMasteryHistory.assessment_type == "pre"
            )
            .all()
        )

        # Build pre-mastery lookup
        pre_masteries = {record.lesson_id: record.estimated_mastery for record in pre_records}

        # Calculate improvements
        improvements = {}
        total_improvement = 0.0
        improved_count = 0

        for lesson_id, current_mastery in current_masteries.items():
            pre_mastery = pre_masteries.get(lesson_id, 0.0)  # Default to 0 if no pre-assessment
            delta = current_mastery - pre_mastery
            
            improvements[lesson_id] = {
                "pre_mastery": round(pre_mastery, 3),
                "post_mastery": round(current_mastery, 3),
                "improvement": round(delta, 3),
                "improvement_percentage": round((delta / max(pre_mastery, 0.1)) * 100, 1) if pre_mastery > 0 else "N/A"
            }
            
            total_improvement += delta
            if delta > 0.1:  # Consider significant improvement
                improved_count += 1

        avg_improvement = total_improvement / len(current_masteries) if current_masteries else 0.0

        return {
            "avg_improvement": round(avg_improvement, 3),
            "lessons_improved": improved_count,
            "total_lessons": len(current_masteries),
            "detailed_improvements": improvements,
            "overall_growth": "Strong" if avg_improvement > 0.3 else "Moderate" if avg_improvement > 0.1 else "Minimal"
        }

    def _check_completion_eligibility_focused(self, masteries: Dict[int, float], recommended_lessons: List[int], threshold: float = 0.8) -> bool:
        """Only check mastery of lessons that were actually recommended for study"""
        if not recommended_lessons:
            return False
        
        mastered_count = sum(1 for lesson_id in recommended_lessons if masteries.get(lesson_id, 0) >= threshold)
        return (mastered_count / len(recommended_lessons)) >= 0.9  # 90% of STUDIED lessons

    # ----------------------------
    # ENHANCED: Internal Methods with History Tracking
    # ----------------------------

    def _upsert_mastery_with_history(self, db: Session, user_id: int, course_id: int, lesson_id: int, mastery: float, source: str = "general") -> None:
        """
        Update mastery AND create history record for tracking changes over time.
        """
        now = datetime.utcnow()
        
        # Update/create current mastery record
        row = (
            db.query(UserLessonMastery)
            .filter(
                UserLessonMastery.user_id == user_id,
                UserLessonMastery.course_id == course_id,
                UserLessonMastery.lesson_id == lesson_id,
            )
            .first()
        )
        
        is_mastered = mastery >= 0.7
        
        if row:
            row.estimated_mastery = mastery
            row.is_mastered = is_mastered
            row.last_updated = now
        else:
            db.add(
                UserLessonMastery(
                    user_id=user_id,
                    course_id=course_id,
                    lesson_id=lesson_id,
                    estimated_mastery=mastery,
                    is_mastered=is_mastered,
                    last_updated=now,
                )
            )
        
        # Create history record for tracking
        assessment_type = None
        if "pre" in source:
            assessment_type = "pre"
        elif "post" in source:
            assessment_type = "post"
        
        db.add(
            UserLessonMasteryHistory(
                user_id=user_id,
                course_id=course_id,
                lesson_id=lesson_id,
                estimated_mastery=mastery,
                is_mastered=is_mastered,
                assessment_type=assessment_type,
                source=source,
                created_at=now,
            )
        )

    def _fetch_user_responses(self, user_id: int, course_id: int, db: Session, assessment_type: str):
        """
        Fetch all responses for a given user/course/assessment_type.
        Uses JOIN with AssessmentResults to filter by type.
        """
        responses = (
            db.query(AssessmentQuestionResponse)
            .join(AssessmentResults, AssessmentQuestionResponse.assessment_id == AssessmentResults.id)
            .filter(
                AssessmentQuestionResponse.user_id == user_id,
                AssessmentResults.course_id == course_id,
                AssessmentResults.assessment_type == assessment_type
            )
            .all()
        )
        return responses
        # Add assessment type filter if specified  <-- This code is unreachable!
        if assessment_type:
            query = query.filter(AssessmentResults.assessment_type == assessment_type)
            
        return query.order_by(AssessmentQuestionResponse.timestamp.asc()).all()

    def _run_bkt(self, correctness_series: List[int]) -> float:
       
        pL = self.p_init
        s = self.p_slip
        g = self.p_guess
        t = self.p_learn

        for correct in correctness_series:
          
            if correct == 1:
                num = pL * (1.0 - s)
                den = num + (1.0 - pL) * g
            else:
                num = pL * s
                den = num + (1.0 - pL) * (1.0 - g)

            # Guard against zero/NaN
            if den <= 0.0:
                post = pL 
            else:
                post = num / den

            pL = post + (1.0 - post) * t
            pL = self._clamp(pL)

        return float(pL)

    def _reason(self, m: float, thr: float) -> str:
        if m < 0.3: return "🔴 Critical: Fundamental concepts need reinforcement"
        if m < 0.5: return "🟡 Developing: Practice needed to build confidence"
        if m < thr: return "🟠 Almost there: Review to achieve mastery"
        return "Mastered: Ready for advanced topics"

    def _priority(self, m: float, thr: float) -> str:
        if m < 0.3: return "HIGH"
        if m < 0.5: return "MEDIUM"
        if m < thr: return "LOW"
        return "DONE"

    @staticmethod
    def _clamp(x: float) -> float:
        if x != x:  # NaN
            return 0.0
        if x < 0.0: return 0.0
        if x > 1.0: return 1.0
        return x


# Global instance 
teki_bkt = BKTService()