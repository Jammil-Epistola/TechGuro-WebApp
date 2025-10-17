# adminRoutes.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, date
from TGbackend import models
from TGbackend.database import get_db
from TGbackend.schema import AdminCreate, AdminLogin, UserAssessmentData
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["Admin Management"], prefix="/admin")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================
# ADMIN AUTHENTICATION
# ============================================

@router.post("/register")
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    """Register a new admin (should be restricted in production)"""
    existing_user = db.query(models.User).filter(models.User.email == admin.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(admin.password)
    new_admin = models.User(
        email=admin.email,
        username=admin.username,
        password_hash=hashed_password,
        birthday=admin.birthday,
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"message": "Admin registered successfully", "admin_id": new_admin.id, "role": "admin"}


@router.post("/login")
def login_admin(admin: AdminLogin, db: Session = Depends(get_db)):
    """Login endpoint for admins"""
    db_admin = db.query(models.User).filter(models.User.email == admin.email).first()
    
    if not db_admin or not pwd_context.verify(admin.password, db_admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if db_admin.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required")
    
    return {
        "admin_id": db_admin.id,
        "username": db_admin.username,
        "email": db_admin.email,
        "role": "admin"
    }


# ============================================
# USER MANAGEMENT & DATA RETRIEVAL
# ============================================

# Replace the @router.get("/users") endpoint in adminRoutes.py with this:

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """Fetch all users with their assessment data grouped by course and course progress"""
    users = db.query(models.User).filter(models.User.role == "user").all()
    
    user_data_list = []
    
    for user in users:
        # Get all courses
        courses = db.query(models.Course).all()
        assessments_by_course = {}
        
        # Build assessments grouped by course
        for course in courses:
            # Get pre-assessment for this course
            pre_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "pre"
            ).first()
            
            # Get post-assessment for this course
            post_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "post"
            ).first()
            
            # Store course data with pre/post assessment info
            assessments_by_course[str(course.id)] = {
                "course_name": course.title,
                "course_id": course.id,
                "pre": {
                    "score": pre_assessment.score,
                    "date": pre_assessment.date_taken
                } if pre_assessment else None,
                "post": {
                    "score": post_assessment.score,
                    "date": post_assessment.date_taken
                } if post_assessment else None
            }
        
        # Get course progress
        course_progress = {}
        for course in courses:
            # Check if user has completed all lessons in the course
            lessons_in_course = db.query(models.Lesson).filter(
                models.Lesson.course_id == course.id
            ).all()
            
            if lessons_in_course:
                completed_lessons = db.query(models.Progress).filter(
                    models.Progress.user_id == user.id,
                    models.Progress.course_id == course.id,
                    models.Progress.completed == True
                ).count()
                
                is_completed = completed_lessons == len(lessons_in_course)
            else:
                is_completed = False
            
            course_progress[str(course.id)] = {
                "course_name": course.title,
                "status": "completed" if is_completed else "not_completed"
            }
        
        user_data_list.append({
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "birthday": user.birthday,
            "date_created": user.date_created,
            "assessments_by_course": assessments_by_course,
            "course_progress": course_progress
        })
    
    return user_data_list

@router.get("/users/search")
def search_users(query: str, db: Session = Depends(get_db)):
    """Search users by username or email with per-course assessment data"""
    users = db.query(models.User).filter(
        models.User.role == "user",
        (models.User.username.ilike(f"%{query}%")) | (models.User.email.ilike(f"%{query}%"))
    ).all()
    
    user_data_list = []
    
    for user in users:
        # Get all courses
        courses = db.query(models.Course).all()
        assessments_by_course = {}
        
        # Build assessments grouped by course
        for course in courses:
            # Get pre-assessment for this course
            pre_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "pre"
            ).first()
            
            # Get post-assessment for this course
            post_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "post"
            ).first()
            
            # Store course data with pre/post assessment info
            assessments_by_course[str(course.id)] = {
                "course_name": course.title,
                "course_id": course.id,
                "pre": {
                    "score": pre_assessment.score,
                    "date": pre_assessment.date_taken
                } if pre_assessment else None,
                "post": {
                    "score": post_assessment.score,
                    "date": post_assessment.date_taken
                } if post_assessment else None
            }
        
        # Get course progress
        course_progress = {}
        for course in courses:
            # Check if user has completed all lessons in the course
            lessons_in_course = db.query(models.Lesson).filter(
                models.Lesson.course_id == course.id
            ).all()
            
            if lessons_in_course:
                completed_lessons = db.query(models.Progress).filter(
                    models.Progress.user_id == user.id,
                    models.Progress.course_id == course.id,
                    models.Progress.completed == True
                ).count()
                
                is_completed = completed_lessons == len(lessons_in_course)
            else:
                is_completed = False
            
            course_progress[str(course.id)] = {
                "course_name": course.title,
                "status": "completed" if is_completed else "not_completed"
            }
        
        user_data_list.append({
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "birthday": user.birthday,
            "date_created": user.date_created,
            "assessments_by_course": assessments_by_course,
            "course_progress": course_progress
        })
    
    return user_data_list


