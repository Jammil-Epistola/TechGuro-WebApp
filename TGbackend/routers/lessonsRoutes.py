import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from TGbackend.database import get_db
from TGbackend.models import Course, Lesson, LessonSlides

router = APIRouter(tags=["Lessons & Courses"])

# =========================
# 1. GET ALL COURSES (with lessons)
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
            "sources": c.sources, 
            "lessons": [
                {
                    "lesson_id": l.id,
                    "lesson_title": l.title
                }
                for l in sorted(c.lessons, key=lambda x: x.id)
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
        "sources": course.sources, 
        "lessons": [
            {
                "lesson_id": lesson.id,
                "lesson_title": lesson.title
            }
            for lesson in sorted(course.lessons, key=lambda l: l.id)
        ]
    }



# =========================
# 3. LESSON PAGE (detail with slides)
# =========================
@router.get("/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

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
        "course_id": lesson.course.id,
        "course_title": lesson.course.title,
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "sources": lesson.course.sources, 
        "slides": slides_data
    }

# =========================
# 4. GET SOURCES FOR A SPECIFIC COURSE
# =========================
@router.get("/courses/{course_id}/sources")
def get_course_sources(course_id: int, db: Session = Depends(get_db)):
    """
    Dedicated endpoint to fetch only sources for a course.
    Useful for the sources modal in CourseNavbar.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "course_id": course.id,
        "course_title": course.title,
        "sources": course.sources or []
    }
