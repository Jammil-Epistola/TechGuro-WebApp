# seedCourse.py
import os
import json
from sqlalchemy.orm import Session
from TGbackend.database import SessionLocal, engine
from TGbackend.models import Base, Course, Lesson, LessonSlides, Question

# Base paths for images
from TGbackend.seeders.cloudinary_helper import (
    add_image_path as cloudinary_add_path,
    course_icon_url,
    assessment_image_url,
    lesson_image_url
)

# Course-Lesson ID mapping to enforce correct lesson ID ranges
COURSE_LESSON_ID_MAPPING = {
    "computer_basics": {
        "course_id": 1,          
        "course_order": 1, 
        "lesson_id_start": 1
    },
    "internet_safety": {
        "course_id": 2,        
        "course_order": 2, 
        "lesson_id_start": 6
    }, 
    "digi_communication": {
        "course_id": 3,
        "course_order": 3,           
        "lesson_id_start": 11
    }
}

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

SEED_FOLDER = os.path.join(os.path.dirname(__file__), "seed_course_data")


def add_image_path(filename: str, image_type: str) -> str:
    """
    Convert filename to Cloudinary URL based on image type.
    
    Args:
        filename: Image filename (e.g., "python.png")
        image_type: Type of image - "course", "assessment", or "lesson"
    
    Returns:
        Full Cloudinary URL
    """
    if not filename:
        return ""
    if filename.startswith("http"):
        return filename
    
    # Map image types to helper functions
    if image_type == "course":
        return course_icon_url(filename)
    elif image_type == "assessment":
        return assessment_image_url(filename)
    elif image_type == "lesson":
        return lesson_image_url(filename)
    else:
        # Fallback to assessment
        return assessment_image_url(filename)


def get_course_key_from_filename(filename):
    """Extract course key from filename"""
    filename_lower = filename.lower()
    if "computer_basics" in filename_lower:
        return "computer_basics"
    elif "internet_safety" in filename_lower:
        return "internet_safety"
    elif "digi_communication" in filename_lower:
        return "digi_communication"
    return None


def load_json_files(folder_path):
    """Load all JSON files from a folder, separated by type."""
    json_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    course_files = []
    question_files = []

    for file_name in json_files:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                
                # Categorize files based on structure
                if isinstance(data, dict) and "lessons" in data:
                    course_files.append((file_name, data))
                    print(f"✅ Loaded course file: {file_name}")
                elif isinstance(data, list):
                    question_files.append((file_name, data))
                    print(f"✅ Loaded question file: {file_name}")
                else:
                    print(f"⚠️ Unknown file structure: {file_name}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing {file_name}: {e}")
                
    return course_files, question_files


def get_title(data, filename: str, level: str) -> str:
    """Get a title safely depending on the JSON structure level."""
    if not isinstance(data, dict):
        raise ValueError(f"Expected a dict for {level} in {filename}, got {type(data).__name__}")

    key_map = {
        "course": ["course_title", "course_name", "title"],
        "lesson": ["lesson_title", "title"],
        "slide": ["slide_title", "title"]
    }

    for key in key_map.get(level, ["title"]):
        if data.get(key):
            return data[key]

    raise ValueError(f"Missing title for {level} in {filename}")


