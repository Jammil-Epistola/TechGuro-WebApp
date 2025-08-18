import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from TGbackend.database import get_db
from TGbackend.models import Course, Unit, Lesson, LessonSlides

router = APIRouter(tags=["Lessons & Courses"])

# =========================
# 1. GET ALL COURSES
# =========================
@router.get("/courses")
def get_all_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "image_url": c.image_url,
            "units": [
                {
                    "unit_id": u.id,
                    "unit_title": u.title,
                    "lessons": [
                        {
                            "lesson_id": l.id,
                            "lesson_title": l.title
                        }
                        for l in sorted(u.lessons, key=lambda x: x.id)
                    ]
                }
                for u in sorted(c.units, key=lambda x: x.id)
            ]
        }
        for c in sorted(courses, key=lambda x: x.id)
    ]

# =========================
# 2. LESSON LIST (per course)
# =========================
@router.get("/lesson-courses/{course_id}")
def get_lessons_by_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return {
        "course_id": course.id,
        "course_title": course.title,
        "description": course.description,
        "image_url": course.image_url,
        "units": [
            {
                "unit_id": unit.id,
                "unit_title": unit.title,
                "lessons": [
                    {
                        "lesson_id": lesson.id,
                        "lesson_title": lesson.title
                    }
                    for lesson in unit.lessons
                ]
            }
            for unit in course.units
        ]
    }

# =========================
# 3. LESSON PAGE (detail with slides)
# =========================
@router.get("/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = (
        db.query(Lesson)
        .join(Unit, Lesson.unit_id == Unit.id)
        .join(Course, Unit.course_id == Course.id)
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    slides_data = []
    for slide in sorted(lesson.slides, key=lambda s: s.slide_number):
        content_list = []
        if slide.content:
            try:
                content_list = json.loads(slide.content)
            except Exception:
                content_list = [slide.content]

        slides_data.append({
            "slide_number": slide.slide_number,
            "content": content_list,
            "media_url": slide.media_url
        })

    return {
        "course_id": lesson.unit.course.id,
        "course_title": lesson.unit.course.title,
        "unit_id": lesson.unit.id,
        "unit_title": lesson.unit.title,
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "slides": slides_data
    }