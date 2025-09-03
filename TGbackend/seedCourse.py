import os
import json
from sqlalchemy.orm import Session
from TGbackend.database import SessionLocal, engine
from TGbackend.models import Base, Course, Unit, Lesson, LessonSlides, Question, Activity

# Base paths for images
BASE_COURSE_IMG_PATH = "/images/courses/"
BASE_PRE_ASSESSMENT_IMG_PATH = "/images/pre-assessment/"
BASE_LESSON_IMG_PATH = "/images/lessons/"

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

SEED_FOLDER = os.path.join(os.path.dirname(__file__), "seed_course_data")


def add_image_path(filename: str, base_path: str) -> str:
    """Prefix image filename with base path if not already a full URL/path."""
    if not filename:
        return ""
    if filename.startswith("/") or filename.startswith("http"):
        return filename
    return f"{base_path}{filename}"


def load_json_files(folder_path):
    """Load all JSON files from a folder."""
    json_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    data_list = []

    for file_name in json_files:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                data_list.append((file_name, data))
                print(f"✅ Loaded {file_name}")
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing {file_name}: {e}")
    return data_list


def get_title(data, filename: str, level: str) -> str:
    """Get a title safely depending on the JSON structure level."""
    if not isinstance(data, dict):
        raise ValueError(f"Expected a dict for {level} in {filename}, got {type(data).__name__}")

    key_map = {
        "course": ["course_title", "course_name", "title"],
        "unit": ["unit_title", "title"],
        "lesson": ["lesson_title", "title"],
        "slide": ["slide_title", "title"]
    }

    for key in key_map.get(level, ["title"]):
        if data.get(key):
            return data[key]

    raise ValueError(f"Missing title for {level} in {filename}")


def insert_or_update_question(session, q_data, lesson_id=None, course_id=None, filename=None):
    """Insert or update a question."""
    if not isinstance(q_data, dict):
        print(f"⚠️ Skipping malformed question in {filename}: {q_data}")
        return

    # Handle missing lesson_id warning
    if not lesson_id and not q_data.get("lesson_id"):
        print(f"⚠️ No lesson_id provided for question in {filename}. Linking only to course_id={course_id}.")

    # Fix image paths
    if q_data.get("image"):
        q_data["image"] = add_image_path(q_data["image"], BASE_PRE_ASSESSMENT_IMG_PATH)

    if "options" in q_data and isinstance(q_data["options"], list):
        for opt in q_data["options"]:
            if isinstance(opt, dict) and "image" in opt:
                opt["image"] = add_image_path(opt["image"], BASE_PRE_ASSESSMENT_IMG_PATH)

    if q_data.get("answer_image"):
        q_data["answer_image"] = add_image_path(q_data["answer_image"], BASE_PRE_ASSESSMENT_IMG_PATH)

    # Decide final_lesson_id
    final_lesson_id = lesson_id or q_data.get("lesson_id")

    # Calculate prepared fields
    final_type = q_data.get("type", "multiple-choice")
    final_assessment_type = q_data.get("assessment_type")  # could be None
    final_choices = json.dumps(q_data.get("options", []))
    final_correct = q_data.get("answer", q_data.get("answer_image", ""))
    final_image = q_data.get("image", "")

    # existing question check
    existing_q = session.query(Question).filter_by(
        text=q_data.get("question") or q_data.get("text", ""),
        lesson_id=final_lesson_id
    ).first()

    if existing_q:
        existing_q.type = final_type
        existing_q.assessment_type = final_assessment_type
        existing_q.choices = final_choices
        existing_q.correct_answer = final_correct
        # only set if Question model actually has image_url column
        if hasattr(existing_q, "image_url"):
            existing_q.image_url = final_image
        print(f"🔄 Updated Q in {filename} → lesson {final_lesson_id or 'None'}")
    else:
        q_kwargs = dict(
            lesson_id=final_lesson_id,
            course_id=course_id or q_data.get("course_id"),
            text=q_data.get("question") or q_data.get("text", ""),
            type=final_type,
            assessment_type=final_assessment_type,
            choices=final_choices,
            correct_answer=final_correct
        )
        if hasattr(Question, "image_url"):
            q_kwargs["image_url"] = final_image

        session.add(Question(**q_kwargs))
        print(f"➕ Inserted Q in {filename} → lesson {final_lesson_id or 'None'}")