def insert_or_update_question(session, q_data, lesson_id=None, course_id=None, filename=None):
    """Insert or update a question with proper handling for all 3 question types."""
    if not isinstance(q_data, dict):
        print(f"⚠️ Skipping malformed question in {filename}: {q_data}")
        return

    # Get basic question info
    final_course_id = q_data.get("course_id", course_id)
    final_lesson_id = q_data.get("lesson_id", lesson_id)
    final_type = q_data.get("type", "text_mcq")
    final_assessment_type = q_data.get("assessment_type")
    question_text = q_data.get("question", "")
    
    # Handle main question image
    main_image = q_data.get("image", "")
    if main_image:
        main_image = add_image_path(main_image, "assessment")

    # Process options and correct answer based on question type
    options = q_data.get("options", [])
    
    if final_type == "text_mcq" or final_type == "true_false":
        # Simple text options - keep as is
        final_options = json.dumps(options)
        final_correct = q_data.get("answer", "")
        
    elif final_type == "image_mcq":
        # Handle image options - add image paths
        processed_options = []
        for opt in options:
                if isinstance(opt, dict) and "image" in opt:
                    processed_options.append({
                        "image": add_image_path(opt["image"], "assessment")
                    })
                else:
                    processed_options.append(opt)
            
        final_options = json.dumps(processed_options)
        
        # For image MCQ, correct answer comes from answer_image field
        answer_image = q_data.get("answer_image", "")
        if answer_image:
            final_correct = add_image_path(answer_image, "assessment")
        else:
            final_correct = q_data.get("answer", "")
    else:
        final_options = json.dumps(options)
        final_correct = q_data.get("answer", "")

    # Check if question already exists
    existing_q = session.query(Question).filter_by(
        text=question_text,
        course_id=final_course_id,
        lesson_id=final_lesson_id
    ).first()

    if existing_q:
        existing_q.type = final_type
        existing_q.assessment_type = final_assessment_type
        existing_q.options = final_options
        existing_q.correct_answer = final_correct
        if hasattr(existing_q, 'media_url'):
            existing_q.media_url = main_image
        print(f"🔄 Updated {final_type} Q in {filename} → course {final_course_id}, lesson {final_lesson_id or 'None'}")
    else:
        q_kwargs = dict(
            lesson_id=final_lesson_id,
            course_id=final_course_id,
            text=question_text,
            type=final_type,
            assessment_type=final_assessment_type,
            options=final_options,
            correct_answer=final_correct
        )
        
        # Add media_url if the model supports it
        if hasattr(Question, 'media_url'):
            q_kwargs["media_url"] = main_image
            
        session.add(Question(**q_kwargs))
        print(f"➕ Inserted {final_type} Q in {filename} → course {final_course_id}, lesson {final_lesson_id or 'None'}")


def insert_or_update_slide(session, slide_data, lesson_id=None, filename=None):
    """Insert or update a lesson slide with TTS and layout support."""
    if not isinstance(slide_data, dict):
        print(f"⚠️ Skipping malformed slide in {filename}: {slide_data}")
        return

    slide_number = slide_data.get("slide_number")
    if slide_number is None:
        print(f"⚠️ Missing slide_number in {filename}, skipping slide for lesson_id={lesson_id}")
        return

    existing_slide = session.query(LessonSlides).filter_by(
        lesson_id=lesson_id,
        slide_number=slide_number
    ).first()

    content_text = slide_data.get("content", "")
    if isinstance(content_text, list):
        content_text = "\n".join(content_text)  # Flatten list

    tts_text = slide_data.get("tts_text")
    layout_type = slide_data.get("layout_type", "default")
    
    # Convert media_url to Cloudinary URL
    slide_media_url = slide_data.get("media_url", "")
    if slide_media_url:
        slide_media_url = add_image_path(slide_media_url, "lesson")

    if existing_slide:
        existing_slide.content = content_text
        existing_slide.media_url = slide_media_url
        print(f"🔄 Updated slide #{slide_number} for lesson {lesson_id}")
    else:
        slide_kwargs = dict(
            lesson_id=lesson_id,
            slide_number=slide_number,
            content=content_text,
            media_url=slide_media_url
        )
        
        session.add(LessonSlides(**slide_kwargs))
        print(f"➕ Inserted slide #{slide_number} for lesson {lesson_id}")


