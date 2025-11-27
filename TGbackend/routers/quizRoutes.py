# quizRoutes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
from TGbackend.database import get_db
from TGbackend.models import Quiz, QuizQuestion, QuizResult, QuizQuestionResponse, User, Course, Lesson
from TGbackend.schema import QuizSubmission

router = APIRouter(tags=["Quiz Handling"])

# Get available quiz types for a course
@router.get("/quiz-modes/{course_id}")
def get_quiz_modes(course_id: int, db: Session = Depends(get_db)):
    """Get available quiz types (modes) for a course"""
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get distinct quiz types available for this course
    quiz_types = db.query(Quiz.quiz_type).filter(
        Quiz.course_id == course_id
    ).distinct().all()
    
    modes = []
    for qt in quiz_types:
        # Count lessons available for each quiz type
        lessons_count = db.query(Quiz.lesson_id).filter(
            Quiz.course_id == course_id,
            Quiz.quiz_type == qt[0]
        ).distinct().count()
        
        modes.append({
            "quiz_type": qt[0],
            "available_lessons": lessons_count,
            "display_name": {
                "multiple_choice": "Image Recognition Quiz",
                "drag_drop": "Drag & Drop Challenge", 
                "typing": "Typing Practice Quiz"
            }.get(qt[0], qt[0].replace('_', ' ').title())
        })
    
    return {"course_id": course_id, "course_title": course.title, "quiz_modes": modes}

# Get lessons available for a specific quiz type
@router.get("/quiz-lessons/{course_id}/{quiz_type}")
def get_quiz_lessons(course_id: int, quiz_type: str, db: Session = Depends(get_db)):
    """Get lessons that have quizzes available for a specific quiz type"""
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    quizzes = db.query(Quiz).filter(
        Quiz.course_id == course_id,
        Quiz.quiz_type == quiz_type
    ).all()
    
    if not quizzes:
        raise HTTPException(
            status_code=404, 
            detail=f"No {quiz_type} quizzes found for course {course_id}"
        )
    
    lessons_info = []
    for quiz in quizzes:
        # Get lesson title from the lesson relationship
        lesson = db.query(Lesson).filter(Lesson.id == quiz.lesson_id).first()
        
        lessons_info.append({
            "lesson_id": quiz.lesson_id,
            "lesson_title": lesson.title if lesson else f"Lesson {quiz.lesson_id}",
            "quiz_id": quiz.id,
            "quiz_title": quiz.title,
            "total_questions": quiz.total_questions,
            "time_limit": quiz.time_limit,
            "difficulty": quiz.difficulty
        })
    
    return {
        "course_id": course_id,
        "course_title": course.title,
        "quiz_type": quiz_type,
        "available_lessons": lessons_info
    }

