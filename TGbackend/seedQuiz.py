import os
import json
from sqlalchemy.orm import Session, sessionmaker
from TGbackend.database import engine
from TGbackend.models import Quiz, QuizQuestion, Course, Lesson

# Base paths for images
BASE_QUIZ_IMG_PATH = "/images/assessments_quizzes/"

SEED_FOLDER = os.path.join(os.path.dirname(__file__), "seed_quiz_data")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_image_path(filename: str, base_path: str) -> str:
    """Prefix image filename with base path if not already a full URL/path."""
    if not filename:
        return ""
    if filename.startswith("/") or filename.startswith("http"):
        return filename
    return f"{base_path}{filename}"

def load_json_files(folder_path):
    """Load all JSON files recursively from folder."""
    json_files = []
    for root, _, files in os.walk(folder_path):
        for f in files:
            if f.endswith(".json"):
                path = os.path.join(root, f)
                try:
                    with open(path, "r", encoding="utf-8") as file:
                        data = json.load(file)
                        json_files.append((path, data))
                        print(f"Loaded {f}")
                except Exception as e:
                    print(f"Error loading {f}: {e}")
    return json_files

def process_quiz_question_data(q):
    """Process question data to handle images and options properly."""
    processed_q = q.copy()
    
    # Handle main question image
    if q.get("image"):
        processed_q["image"] = add_image_path(q["image"], BASE_QUIZ_IMG_PATH)
    
    # Handle options based on question type
    if q.get("options"):
        options = q.get("options", [])
        processed_options = []
        
        question_type = q.get("type", q.get("quiz_type", ""))
        
        if question_type in ["multiple_choice", "image_mcq"]:
            # Handle image options for multiple choice questions
            for opt in options:
                if isinstance(opt, dict) and "image" in opt:
                    # This is an image option
                    processed_opt = opt.copy()
                    processed_opt["image"] = add_image_path(opt["image"], BASE_QUIZ_IMG_PATH)
                    processed_options.append(processed_opt)
                else:
                    # Regular text option
                    processed_options.append(opt)
        else:
            # For other question types, keep options as-is
            processed_options = options
        
        processed_q["options"] = processed_options
    
    # Handle answer field for image questions
    if q.get("answer") and question_type in ["multiple_choice", "image_mcq"]:
        answer = q.get("answer")
        # If answer looks like an image filename, add path
        if isinstance(answer, str) and answer.endswith(('.png', '.jpg', '.jpeg', '.gif')):
            processed_q["answer"] = add_image_path(answer,BASE_QUIZ_IMG_PATH)
    
    return processed_q

def insert_or_update_quiz(db: Session, course_id, lesson_id, quiz_type, questions, lesson_title):
    """Insert quiz and quiz questions with proper image handling."""
    # Check if quiz exists
    quiz = db.query(Quiz).filter_by(
        course_id=course_id,
        lesson_id=lesson_id,
        quiz_type=quiz_type
    ).first()
    
    if not quiz:
        quiz_titles = {
            'multiple_choice': f'{lesson_title} - Image Recognition Quiz',
            'drag_drop': f'{lesson_title} - Drag & Drop Challenge',
            'typing': f'{lesson_title} - Typing Practice Quiz'
        }
        quiz_title = quiz_titles.get(quiz_type, f'{lesson_title} - {quiz_type.title()} Quiz')

        quiz = Quiz(
            course_id=course_id,
            lesson_id=lesson_id,
            title=quiz_title,
            quiz_type=quiz_type,
            total_questions=len(questions)
        )
        db.add(quiz)
        db.flush()
        print(f"Created quiz {quiz_title} with {len(questions)} questions")
    else:
        print(f"Quiz {quiz_type} for lesson {lesson_id} already exists, skipping creation")
        return  # Skip if quiz already exists to avoid duplicates

    # Add questions with proper image processing
    for idx, q in enumerate(questions, 1):
        # Process the question data to handle images
        processed_q = process_quiz_question_data(q)
        
        print(f"Processing question {idx}: {processed_q.get('question', 'No question text')}")
        print(f"Question type: {processed_q.get('type', 'No type')}")
        
        # Handle drag_items and drop_zones properly
        drag_items_json = None
        drop_zones_json = None
        options_json = None
        
        # Convert drag_items to JSON string if present
        if processed_q.get("drag_items"):
            drag_items_json = json.dumps(processed_q.get("drag_items"))
            print(f"Drag items: {drag_items_json}")
        
        # Convert drop_zones to JSON string if present
        if processed_q.get("drop_zones"):
            drop_zones_json = json.dumps(processed_q.get("drop_zones"))
            print(f"Drop zones: {drop_zones_json}")
        
        # Convert options to JSON string if present
        if processed_q.get("options"):
            options_json = json.dumps(processed_q.get("options"))
            print(f"Processed options: {options_json}")
        
        # Handle media URL (main question image)
        media_url = processed_q.get("image", "")
        
        quiz_question = QuizQuestion(
            quiz_id=quiz.id,
            course_id=course_id,
            lesson_id=lesson_id,
            question_number=idx,
            question_text=processed_q.get("question", ""),
            question_type=processed_q.get("type", "multiple_choice"),
            correct_answer=processed_q.get("answer", ""),
            options=options_json,
            drag_items=drag_items_json,
            drop_zones=drop_zones_json,
            media_url=media_url
        )
        db.add(quiz_question)
        print(f"Added question {idx} with media_url: {media_url}")

def seed_quizzes():
    db = SessionLocal()
    try:
        json_files = load_json_files(SEED_FOLDER)
        
        for path, data in json_files:
            print(f"\nProcessing file: {os.path.basename(path)}")
            
            if isinstance(data, list):
                # Assuming all quiz JSONs are arrays of questions
                if data and "lesson_id" in data[0] and "course_id" in data[0]:
                    course_id = data[0]["course_id"]
                    lesson_id = data[0]["lesson_id"]
                    lesson = db.query(Lesson).filter_by(id=lesson_id, course_id=course_id).first()
                    if not lesson:
                        print(f"Lesson {lesson_id} not found for course {course_id}, skipping {path}")
                        continue
                    lesson_title = lesson.title
                    
                    # Group questions by type
                    quiz_groups = {}
                    for q in data:
                        qt = q.get("quiz_type", q.get("type", "multiple_choice"))
                        quiz_groups.setdefault(qt, []).append(q)
                    
                    # Insert quizzes
                    for qt, qs in quiz_groups.items():
                        print(f"Inserting {len(qs)} questions for quiz type: {qt}")
                        insert_or_update_quiz(db, course_id, lesson_id, qt, qs, lesson_title)
                else:
                    print(f"Missing course_id or lesson_id in first question, skipping {path}")
            else:
                print(f"Skipping invalid JSON format: {path}")
        
        db.commit()
        print("\n✅ All quizzes seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding quizzes: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_quizzes()