def seed_courses(session: Session, filename: str, data):
    """Seed courses and lessons with enforced lesson ID ranges."""
    if not isinstance(data, dict):
        print(f"⚠️ Skipping {filename}, expected course object structure.")
        return

    # Get course configuration
    course_key = get_course_key_from_filename(filename)
    if not course_key or course_key not in COURSE_LESSON_ID_MAPPING:
        print(f"⚠️ Unknown course type in {filename}, using default behavior")
        _seed_courses_original(session, filename, data)
        return
        
    config = COURSE_LESSON_ID_MAPPING[course_key]
    lesson_id_counter = config["lesson_id_start"]
    expected_course_id = config["course_id"] 

    # --- COURSE ---
    course_title = get_title(data, filename, "course")
    course_desc = data.get("description", "")
    course_image = add_image_path(data.get("image_url", ""), "course")
    
    # NEW: Get sources from JSON (no attribution field)
    course_sources = data.get("sources")  # This will be stored as JSON

    course = session.query(Course).filter_by(id=expected_course_id).first()
    if not course:
        # Create course with specific ID and sources
        course = Course(
            id=expected_course_id,
            title=course_title, 
            description=course_desc,
            image_url=course_image,
            sources=course_sources  # NEW: Store sources as JSON
        )
        session.add(course)
        session.flush()
        print(f"➕ Inserted course: {course_title} (ID: {course.id}) with {len(course_sources) if course_sources else 0} sources")
    else:
        course.title = course_title
        course.description = course_desc
        course.image_url = course_image
        course.sources = course_sources  # NEW: Update sources
        print(f"🔄 Updated course: {course_title} (ID: {course.id}) with {len(course_sources) if course_sources else 0} sources")

    # --- LESSONS with enforced IDs ---
    for lesson_data in data.get("lessons", []):
        if not isinstance(lesson_data, dict):
            print(f"⚠️ Skipping malformed lesson in {filename}: {lesson_data}")
            continue

        lesson_title = get_title(lesson_data, filename, "lesson")
        lesson_media = lesson_data.get("media", "")
        if isinstance(lesson_media, str) and lesson_media.endswith((".png", ".jpg", ".jpeg", ".gif")):
            lesson_media = add_image_path(lesson_media, "lesson")

        # Check if lesson with this specific ID already exists
        existing_lesson = session.query(Lesson).filter_by(id=lesson_id_counter).first()
        
        if existing_lesson:
            # Update existing lesson
            existing_lesson.course_id = course.id
            existing_lesson.title = lesson_title
            existing_lesson.content = lesson_data.get("content", "")
            existing_lesson.media_url = lesson_media
            lesson = existing_lesson
            print(f"🔄 Updated lesson: {lesson_title} (ID: {lesson_id_counter}) → Course {course.id}")
        else:
            # Create new lesson with specific ID
            lesson = Lesson(
                id=lesson_id_counter,
                course_id=course.id,
                title=lesson_title,
                content=lesson_data.get("content", ""),
                media_url=lesson_media
            )
            session.add(lesson)
            session.flush()
            print(f"➕ Inserted lesson: {lesson_title} (ID: {lesson_id_counter}) → Course {course.id}")

        # --- SLIDES ---
        for slide_data in lesson_data.get("slides", []):
            insert_or_update_slide(session, slide_data, lesson_id=lesson.id, filename=filename)
        
        lesson_id_counter += 1  # Increment for next lesson