@router.get("/user/{user_id}")
def get_user_detail(user_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific user with per-course assessment data"""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "user").first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all courses
    courses = db.query(models.Course).all()
    assessments_by_course = {}
    
    # Build assessments grouped by course
    for course in courses:
        # Get pre-assessment for this course
        pre_assessment = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user.id,
            models.AssessmentResults.course_id == course.id,
            models.AssessmentResults.assessment_type == "pre"
        ).first()
        
        # Get post-assessment for this course
        post_assessment = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user.id,
            models.AssessmentResults.course_id == course.id,
            models.AssessmentResults.assessment_type == "post"
        ).first()
        
        # Store course data with pre/post assessment info
        assessments_by_course[str(course.id)] = {
            "course_name": course.title,
            "course_id": course.id,
            "pre": {
                "score": pre_assessment.score,
                "date": pre_assessment.date_taken
            } if pre_assessment else None,
            "post": {
                "score": post_assessment.score,
                "date": post_assessment.date_taken
            } if post_assessment else None
        }
    
    # Get course progress
    course_progress = {}
    for course in courses:
        # Check if user has completed all lessons in the course
        lessons_in_course = db.query(models.Lesson).filter(
            models.Lesson.course_id == course.id
        ).all()
        
        if lessons_in_course:
            completed_lessons = db.query(models.Progress).filter(
                models.Progress.user_id == user.id,
                models.Progress.course_id == course.id,
                models.Progress.completed == True
            ).count()
            
            is_completed = completed_lessons == len(lessons_in_course)
        else:
            is_completed = False
        
        course_progress[str(course.id)] = {
            "course_name": course.title,
            "status": "completed" if is_completed else "not_completed"
        }
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "birthday": user.birthday,
        "date_created": user.date_created,
        "assessments_by_course": assessments_by_course,
        "course_progress": course_progress
    }

# ============================================
# USER DELETION
# ============================================

@router.delete("/user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user and all associated data"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete all related data
    db.query(models.Progress).filter(models.Progress.user_id == user_id).delete()
    db.query(models.AssessmentQuestionResponse).filter(models.AssessmentQuestionResponse.user_id == user_id).delete()
    db.query(models.AssessmentResults).filter(models.AssessmentResults.user_id == user_id).delete()
    db.query(models.UserLessonMastery).filter(models.UserLessonMastery.user_id == user_id).delete()
    db.query(models.UserLessonMasteryHistory).filter(models.UserLessonMasteryHistory.user_id == user_id).delete()
    db.query(models.MilestoneEarned).filter(models.MilestoneEarned.user_id == user_id).delete()
    db.query(models.QuizResult).filter(models.QuizResult.user_id == user_id).delete()
    
    # Delete the user
    db.delete(user)
    db.commit()
    
    return {"message": "User and all associated data deleted successfully", "user_id": user_id}


# ============================================
# DATA EXPORT
# ============================================

@router.get("/export/csv")
def export_users_csv(db: Session = Depends(get_db)):
    """Export all users data as CSV"""
    users = db.query(models.User).filter(models.User.role == "user").all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "User ID", "Username", "Email", "Birthday", "Date Created",
        "Pre-Assessment Status", "Pre-Assessment Score", "Pre-Assessment Date",
        "Post-Assessment Status", "Post-Assessment Score", "Post-Assessment Date",
        "Course Progress"
    ])
    
    # Write user data
    for user in users:
        # Get pre-assessment data
        pre_assessments = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user.id,
            models.AssessmentResults.assessment_type == "pre"
        ).all()
        
        pre_status = "not_taken"
        pre_score = None
        pre_date = None
        
        if pre_assessments:
            latest_pre = max(pre_assessments, key=lambda x: x.date_taken)
            pre_status = "taken"
            pre_score = latest_pre.score
            pre_date = latest_pre.date_taken
        
        # Get post-assessment data
        post_assessments = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user.id,
            models.AssessmentResults.assessment_type == "post"
        ).all()
        
        post_status = "disabled"
        post_score = None
        post_date = None
        
        if post_assessments:
            post_status = "enabled"
            latest_post = max(post_assessments, key=lambda x: x.date_taken)
            post_score = latest_post.score
            post_date = latest_post.date_taken
        
        # Get course progress
        courses = db.query(models.Course).all()
        course_progress_str = ""
        
        for course in courses:
            lessons_in_course = db.query(models.Lesson).filter(
                models.Lesson.course_id == course.id
            ).all()
            
            if lessons_in_course:
                completed_lessons = db.query(models.Progress).filter(
                    models.Progress.user_id == user.id,
                    models.Progress.course_id == course.id,
                    models.Progress.completed == True
                ).count()
                
                is_completed = completed_lessons == len(lessons_in_course)
            else:
                is_completed = False
            
            status = "completed" if is_completed else "not_completed"
            course_progress_str += f"{course.title}: {status}; "
        
        writer.writerow([
            user.id,
            user.username,
            user.email,
            user.birthday,
            user.date_created,
            pre_status,
            pre_score if pre_score else "-",
            pre_date if pre_date else "-",
            post_status,
            post_score if post_score else "-",
            post_date if post_date else "-",
            course_progress_str.strip()
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"}
    )

# ============================================
# IMPROVEMENT ANALYSIS
# ============================================

@router.get("/improvement-analysis")
def get_improvement_analysis(db: Session = Depends(get_db)):
    """
    Get improvement analysis for users who completed BOTH pre and post assessments.
    Calculate improvement per-course.
    """
    users = db.query(models.User).filter(models.User.role == "user").all()
    
    improvement_data = []
    
    for user in users:
        # Get all courses
        courses = db.query(models.Course).all()
        user_course_improvements = []
        
        for course in courses:
            # Get pre-assessment for this course
            pre_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "pre"
            ).first()
            
            # Get post-assessment for this course
            post_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "post"
            ).first()
            
            # Only include if BOTH assessments exist
            if pre_assessment and post_assessment:
                # Get raw scores
                pre_score = pre_assessment.score
                post_score = post_assessment.score
                
                # Store original scores for display (keep them as-is)
                original_pre = pre_score
                original_post = post_score
                
                # Normalize scores to 0-100 range for calculation consistency
                # If scores are in 0-1 range, convert to 0-100
                if pre_score <= 1:
                    pre_score = pre_score * 100
                if post_score <= 1:
                    post_score = post_score * 100
                
                # Calculate improvement percentage based on absolute difference
                # Formula: ((post - pre) / pre) * 100
                if pre_score > 0:
                    improvement_percentage = ((post_score - pre_score) / pre_score) * 100
                else:
                    # If pre_score is 0, any positive post_score is 100% improvement
                    improvement_percentage = 100.0 if post_score > 0 else 0.0
                
                # Determine status
                if improvement_percentage > 0:
                    status = "improved"
                elif improvement_percentage < 0:
                    status = "declined"
                else:
                    status = "no_change"
                
                user_course_improvements.append({
                    "course_id": course.id,
                    "course_name": course.title,
                    "pre_score": original_pre,  # Use original score for display
                    "post_score": original_post,  # Use original score for display
                    "pre_date": pre_assessment.date_taken,
                    "post_date": post_assessment.date_taken,
                    "improvement_percentage": improvement_percentage,
                    "status": status
                })
        
        # Only include users who have improvements (completed at least one course's both assessments)
        if user_course_improvements:
            improvement_data.append({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "courses": user_course_improvements,
                "overall_improvement": sum(imp["improvement_percentage"] for imp in user_course_improvements) / len(user_course_improvements)
            })
    
    return improvement_data


# Replace the @router.get("/improvement-analysis/summary") endpoint with this:

@router.get("/improvement-analysis/summary")
def get_improvement_summary(db: Session = Depends(get_db)):
    """
    Get summary statistics of user improvements across all courses.
    """
    users = db.query(models.User).filter(models.User.role == "user").all()
    
    total_users_with_both_assessments = 0
    total_improved = 0
    total_declined = 0
    total_no_change = 0
    all_improvements = []
    course_assessment_count = 0  # Track number of course assessments, not users
    
    for user in users:
        courses = db.query(models.Course).all()
        user_has_both = False
        
        for course in courses:
            pre_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "pre"
            ).first()
            
            post_assessment = db.query(models.AssessmentResults).filter(
                models.AssessmentResults.user_id == user.id,
                models.AssessmentResults.course_id == course.id,
                models.AssessmentResults.assessment_type == "post"
            ).first()
            
            if pre_assessment and post_assessment:
                user_has_both = True
                course_assessment_count += 1
                
                # Get raw scores
                pre_score = pre_assessment.score
                post_score = post_assessment.score
                
                # Normalize scores to 0-100 range for calculation
                if pre_score <= 1:
                    pre_score = pre_score * 100
                if post_score <= 1:
                    post_score = post_score * 100
                
                # Calculate improvement percentage
                if pre_score > 0:
                    improvement_percentage = ((post_score - pre_score) / pre_score) * 100
                else:
                    improvement_percentage = 100.0 if post_score > 0 else 0.0
                
                all_improvements.append(improvement_percentage)
                
                if improvement_percentage > 0:
                    total_improved += 1
                elif improvement_percentage < 0:
                    total_declined += 1
                else:
                    total_no_change += 1
        
        if user_has_both:
            total_users_with_both_assessments += 1
    
    # Calculate average improvement
    average_improvement = sum(all_improvements) / len(all_improvements) if all_improvements else 0
    
    return {
        "total_users_with_both_assessments": total_users_with_both_assessments,
        "total_course_assessments": course_assessment_count,  # Total number of course assessments completed
        "total_improved": total_improved,
        "total_declined": total_declined,
        "total_no_change": total_no_change,
        "average_improvement_percentage": average_improvement,
        "all_improvements": all_improvements
    }