def insert_or_update_slide(session, slide_data, lesson_id=None, filename=None):
    """Insert or update a lesson slide."""
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

    if existing_slide:
        existing_slide.content = slide_data.get("content", "")
        existing_slide.media_url = slide_data.get("media_url", "")
        print(f"🔄 Updated slide #{slide_number} for lesson {lesson_id}")
    else:
        session.add(LessonSlides(
            lesson_id=lesson_id,
            slide_number=slide_number,
            content=slide_data.get("content", ""),
            media_url=slide_data.get("media_url", "")
        ))
        print(f"➕ Inserted slide #{slide_number} for lesson {lesson_id}")

def seed_database(session: Session, filename: str, data):
    """Seed database based on JSON data structure."""

    # CASE 1: Standalone pre-assessment or question-only JSON
    if isinstance(data, list):
        print(f"📄 Detected standalone question file: {filename}")
        for q in data:
            insert_or_update_question(
                session,
                q,
                lesson_id=q.get("lesson_id"),  # Auto-link if provided
                course_id=q.get("course_id"),
                filename=filename
            )
        return

    # CASE 2: Course/unit/lesson structure
    if not isinstance(data, dict):
        print(f"⚠️ Skipping file {filename} because top-level JSON is not object or list.")
        return

    # --- COURSE ---
    course_title = get_title(data, filename, "course")
    course_desc = data.get("description", "")
    course_image = add_image_path(data.get("image", ""), BASE_COURSE_IMG_PATH)

    course = session.query(Course).filter_by(title=course_title).first()
    if not course:
        course = Course(title=course_title, description=course_desc, image_url=course_image)
        session.add(course)
        session.flush()
        print(f"➕ Inserted course: {course_title}")
    else:
        course.description = course_desc
        course.image_url = course_image
        print(f"🔄 Updated course: {course_title}")

    # --- UNITS ---
    for unit_data in data.get("units", []):
        if not isinstance(unit_data, dict):
            print(f"⚠️ Skipping malformed unit in {filename}: {unit_data}")
            continue

        unit_title = get_title(unit_data, filename, "unit")
        unit = session.query(Unit).filter_by(course_id=course.id, title=unit_title).first()
        if not unit:
            unit = Unit(course_id=course.id, title=unit_title, description=unit_data.get("description", ""))
            session.add(unit)
            session.flush()
            print(f"➕ Inserted unit: {unit_title}")
        else:
            unit.description = unit_data.get("description", "")
            print(f"🔄 Updated unit: {unit_title}")

        # --- LESSONS ---
        for lesson_data in unit_data.get("lessons", []):
            if not isinstance(lesson_data, dict):
                print(f"⚠️ Skipping malformed lesson in {filename}: {lesson_data}")
                continue

            lesson_title = get_title(lesson_data, filename, "lesson")
            lesson_media = lesson_data.get("media", "")
            if isinstance(lesson_media, str) and lesson_media.endswith((".png", ".jpg", ".jpeg", ".gif")):
                lesson_media = add_image_path(lesson_media, BASE_LESSON_IMG_PATH)

            lesson = session.query(Lesson).filter_by(unit_id=unit.id, title=lesson_title).first()
            if not lesson:
                lesson = Lesson(
                    unit_id=unit.id,
                    title=lesson_title,
                    content=lesson_data.get("content", ""),
                    media_url=lesson_media
                )
                session.add(lesson)
                session.flush()
                print(f"➕ Inserted lesson: {lesson_title}")
            else:
                lesson.content = lesson_data.get("content", "")
                lesson.media_url = lesson_media
                print(f"🔄 Updated lesson: {lesson_title}")
            
            # --- SLIDES ---
            for slide_data in lesson_data.get("slides", []):
                insert_or_update_slide(
                    session,
                    slide_data,
                    lesson_id=lesson.id,
                    filename=filename
                )

            # --- ACTIVITIES ---
            for activity_data in lesson_data.get("activities", []):
                if not isinstance(activity_data, dict):
                    print(f"⚠️ Skipping malformed activity in {filename}: {activity_data}")
                    continue
                session.add(Activity(
                    lesson_id=lesson.id,
                    type=activity_data.get("type", "quiz"),
                    content=activity_data.get("content", "")
                ))

            # --- QUESTIONS ---
            for q_data in lesson_data.get("questions", []):
                insert_or_update_question(
                    session,
                    q_data,
                    lesson_id=lesson.id,
                    course_id=course.id,
                    filename=filename
                )


def main():
    db = SessionLocal()
    try:
        files_data = load_json_files(SEED_FOLDER)
        for filename, data in files_data:
            seed_database(db, filename, data)
        db.commit()
        print("✅ All JSON files seeded successfully without duplicates!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()