def _seed_courses_original(session: Session, filename: str, data):
    """Original course seeding logic as fallback."""
    course_title = get_title(data, filename, "course")
    course_desc = data.get("description", "")
    course_image = add_image_path(data.get("image_url", ""), "course")

    course = session.query(Course).filter_by(title=course_title).first()
    if not course:
        course = Course(title=course_title, description=course_desc, image_url=course_image)
        session.add(course)
        session.flush()
        print(f"➕ Inserted course: {course_title} (ID: {course.id})")
    else:
        course.description = course_desc
        course.image_url = course_image
        print(f"🔄 Updated course: {course_title} (ID: {course.id})")

    for lesson_data in data.get("lessons", []):
        if not isinstance(lesson_data, dict):
            continue

        lesson_title = get_title(lesson_data, filename, "lesson")
        lesson_media = lesson_data.get("media", "")
        if isinstance(lesson_media, str) and lesson_media.endswith((".png", ".jpg", ".jpeg", ".gif")):
            lesson_media = add_image_path(lesson_media, "lesson")

        lesson = session.query(Lesson).filter_by(course_id=course.id, title=lesson_title).first()
        if not lesson:
            lesson = Lesson(
                course_id=course.id,
                title=lesson_title,
                content=lesson_data.get("content", ""),
                media_url=lesson_media
            )
            session.add(lesson)
            session.flush()
            print(f"➕ Inserted lesson: {lesson_title} (ID: {lesson.id})")
        else:
            lesson.content = lesson_data.get("content", "")
            lesson.media_url = lesson_media
            print(f"🔄 Updated lesson: {lesson_title} (ID: {lesson.id})")

        for slide_data in lesson_data.get("slides", []):
            insert_or_update_slide(session, slide_data, lesson_id=lesson.id, filename=filename)


def seed_questions(session: Session, filename: str, data):
    """Seed standalone questions from JSON array with enforced lesson IDs."""
    if not isinstance(data, list):
        print(f"⚠️ Expected question array in {filename}, got {type(data).__name__}")
        return

    print(f"📄 Processing standalone question file: {filename}")
    
    # Get course configuration to validate lesson IDs
    course_key = get_course_key_from_filename(filename)
    if course_key and course_key in COURSE_LESSON_ID_MAPPING:
        config = COURSE_LESSON_ID_MAPPING[course_key]
        valid_lesson_range = range(config["lesson_id_start"], config["lesson_id_start"] + 5)
        print(f"📋 Expected lesson_id range for {course_key}: {config['lesson_id_start']}-{config['lesson_id_start']+4}")
        
        # Validate questions have correct lesson_ids
        for q_data in data:
            if isinstance(q_data, dict):
                q_lesson_id = q_data.get("lesson_id")
                if q_lesson_id and q_lesson_id not in valid_lesson_range:
                    print(f"⚠️ Question has lesson_id {q_lesson_id} but expected range is {list(valid_lesson_range)}")
    
    for q_data in data:
        insert_or_update_question(session, q_data, filename=filename)


def main():
    db = SessionLocal()
    try:
        # Load and categorize files
        course_files, question_files = load_json_files(SEED_FOLDER)
        
        # Sort course files by intended order
        def course_sort_key(file_tuple):
            filename, data = file_tuple
            course_key = get_course_key_from_filename(filename)
            if course_key in COURSE_LESSON_ID_MAPPING:
                return COURSE_LESSON_ID_MAPPING[course_key]["course_order"]
            return 999  # Unknown courses go last
            
        course_files.sort(key=course_sort_key)
        print(f"📁 Processing course files in order: {[f[0] for f in course_files]}")
        
        # First, seed all courses and lessons in correct order
        print("\n🏗️ PHASE 1: Seeding Courses and Lessons")
        for filename, data in course_files:
            seed_courses(db, filename, data)
        
        # Commit courses before seeding questions
        db.commit()
        print("✅ Courses and lessons committed to database")
        
        # Sort question files by course order as well
        question_files.sort(key=course_sort_key)
        
        # Then, seed all questions
        print("\n❓ PHASE 2: Seeding Questions")
        for filename, data in question_files:
            seed_questions(db, filename, data)
            
        # Final commit
        db.commit()
        print("✅ All JSON files seeded successfully!")
        
        # Display summary
        print("\n📊 SEEDING SUMMARY:")
        courses = db.query(Course).all()
        for course in courses:
            lessons = db.query(Lesson).filter_by(course_id=course.id).all()
            questions = db.query(Question).filter_by(course_id=course.id).all()
            print(f"🏫 {course.title} (ID: {course.id})")
            print(f"   📚 {len(lessons)} lessons (IDs: {[l.id for l in lessons]})")
            print(f"   ❓ {len(questions)} questions")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    main()