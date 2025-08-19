import numpy as np
import pandas as pd
from pyBKT.models import Model
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, List, Tuple
import json

from TGbackend.models import (
    UserLessonMastery, AssessmentQuestionResponse, AssessmentResults
)

class BKTService:
    """
    Real AI-powered Bayesian Knowledge Tracing using pyBKT library
    """
    
    def __init__(self):
        self.models = {}  # Cache trained models per user
        self.skill_names = {
            1: "what_is_computer",
            2: "computer_parts", 
            3: "turning_on_off",
            4: "exploring_desktop",
            5: "using_mouse",
            6: "opening_closing_programs",
            7: "switching_windows",
            8: "using_start_menu"
        }
    
    def prepare_data_for_bkt(self, user_id: int, db: Session) -> pd.DataFrame:
        """
        Convert user's assessment responses into pyBKT format
        """
        responses = db.query(AssessmentQuestionResponse).join(AssessmentResults).filter(
            AssessmentResults.user_id == user_id,
            AssessmentQuestionResponse.lesson_id.isnot(None)
        ).all()
        
        if not responses:
            print(f"[BKT] No assessment responses found for user {user_id}")
            return pd.DataFrame()
        
        print(f"[BKT] Found {len(responses)} responses for user {user_id}")
        
        data = []
        for i, response in enumerate(responses):
            skill_name = self.skill_names.get(response.lesson_id, f"skill_{response.lesson_id}")
            data.append({
                'user_id': user_id,
                'item_id': f"q_{response.question_id}",
                'skill_name': skill_name,
                'correct': 1 if response.is_correct else 0,
                'order_id': i
            })
        
        df = pd.DataFrame(data)
        print(f"[BKT] Prepared DataFrame shape: {df.shape}")
        print(f"[BKT] Skills covered: {df['skill_name'].unique()}")
        print(f"[BKT] Correct answers: {df['correct'].sum()}/{len(df)}")
        
        return df
    
    def validate_data_for_training(self, df: pd.DataFrame) -> bool:
        """
        Validate data before training to prevent pyBKT errors
        """
        if df.empty:
            print("[BKT] No data to validate")
            return False
        
        # Check minimum data requirements
        if len(df) < 3:
            print(f"[BKT] Insufficient data: {len(df)} responses (need at least 3)")
            return False
        
        # Check if we have both correct and incorrect answers
        correct_count = df['correct'].sum()
        total_count = len(df)
        
        if correct_count == 0 or correct_count == total_count:
            print(f"[BKT] No variance in responses: {correct_count}/{total_count} correct")
            return False
        
        # Check if we have multiple skills
        unique_skills = df['skill_name'].nunique()
        if unique_skills < 2:
            print(f"[BKT] Only {unique_skills} skill(s) found, need at least 2")
            return False
        
        print(f"[BKT] Data validation passed: {total_count} responses, {unique_skills} skills")
        return True
    
    def train_user_model(self, user_id: int, db: Session) -> bool:
        """
        Train pyBKT model for specific user with validation
        """
        try:
            # Prepare data
            df = self.prepare_data_for_bkt(user_id, db)
            
            # Validate data before training
            if not self.validate_data_for_training(df):
                print(f"[BKT] Skipping training for user {user_id} - insufficient or invalid data")
                return False
            
            print(f"[BKT] Starting model training for user {user_id}...")
            
            # Initialize pyBKT model with more conservative parameters
            model = Model(
                seed=42, 
                num_fits=3,  # Reduced from 5 to prevent overfitting
                parallel=False  # Disable parallel processing for stability
            )
            
            # Train the model
            model.fit(data=df)
            
            # Cache the trained model
            self.models[user_id] = {
                'model': model,
                'data': df,
                'trained_at': datetime.utcnow(),
                'skills': list(df['skill_name'].unique())
            }
            
            print(f"[BKT] Successfully trained model for user {user_id}")
            return True
            
        except Exception as e:
            print(f"[BKT ERROR] Training failed for user {user_id}: {e}")
            return False
    
    def get_skill_mastery(self, user_id: int, skill_name: str) -> float:
        """
        Get current mastery probability for a skill using AI
        """
        if user_id not in self.models:
            print(f"[BKT] No model found for user {user_id}")
            return 0.1  # Default low mastery
        
        try:
            model_data = self.models[user_id]
            model = model_data['model']
            
            # Check if skill exists in training data
            if skill_name not in model_data['skills']:
                print(f"[BKT] Skill {skill_name} not in training data for user {user_id}")
                return 0.1
            
            # Get predictions
            predictions = model.predict(data=model_data['data'])
            
            # Find latest prediction for this skill
            skill_data = model_data['data'][model_data['data']['skill_name'] == skill_name]
            if skill_data.empty:
                return 0.1
            
            # Get the most recent mastery probability
            last_idx = skill_data.index[-1]
            if last_idx < len(predictions['state_predictions']):
                mastery_prob = float(predictions['state_predictions'][last_idx])
                # Clamp between reasonable bounds and handle NaN
                if np.isnan(mastery_prob) or np.isinf(mastery_prob):
                    return 0.1
                return min(max(mastery_prob, 0.0), 1.0)
            
            return 0.1
            
        except Exception as e:
            print(f"[BKT ERROR] Mastery calculation failed for {skill_name}: {e}")
            return 0.1
    
    def get_all_masteries(self, user_id: int) -> Dict[int, float]:
        """
        Get mastery levels for all lessons using AI
        """
        masteries = {}
        
        # Try to train model if not exists
        if user_id not in self.models:
            print(f"[BKT] No model for user {user_id}, attempting to train...")
            # We need db session here, but for now return basic masteries
            for lesson_id in self.skill_names.keys():
                masteries[lesson_id] = 0.1  # Default low mastery
            return masteries
        
        try:
            for lesson_id, skill_name in self.skill_names.items():
                mastery = self.get_skill_mastery(user_id, skill_name)
                masteries[lesson_id] = mastery
            
            return masteries
            
        except Exception as e:
            print(f"[BKT ERROR] Get all masteries failed: {e}")
            # Return default masteries
            for lesson_id in self.skill_names.keys():
                masteries[lesson_id] = 0.1
            return masteries
    
    def get_ai_recommendations(self, user_id: int, threshold: float = 0.7) -> List[Dict]:
        """
        AI-powered lesson recommendations based on BKT predictions
        """
        try:
            masteries = self.get_all_masteries(user_id)
            
            recommendations = []
            for lesson_id, mastery in masteries.items():
                if mastery < threshold:
                    confidence = max(0.1, (threshold - mastery))
                    
                    recommendations.append({
                        'lesson_id': lesson_id,
                        'skill_name': self.skill_names.get(lesson_id, f"skill_{lesson_id}"),
                        'current_mastery': round(mastery, 3),
                        'recommended_reason': self._get_recommendation_reason(mastery, threshold),
                        'priority': self._calculate_priority(mastery, threshold),
                        'ai_confidence': round(confidence, 3)
                    })
            
            # Sort by priority (lowest mastery first)
            recommendations.sort(key=lambda x: x['current_mastery'])
            
            print(f"[BKT] Generated {len(recommendations)} recommendations for user {user_id}")
            return recommendations
            
        except Exception as e:
            print(f"[BKT ERROR] Recommendations failed: {e}")
            return []
    
    def _get_recommendation_reason(self, mastery: float, threshold: float) -> str:
        """Generate AI reasoning for recommendation"""
        if mastery < 0.3:
            return "🔴 Critical: Fundamental concepts need reinforcement"
        elif mastery < 0.5:
            return "🟡 Developing: Practice needed to build confidence"  
        elif mastery < threshold:
            return "🟠 Almost there: Review to achieve mastery"
        else:
            return "✅ Mastered: Ready for advanced topics"
    
    def _calculate_priority(self, mastery: float, threshold: float) -> str:
        """Calculate recommendation priority"""
        if mastery < 0.3:
            return "HIGH"
        elif mastery < 0.5:
            return "MEDIUM"
        else:
            return "LOW"
    
    def update_from_new_assessment(self, user_id: int, db: Session) -> Dict:
        """
        Update AI model when user completes new assessment
        """
        try:
            # Retrain model with new data
            success = self.train_user_model(user_id, db)
            if not success:
                print(f"[BKT] Model training failed for user {user_id}, using fallback")
                # Return basic recommendations without AI
                return {
                    "status": "Fallback mode - insufficient data for AI training",
                    "ai_recommendations": [],
                    "mastery_levels": {i: 0.1 for i in self.skill_names.keys()},
                    "model_trained_at": None
                }
            
            # Get fresh recommendations
            recommendations = self.get_ai_recommendations(user_id)
            
            # Update database with AI-calculated masteries
            masteries = self.get_all_masteries(user_id)
            for lesson_id, mastery_score in masteries.items():
                existing = db.query(UserLessonMastery).filter_by(
                    user_id=user_id, 
                    lesson_id=lesson_id
                ).first()
                
                if existing:
                    existing.estimated_mastery = mastery_score
                    existing.is_mastered = mastery_score >= 0.7
                    existing.last_updated = datetime.utcnow()
                else:
                    new_mastery = UserLessonMastery(
                        user_id=user_id,
                        lesson_id=lesson_id,
                        estimated_mastery=mastery_score,
                        is_mastered=mastery_score >= 0.7,
                        last_updated=datetime.utcnow()
                    )
                    db.add(new_mastery)
            
            db.commit()
            
            return {
                "status": "AI model updated successfully",
                "ai_recommendations": recommendations,
                "mastery_levels": masteries,
                "model_trained_at": self.models[user_id]['trained_at'].isoformat()
            }
            
        except Exception as e:
            print(f"[BKT ERROR] Update failed: {e}")
            return {"error": str(e)}

# Global AI service instance
bkt_service = BKTService()