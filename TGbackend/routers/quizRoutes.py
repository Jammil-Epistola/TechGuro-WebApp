# quizRoutes.py -CURRENT VERSION
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from TGbackend.database import get_db
from TGbackend.models import Quiz, QuizQuestion, QuizResult, User, Course, Lesson
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
# Submit quiz answers
@router.post("/quiz/submit/{quiz_id}/{user_id}")
def submit_quiz(
    quiz_id: int, 
    user_id: int, 
    submission: QuizSubmission,
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate score"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get questions in the exact order they were presented to the user
    if submission.question_ids:
        # Use the question IDs provided by the frontend to maintain order
        questions = []
        for q_id in submission.question_ids:
            question = db.query(QuizQuestion).filter(
                QuizQuestion.id == q_id,
                QuizQuestion.quiz_id == quiz_id
            ).first()
            if question:
                questions.append(question)
    else:
        # Fallback: Use the same logic as the GET endpoint
        all_questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id
        ).order_by(QuizQuestion.question_number).all()
        
        question_limits = {
            "multiple_choice": 10,
            "drag_drop": 5,
            "typing": 5
        }
        
        limit = question_limits.get(quiz.quiz_type, len(all_questions))
        questions = all_questions[:limit]  # Take first N questions
    
    # Validate answer count
    if len(submission.answers) != len(questions):
        raise HTTPException(
            status_code=400, 
            detail=f"Expected {len(questions)} answers, got {len(submission.answers)}. Quiz type: {quiz.quiz_type}"
        )
    
    # Calculate score with enhanced debugging
    correct_count = 0
    
    print(f"\n=== QUIZ SUBMISSION DEBUG ===")
    print(f"Quiz Type: {quiz.quiz_type}")
    print(f"Total Questions: {len(questions)}")
    print(f"User Answers: {len(submission.answers)}")
    
    for i, question in enumerate(questions):
        if i >= len(submission.answers):
            continue
            
        user_answer = submission.answers[i]
        
        print(f"\n--- Question {i+1} ---")
        print(f"Question ID: {question.id}")
        print(f"Question Type: {question.question_type}")
        print(f"Correct Answer (DB): {repr(question.correct_answer)}")
        print(f"User Answer (Frontend): {repr(user_answer)}")
        
        # Handle null/empty answers
        if user_answer is None or user_answer == "":
            print("❌ User answer is empty")
            continue
            
        if question.question_type == "multiple_choice" or question.question_type == "image_mcq":
            # Enhanced image MCQ comparison
            original_user_answer = user_answer
            
            # Handle case where frontend sends dict with image key
            if isinstance(user_answer, dict) and "image" in user_answer:
                user_answer = user_answer["image"]
                print(f"Extracted image from dict: {user_answer}")
            
            # Get the correct answer (handle different storage formats)
            correct_answer = str(question.correct_answer)
            user_answer_str = str(user_answer)
            
            print(f"Comparing - Correct: '{correct_answer}', User: '{user_answer_str}'")
            
            # Try multiple comparison strategies
            is_correct = False
            
            # Strategy 1: Direct comparison
            if user_answer_str.lower().strip() == correct_answer.lower().strip():
                is_correct = True
                print("✅ Match Strategy 1: Direct comparison")
            
            # Strategy 2: Filename comparison (extract just the filename)
            elif "/" in correct_answer or "/" in user_answer_str:
                correct_filename = correct_answer.split("/")[-1] if "/" in correct_answer else correct_answer
                user_filename = user_answer_str.split("/")[-1] if "/" in user_answer_str else user_answer_str
                
                print(f"Filename comparison - Correct: '{correct_filename}', User: '{user_filename}'")
                
                if correct_filename.lower().strip() == user_filename.lower().strip():
                    is_correct = True
                    print("✅ Match Strategy 2: Filename comparison")
            
            # Strategy 3: Check if user answer contains correct answer or vice versa
            if not is_correct:
                if correct_answer.lower() in user_answer_str.lower() or user_answer_str.lower() in correct_answer.lower():
                    is_correct = True
                    print("✅ Match Strategy 3: Contains comparison")
            
            # Strategy 4: For image options, check against all possible option values
            if not is_correct and question.options:
                try:
                    options = json.loads(question.options) if isinstance(question.options, str) else question.options
                    print(f"Available options: {options}")
                    
                    for opt in options:
                        if isinstance(opt, dict) and "image" in opt:
                            opt_image = str(opt["image"])
                            if opt_image == user_answer_str:
                                # Now check if this option is the correct one
                                if opt_image == correct_answer or opt_image.split("/")[-1] == correct_answer.split("/")[-1]:
                                    is_correct = True
                                    print("✅ Match Strategy 4: Option validation")
                                    break
                        elif str(opt) == user_answer_str:
                            if str(opt) == correct_answer:
                                is_correct = True
                                print("✅ Match Strategy 4: Text option validation")
                                break
                except Exception as e:
                    print(f"Error parsing options: {e}")
            
            if is_correct:
                correct_count += 1
                print(f"🎉 Question {i+1}: CORRECT")
            else:
                print(f"❌ Question {i+1}: INCORRECT")
                print(f"   Final comparison: '{correct_answer.lower().strip()}' vs '{user_answer_str.lower().strip()}'")
        
        elif question.question_type == "typing":
            # Case-insensitive comparison for typing
            if isinstance(user_answer, str):
                user_text = user_answer.lower().strip()
                correct_text = str(question.correct_answer).lower().strip()
                
                print(f"Typing comparison: '{user_text}' vs '{correct_text}'")
                
                if user_text == correct_text:
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT")
                else:
                    print(f"❌ Question {i+1}: INCORRECT")
        
        elif question.question_type == "drag_drop":
            # Check if drag-drop mapping is correct
            try:
                if isinstance(question.correct_answer, str):
                    expected_mapping = json.loads(question.correct_answer)
                else:
                    expected_mapping = question.correct_answer
                
                print(f"Drag-drop comparison: {user_answer} vs {expected_mapping}")
                
                if user_answer == expected_mapping:
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT")
                else:
                    print(f"❌ Question {i+1}: INCORRECT")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error parsing drag_drop answer: {e}")
                if str(user_answer) == str(question.correct_answer):
                    correct_count += 1
                    print(f"🎉 Question {i+1}: CORRECT (fallback)")
                else:
                    print(f"❌ Question {i+1}: INCORRECT (fallback)")
    
    percentage = (correct_count / len(questions)) * 100 if len(questions) > 0 else 0
    
    print(f"\n=== FINAL RESULTS ===")
    print(f"Correct: {correct_count}/{len(questions)}")
    print(f"Percentage: {percentage}%")
    print(f"========================\n")
    
    # Ensure time_taken is valid
    time_taken = max(0, submission.time_taken or 0)
    
    # Save result
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
    
    return {
        "result_id": quiz_result.id,
        "quiz_type": quiz.quiz_type,
        "score": correct_count,
        "total_questions": len(questions),
        "percentage": round(percentage, 2),
        "time_taken": time_taken,
        "passed": percentage >= 60
    }

# Get user's quiz attempts/results for a specific quiz
@router.get("/quiz/results/{user_id}/{quiz_id}")
def get_quiz_results(user_id: int, quiz_id: int, db: Session = Depends(get_db)):
    """Get all attempts for a specific quiz by a user"""
    # Verify user and quiz exist
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