# NEW ENDPOINT: Quiz Performance Breakdown Analytics
@router.get("/quiz/performance-breakdown/{user_id}/{course_id}")
def get_quiz_performance_breakdown(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Get aggregated quiz performance statistics by quiz type.
    Returns performance patterns, weak areas, and recommendations.
    """

    # Verify user and course exist
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get all quiz results for this user and course
    quiz_results = db.query(QuizResult).filter(
        QuizResult.user_id == user_id,
        QuizResult.course_id == course_id
    ).all()
    
    if not quiz_results:
        return {
            "user_id": user_id,
            "course_id": course_id,
            "total_attempts": 0,
            "performance_by_type": {},
            "weak_areas": [],
            "lesson_performance": [],
            "recommendations": []
        }
    
    performance_by_type = {}
    lesson_performance = {}
    
    for result in quiz_results:
        quiz_type = result.quiz_type
        lesson_id = result.lesson_id
        
        # Aggregate by quiz type
        if quiz_type not in performance_by_type:
            performance_by_type[quiz_type] = {
                "total_attempts": 0,
                "total_score": 0,
                "total_questions": 0,
                "passed_attempts": 0,
                "scores": []
            }
        
        performance_by_type[quiz_type]["total_attempts"] += 1
        performance_by_type[quiz_type]["total_score"] += result.score
        performance_by_type[quiz_type]["total_questions"] += result.total_questions
        performance_by_type[quiz_type]["scores"].append(result.percentage)
        
        if result.percentage >= 60:
            performance_by_type[quiz_type]["passed_attempts"] += 1
        
        # Aggregate by lesson
        if lesson_id not in lesson_performance:
            lesson_performance[lesson_id] = {
                "lesson_id": lesson_id,
                "attempts": 0,
                "quiz_types": {}
            }
        
        lesson_performance[lesson_id]["attempts"] += 1
        
        # Track quiz types per lesson
        if quiz_type not in lesson_performance[lesson_id]["quiz_types"]:
            lesson_performance[lesson_id]["quiz_types"][quiz_type] = []
        lesson_performance[lesson_id]["quiz_types"][quiz_type].append(result.percentage)
    
    # Calculate statistics for each quiz type
    quiz_type_stats = {}
    for quiz_type, data in performance_by_type.items():
        average_percentage = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
        pass_rate = (data["passed_attempts"] / data["total_attempts"]) * 100 if data["total_attempts"] > 0 else 0
        
        quiz_type_stats[quiz_type] = {
            "quiz_type": quiz_type,
            "display_name": {
                "multiple_choice": "Image Recognition Quiz",
                "drag_drop": "Drag & Drop Challenge",
                "typing": "Typing Practice Quiz"
            }.get(quiz_type, quiz_type.replace('_', ' ').title()),
            "total_attempts": data["total_attempts"],
            "average_score": round(average_percentage, 2),
            "pass_rate": round(pass_rate, 2),
            "best_score": round(max(data["scores"]), 2) if data["scores"] else 0,
            "worst_score": round(min(data["scores"]), 2) if data["scores"] else 0
        }
    
    # Calculate lesson-level statistics
    lesson_stats = []
    for lesson_id, data in lesson_performance.items():
        # Get lesson title
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        lesson_title = lesson.title if lesson else f"Lesson {lesson_id}"
        
        # Calculate average across all quiz types for this lesson
        all_scores = []
        best_score = 0
        for scores in data["quiz_types"].values():
            all_scores.extend(scores)
            best_score = max(best_score, max(scores) if scores else 0)
        
        average_score = sum(all_scores) / len(all_scores) if all_scores else 0
        
        lesson_stats.append({
            "lesson_id": lesson_id,
            "lesson_title": lesson_title,
            "attempts": data["attempts"],
            "average_score": round(average_score, 2),
            "best_score": round(best_score, 2),
            "quiz_types_attempted": list(data["quiz_types"].keys())
        })
    
    # Sort by average score to identify weak areas
    lesson_stats.sort(key=lambda x: x["average_score"])
    
    # Identify weak areas (below 60%)
    weak_areas = []
    for lesson in lesson_stats:
        if lesson["average_score"] < 60:
            weak_areas.append({
                "lesson_id": lesson["lesson_id"],
                "lesson_title": lesson["lesson_title"],
                "average_score": lesson["average_score"],
                "reason": "Below passing threshold (60%)"
            })
    
    # Generate recommendations
    recommendations = []
    
    # Recommendation 1: Focus on weakest quiz type
    weakest_type = min(quiz_type_stats.values(), key=lambda x: x["average_score"]) if quiz_type_stats else None
    if weakest_type and weakest_type["average_score"] < 70:
        recommendations.append({
            "type": "quiz_type",
            "priority": "high",
            "message": f"Practice more {weakest_type['display_name']} - current average: {weakest_type['average_score']}%",
            "quiz_type": weakest_type["quiz_type"]
        })
    
    # Recommendation 2: Revisit weak lessons
    if weak_areas:
        top_weak = weak_areas[:3]
        recommendations.append({
            "type": "lesson_review",
            "priority": "high",
            "message": f"Review these lessons: {', '.join([w['lesson_title'] for w in top_weak])}",
            "lessons": [w["lesson_id"] for w in top_weak]
        })
    
    # Recommendation 3: Consistent practice
    if len(quiz_results) < 10:
        recommendations.append({
            "type": "practice_more",
            "priority": "medium",
            "message": "Take more quizzes to build consistency and confidence",
            "current_attempts": len(quiz_results)
        })
    
    return {
        "user_id": user_id,
        "course_id": course_id,
        "course_title": course.title,
        "total_attempts": len(quiz_results),
        "performance_by_type": quiz_type_stats,
        "lesson_performance": lesson_stats,
        "weak_areas": weak_areas,
        "recommendations": recommendations
    }

# Get specific quiz questions for a lesson and quiz type
@router.get("/quiz/{course_id}/{lesson_id}/{quiz_type}")
def get_lesson_quiz(course_id: int, lesson_id: int, quiz_type: str, db: Session = Depends(get_db)):
    """Get quiz questions for a specific lesson and quiz type with randomization"""
    import random
    
    quiz = db.query(Quiz).filter(
        Quiz.course_id == course_id,
        Quiz.lesson_id == lesson_id,
        Quiz.quiz_type == quiz_type
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=404, 
            detail=f"No {quiz_type} quiz found for lesson {lesson_id} in course {course_id}"
        )
    
    # Get all questions for this quiz
    all_questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz.id
    ).order_by(QuizQuestion.question_number).all()
    
    # Define limits per quiz type
    question_limits = {
        "multiple_choice": 10,
        "drag_drop": 5,
        "typing": 5
    }
    
    # Get the limit for this quiz type
    limit = question_limits.get(quiz_type, len(all_questions))
    
    # Randomly select questions up to the limit
    if len(all_questions) > limit:
        selected_questions = random.sample(all_questions, limit)
        # Sort by original question number to maintain some order
        selected_questions.sort(key=lambda q: q.question_number)
    else:
        selected_questions = all_questions
    
    quiz_questions = []
    for idx, q in enumerate(selected_questions, 1):
        # Parse JSON strings safely
        options = []
        drag_items = []
        drop_zones = []
        
        if q.options:
            try:
                options = json.loads(q.options)
            except json.JSONDecodeError:
                options = []
        
        if q.drag_items:
            try:
                drag_items = json.loads(q.drag_items)
            except json.JSONDecodeError:
                drag_items = []
        
        if q.drop_zones:
            try:
                drop_zones = json.loads(q.drop_zones)
            except json.JSONDecodeError:
                drop_zones = []
        
        quiz_questions.append({
            "question_id": q.id,
            "question_number": idx,
            "question": q.question_text,
            "type": q.question_type,
            "options": options,
            "drag_items": drag_items,
            "drop_zones": drop_zones,
            "image": q.media_url,
            "correct_answer": q.correct_answer
        })
    
    return {
        "quiz": {
            "quiz_id": quiz.id,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "quiz_type": quiz_type,
            "title": quiz.title,
            "difficulty": quiz.difficulty,
            "time_limit": quiz.time_limit,
            "total_questions": len(quiz_questions)  
        },
        "questions": quiz_questions
    }

# Submit quiz answers - ENHANCED with question-level tracking
@router.post("/quiz/submit/{quiz_id}/{user_id}")
def submit_quiz(
    quiz_id: int, 
    user_id: int, 
    submission: QuizSubmission,
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate score - NOW SAVES INDIVIDUAL QUESTION RESPONSES"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get questions in the exact order they were presented to the user
    if submission.question_ids:
        questions = []
        for q_id in submission.question_ids:
            question = db.query(QuizQuestion).filter(
                QuizQuestion.id == q_id,
                QuizQuestion.quiz_id == quiz_id
            ).first()
            if question:
                questions.append(question)
    else:
        all_questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id
        ).order_by(QuizQuestion.question_number).all()
        
        question_limits = {
            "multiple_choice": 10,
            "drag_drop": 5,
            "typing": 5
        }
        
        limit = question_limits.get(quiz.quiz_type, len(all_questions))
        questions = all_questions[:limit]
    
    # Validate answer count
    if len(submission.answers) != len(questions):
        raise HTTPException(
            status_code=400, 
            detail=f"Expected {len(questions)} answers, got {len(submission.answers)}. Quiz type: {quiz.quiz_type}"
        )
    
    # Calculate score and prepare individual responses
    correct_count = 0
    question_responses = []
    
    print(f"\n=== QUIZ SUBMISSION DEBUG ===")
    print(f"Quiz Type: {quiz.quiz_type}")
    print(f"Total Questions: {len(questions)}")
    print(f"User Answers: {len(submission.answers)}")
    
    for i, question in enumerate(questions):
        if i >= len(submission.answers):
            continue
            
        user_answer = submission.answers[i]
        is_correct = False
        
        print(f"\n--- Question {i+1} ---")
        print(f"Question ID: {question.id}")
        print(f"Question Type: {question.question_type}")
        print(f"Correct Answer (DB): {repr(question.correct_answer)}")
        print(f"User Answer (Frontend): {repr(user_answer)}")
        
        # Handle null/empty answers
        if user_answer is None or user_answer == "":
            print("❌ User answer is empty")
        elif question.question_type == "multiple_choice" or question.question_type == "image_mcq":
            # Enhanced image MCQ comparison
            if isinstance(user_answer, dict) and "image" in user_answer:
                user_answer = user_answer["image"]
                print(f"Extracted image from dict: {user_answer}")
            
            correct_answer = str(question.correct_answer)
            user_answer_str = str(user_answer)
            
            print(f"Comparing - Correct: '{correct_answer}', User: '{user_answer_str}'")
            
            # Try multiple comparison strategies
            # Strategy 1: Direct comparison
            if user_answer_str.lower().strip() == correct_answer.lower().strip():
                is_correct = True
                print("✅ Match Strategy 1: Direct comparison")
            
            # Strategy 2: Filename comparison
            elif "/" in correct_answer or "/" in user_answer_str:
                correct_filename = correct_answer.split("/")[-1] if "/" in correct_answer else correct_answer
                user_filename = user_answer_str.split("/")[-1] if "/" in user_answer_str else user_answer_str
                
                if correct_filename.lower().strip() == user_filename.lower().strip():
                    is_correct = True
                    print("✅ Match Strategy 2: Filename comparison")
            
            # Strategy 3: Contains comparison
            if not is_correct:
                if correct_answer.lower() in user_answer_str.lower() or user_answer_str.lower() in correct_answer.lower():
                    is_correct = True
                    print("✅ Match Strategy 3: Contains comparison")
            
            if is_correct:
                correct_count += 1
                print(f"🎉 Question {i+1}: CORRECT")
            else:
                print(f"❌ Question {i+1}: INCORRECT")
        
        elif question.question_type == "typing":
            if isinstance(user_answer, str):
                user_text = user_answer.lower().strip()
                correct_text = str(question.correct_answer).lower().strip()
                
                if user_text == correct_text:
                    is_correct = True
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT")
                else:
                    print(f"❌ Question {i+1}: INCORRECT")
        
        elif question.question_type == "drag_drop":
            try:
                if isinstance(question.correct_answer, str):
                    expected_mapping = json.loads(question.correct_answer)
                else:
                    expected_mapping = question.correct_answer
                
                if user_answer == expected_mapping:
                    is_correct = True
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT")
                else:
                    print(f"❌ Question {i+1}: INCORRECT")
            except (json.JSONDecodeError, TypeError) as e:
                if str(user_answer) == str(question.correct_answer):
                    is_correct = True
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT (fallback)")
        
        # Store individual question response data
        question_responses.append({
            "question_id": question.id,
            "selected_answer": json.dumps(user_answer) if not isinstance(user_answer, str) else user_answer,
            "is_correct": is_correct,
            "time_taken": None  # Can be enhanced later if frontend tracks per-question time
        })
    
    percentage = (correct_count / len(questions)) * 100 if len(questions) > 0 else 0
    time_taken = max(0, submission.time_taken or 0)
    
    print(f"\n=== FINAL RESULTS ===")
    print(f"Correct: {correct_count}/{len(questions)}")
    print(f"Percentage: {percentage}%")
    print(f"========================\n")
    
    # Save quiz result
    quiz_result = QuizResult(
        user_id=user_id,
        quiz_id=quiz_id,
        course_id=quiz.course_id,
        lesson_id=quiz.lesson_id,
        quiz_type=quiz.quiz_type,
        score=correct_count,
        total_questions=len(questions),
        percentage=percentage,
        time_taken=time_taken,
        answers=json.dumps(submission.answers)
    )
    
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)
    
    # NEW: Save individual question responses
    for response_data in question_responses:
        question_response = QuizQuestionResponse(
            user_id=user_id,
            quiz_result_id=quiz_result.id,
            question_id=response_data["question_id"],
            selected_answer=response_data["selected_answer"],
            is_correct=response_data["is_correct"],
            time_taken=response_data["time_taken"]
        )
        db.add(question_response)
    
    db.commit()
    
    print(f"✅ Saved {len(question_responses)} individual question responses")
    
    return {
        "result_id": quiz_result.id,
        "quiz_type": quiz.quiz_type,
        "score": correct_count,
        "total_questions": len(questions),
        "percentage": round(percentage, 2),
        "time_taken": time_taken,
        "passed": percentage >= 60
    }

# NEW ENDPOINT: Get questions for a specific quiz attempt
@router.get("/quiz/questions/{quiz_result_id}")
def get_quiz_attempt_questions(quiz_result_id: int, db: Session = Depends(get_db)):
    """
    Get all questions for a specific quiz attempt.
    Returns question text, options, correct answer, and metadata.
    """
    # Get the quiz result
    quiz_result = db.query(QuizResult).filter(QuizResult.id == quiz_result_id).first()
    if not quiz_result:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    
    # Get all question responses for this attempt
    responses = db.query(QuizQuestionResponse).filter(
        QuizQuestionResponse.quiz_result_id == quiz_result_id
    ).all()
    
    if not responses:
        raise HTTPException(status_code=404, detail="No question responses found for this quiz attempt")
    
    # Get full question details
    questions_data = []
    for response in responses:
        question = db.query(QuizQuestion).filter(QuizQuestion.id == response.question_id).first()
        if not question:
            continue
        
        # Parse options safely
        options = []
        if question.options:
            try:
                options = json.loads(question.options) if isinstance(question.options, str) else question.options
            except json.JSONDecodeError:
                options = []
        
        # Parse drag items and drop zones if applicable
        drag_items = []
        drop_zones = []
        if question.drag_items:
            try:
                drag_items = json.loads(question.drag_items) if isinstance(question.drag_items, str) else question.drag_items
            except json.JSONDecodeError:
                drag_items = []
        
        if question.drop_zones:
            try:
                drop_zones = json.loads(question.drop_zones) if isinstance(question.drop_zones, str) else question.drop_zones
            except json.JSONDecodeError:
                drop_zones = []
        
        questions_data.append({
            "question_id": question.id,
            "question_number": question.question_number,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "options": options,
            "drag_items": drag_items,
            "drop_zones": drop_zones,
            "correct_answer": question.correct_answer,
            "media_url": question.media_url
        })
    
    return {
        "quiz_result_id": quiz_result_id,
        "quiz_type": quiz_result.quiz_type,
        "lesson_id": quiz_result.lesson_id,
        "total_questions": len(questions_data),
        "questions": questions_data
    }

# NEW ENDPOINT: Get user's responses for a specific quiz attempt
@router.get("/quiz/responses/{quiz_result_id}")
def get_quiz_attempt_responses(quiz_result_id: int, db: Session = Depends(get_db)):
    """
    Get user's responses for a specific quiz attempt.
    Includes selected answers and correctness for each question.
    """
    # Verify quiz result exists
    quiz_result = db.query(QuizResult).filter(QuizResult.id == quiz_result_id).first()
    if not quiz_result:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    
    # Get all responses
    responses = db.query(QuizQuestionResponse).filter(
        QuizQuestionResponse.quiz_result_id == quiz_result_id
    ).order_by(QuizQuestionResponse.id).all()
    
    if not responses:
        raise HTTPException(status_code=404, detail="No responses found for this quiz attempt")
    
    responses_data = []
    for response in responses:
        # Parse selected_answer if it's JSON
        selected_answer = response.selected_answer
        try:
            selected_answer = json.loads(response.selected_answer) if isinstance(response.selected_answer, str) and response.selected_answer.startswith(('[', '{')) else response.selected_answer
        except json.JSONDecodeError:
            pass  # Keep as string if not valid JSON
        
        responses_data.append({
            "question_id": response.question_id,
            "selected_answer": selected_answer,
            "is_correct": response.is_correct,
            "time_taken": response.time_taken,
            "timestamp": response.timestamp.isoformat() if response.timestamp else None
        })
    
    return {
        "quiz_result_id": quiz_result_id,
        "user_id": quiz_result.user_id,
        "quiz_type": quiz_result.quiz_type,
        "overall_score": quiz_result.score,
        "total_questions": quiz_result.total_questions,
        "percentage": quiz_result.percentage,
        "responses": responses_data
    }

# NEW ENDPOINT: Get attempt history for a specific quiz (lesson + quiz_type)
@router.get("/quiz/attempt-history/{user_id}/{lesson_id}/{quiz_type}")
def get_quiz_attempt_history(user_id: int, lesson_id: int, quiz_type: str, db: Session = Depends(get_db)):
    """
    Get all attempts for a specific quiz (identified by lesson_id and quiz_type).
    Returns attempts ordered chronologically to show progression over time.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all attempts for this specific quiz
    attempts = db.query(QuizResult).filter(
        QuizResult.user_id == user_id,
        QuizResult.lesson_id == lesson_id,
        QuizResult.quiz_type == quiz_type
    ).order_by(QuizResult.completed_at.asc()).all()  # Chronological order
    
    if not attempts:
        return {
            "user_id": user_id,
            "lesson_id": lesson_id,
            "quiz_type": quiz_type,
            "total_attempts": 0,
            "attempts": []
        }
    
    attempts_data = []
    for idx, attempt in enumerate(attempts, 1):
        # Calculate improvement from previous attempt
        improvement = None
        if idx > 1:
            previous_percentage = attempts[idx - 2].percentage
            improvement = round(attempt.percentage - previous_percentage, 2)
        
        attempts_data.append({
            "attempt_number": idx,
            "result_id": attempt.id,
            "score": attempt.score,
            "total_questions": attempt.total_questions,
            "percentage": round(attempt.percentage, 2),
            "time_taken": attempt.time_taken,
            "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
            "passed": attempt.percentage >= 60,
            "improvement": improvement
        })
    
    # Calculate overall statistics
    best_score = max(attempt.percentage for attempt in attempts)
    average_score = sum(attempt.percentage for attempt in attempts) / len(attempts)
    total_improvement = attempts[-1].percentage - attempts[0].percentage if len(attempts) > 1 else 0
    
    return {
        "user_id": user_id,
        "lesson_id": lesson_id,
        "quiz_type": quiz_type,
        "total_attempts": len(attempts),
        "best_score": round(best_score, 2),
        "average_score": round(average_score, 2),
        "latest_score": round(attempts[-1].percentage, 2),
        "total_improvement": round(total_improvement, 2),
        "attempts": attempts_data
    }


# Get user's quiz attempts/results for a specific quiz
@router.get("/quiz/results/{user_id}/{quiz_id}")
def get_quiz_results(user_id: int, quiz_id: int, db: Session = Depends(get_db)):
    """Get all attempts for a specific quiz by a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    results = db.query(QuizResult).filter(
        QuizResult.user_id == user_id,
        QuizResult.quiz_id == quiz_id
    ).order_by(QuizResult.completed_at.desc()).all()
    
    attempts = []
    for result in results:
        attempts.append({
            "result_id": result.id,
            "score": result.score,
            "total_questions": result.total_questions,
            "percentage": round(result.percentage, 2),
            "time_taken": result.time_taken,
            "completed_at": result.completed_at.isoformat() if result.completed_at else None
        })
    
    return {
        "user_id": user_id,
        "quiz_id": quiz_id,
        "quiz_title": quiz.title,
        "quiz_type": quiz.quiz_type,
        "attempts": attempts
    }

# Get all quiz results for a user (across all courses)
@router.get("/quiz/results/{user_id}")
def get_user_quiz_results(user_id: int, db: Session = Depends(get_db)):
    """Get all quiz results for a user across all courses"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    results = db.query(QuizResult).filter(
        QuizResult.user_id == user_id
    ).order_by(QuizResult.completed_at.desc()).all()
    
    user_results = []
    for result in results:
        user_results.append({
            "result_id": result.id,
            "quiz_id": result.quiz_id,
            "quiz_title": result.quiz.title,
            "quiz_type": result.quiz_type,
            "course_id": result.course_id,
            "lesson_id": result.lesson_id,
            "score": result.score,
            "total_questions": result.total_questions,
            "percentage": round(result.percentage, 2),
            "time_taken": result.time_taken,
            "completed_at": result.completed_at.isoformat() if result.completed_at else None
        })
    
    return {
        "user_id": user_id,
        "username": user.username,
        "total_quiz_attempts": len(user_results),
        "results": user_results
    }

# Get quiz statistics for a specific quiz
@router.get("/quiz/stats/{quiz_id}")
def get_quiz_stats(quiz_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific quiz"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    results = db.query(QuizResult).filter(QuizResult.quiz_id == quiz_id).all()
    
    if not results:
        return {
            "quiz_id": quiz_id,
            "quiz_title": quiz.title,
            "total_attempts": 0,
            "unique_users": 0,
            "average_score": 0,
            "average_percentage": 0,
            "pass_rate": 0
        }
    
    total_attempts = len(results)
    unique_users = len(set(r.user_id for r in results))
    average_score = sum(r.score for r in results) / total_attempts
    average_percentage = sum(r.percentage for r in results) / total_attempts
    passed_attempts = len([r for r in results if r.percentage >= 60])
    pass_rate = (passed_attempts / total_attempts) * 100
    
    return {
        "quiz_id": quiz_id,
        "quiz_title": quiz.title,
        "quiz_type": quiz.quiz_type,
        "total_attempts": total_attempts,
        "unique_users": unique_users,
        "average_score": round(average_score, 2),
        "average_percentage": round(average_percentage, 2),
        "pass_rate": round(pass_rate, 2)
    }