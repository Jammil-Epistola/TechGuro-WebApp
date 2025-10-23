"""
Master Seeder Script - seedAll.py
Run all seeder scripts with a single command.
Usage:
    python -m TGbackend.seedAll                 # Seed everything
    python -m TGbackend.seedAll --clear         # Clear and reseed
    python -m TGbackend.seedAll --courses       # Only courses
    python -m TGbackend.seedAll --milestones    # Only milestones
    python -m TGbackend.seedAll --quizzes       # Only quizzes
"""

import sys
import argparse
from sqlalchemy.orm import Session
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.seeders.cloudinary_helper import print_missing_images_summary

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a styled header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKCYAN}ℹ {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def clear_database(db: Session):
    """Clear all data from the database"""
    print_header("CLEARING DATABASE")
    
    try:
        # Delete in reverse order of dependencies
        print_info("Deleting quiz results...")
        db.query(models.QuizResult).delete()
        
        print_info("Deleting quiz questions...")
        db.query(models.QuizQuestion).delete()
        
        print_info("Deleting quizzes...")
        db.query(models.Quiz).delete()
        
        print_info("Deleting assessment responses...")
        db.query(models.AssessmentQuestionResponse).delete()
        
        print_info("Deleting assessment results...")
        db.query(models.AssessmentResults).delete()
        
        print_info("Deleting questions...")
        db.query(models.Question).delete()
        
        print_info("Deleting milestone earned records...")
        db.query(models.MilestoneEarned).delete()
        
        print_info("Deleting milestones...")
        db.query(models.Milestone).delete()
        
        print_info("Deleting user lesson mastery history...")
        db.query(models.UserLessonMasteryHistory).delete()
        
        print_info("Deleting user lesson mastery...")
        db.query(models.UserLessonMastery).delete()
        
        print_info("Deleting progress records...")
        db.query(models.Progress).delete()
        
        print_info("Deleting lesson slides...")
        db.query(models.LessonSlides).delete()
        
        print_info("Deleting lessons...")
        db.query(models.Lesson).delete()
        
        print_info("Deleting courses...")
        db.query(models.Course).delete()
        
        db.commit()
        print_success("Database cleared successfully!")
        
    except Exception as e:
        db.rollback()
        print_error(f"Failed to clear database: {str(e)}")
        raise

def seed_courses():
    """Seed courses and assessments by calling seedCourse.py main()"""
    print_header("SEEDING COURSES & ASSESSMENTS")
    
    try:
        print_info("Running seeders/seedCourse.py...")
        
        # Import from seeders folder - try multiple approaches
        try:
            from seeders.seedCourse import main as seed_course_main
        except ImportError:
            try:
                from TGbackend.seeders.seedCourse import main as seed_course_main
            except ImportError:
                # Fallback: add path and import
                import os
                import sys
                seeders_path = os.path.join(os.path.dirname(__file__), 'seeders')
                if seeders_path not in sys.path:
                    sys.path.insert(0, seeders_path)
                from TGbackend.seeders.seedCourse import main as seed_course_main
        
        # Run the seeder
        seed_course_main()
        
        print_success("Courses and assessments seeded successfully!")
        
    except Exception as e:
        print_error(f"Failed to seed courses: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def seed_milestones():
    """Seed milestones by calling seedMilestone.py main()"""
    print_header("SEEDING MILESTONES")
    
    try:
        print_info("Running seeders/seedMilestone.py...")
        
        # Import from seeders folder - try multiple approaches
        try:
            from seeders.seedMilestone import main as seed_milestone_main
        except ImportError:
            try:
                from TGbackend.seeders.seedMilestone import main as seed_milestone_main
            except ImportError:
                # Fallback: add path and import
                import os
                import sys
                seeders_path = os.path.join(os.path.dirname(__file__), 'seeders')
                if seeders_path not in sys.path:
                    sys.path.insert(0, seeders_path)
                from TGbackend.seeders.seedMilestone import main as seed_milestone_main
        
        # Run the seeder
        seed_milestone_main()
        
        print_success("Milestones seeded successfully!")
        
    except Exception as e:
        print_error(f"Failed to seed milestones: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def seed_quizzes():
    """Seed quizzes by calling seedQuiz.py seed_quizzes()"""
    print_header("SEEDING QUIZZES")
    
    try:
        print_info("Running seeders/seedQuiz.py...")
        
        # Import from seeders folder - try multiple approaches
        try:
            from seeders.seedQuiz import seed_quizzes
        except ImportError:
            try:
                from TGbackend.seeders.seedQuiz import seed_quizzes
            except ImportError:
                # Fallback: add path and import
                import os
                import sys
                seeders_path = os.path.join(os.path.dirname(__file__), 'seeders')
                if seeders_path not in sys.path:
                    sys.path.insert(0, seeders_path)
                from TGbackend.seeders.seedQuiz import seed_quizzes
        
        # Run the seeder
        seed_quizzes()
        
        print_success("Quizzes seeded successfully!")
        
    except Exception as e:
        print_error(f"Failed to seed quizzes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def print_database_summary():
    """Print a detailed summary of seeded data"""
    db = SessionLocal()
    try:
        print_header("DATABASE SUMMARY")
        
        # Course Summary
        courses = db.query(models.Course).all()
        print(f"{Colors.BOLD}📚 Total Courses: {len(courses)}{Colors.ENDC}")
        
        for course in courses:
            lessons = db.query(models.Lesson).filter_by(course_id=course.id).all()
            lesson_ids = [l.id for l in lessons]
            
            slides_count = db.query(models.LessonSlides).filter(
                models.LessonSlides.lesson_id.in_(lesson_ids)
            ).count() if lesson_ids else 0
            
            questions = db.query(models.Question).filter_by(course_id=course.id).all()
            pre_questions = [q for q in questions if q.assessment_type == 'pre']
            post_questions = [q for q in questions if q.assessment_type == 'post']
            
            quizzes = db.query(models.Quiz).filter_by(course_id=course.id).all()
            quiz_questions = db.query(models.QuizQuestion).filter_by(course_id=course.id).count()
            
            print(f"\n  🏫 {Colors.OKCYAN}{course.title}{Colors.ENDC} (ID: {course.id})")
            print(f"     📖 {len(lessons)} lessons (IDs: {min(lesson_ids) if lesson_ids else 'N/A'}-{max(lesson_ids) if lesson_ids else 'N/A'})")
            print(f"     📄 {slides_count} slides")
            print(f"     ❓ {len(questions)} assessment questions ({len(pre_questions)} pre, {len(post_questions)} post)")
            print(f"     🎯 {len(quizzes)} quizzes with {quiz_questions} questions")
        
        # Milestone Summary
        milestones = db.query(models.Milestone).all()
        print(f"\n{Colors.BOLD}🏆 Total Milestones: {len(milestones)}{Colors.ENDC}")
        
        # Overall totals
        print(f"\n{Colors.BOLD}📊 GRAND TOTALS:{Colors.ENDC}")
        print(f"  • Courses: {db.query(models.Course).count()}")
        print(f"  • Lessons: {db.query(models.Lesson).count()}")
        print(f"  • Lesson Slides: {db.query(models.LessonSlides).count()}")
        print(f"  • Assessment Questions: {db.query(models.Question).count()}")
        print(f"  • Milestones: {db.query(models.Milestone).count()}")
        print(f"  • Quizzes: {db.query(models.Quiz).count()}")
        print(f"  • Quiz Questions: {db.query(models.QuizQuestion).count()}")
        print_missing_images_summary()
        print()
        
    except Exception as e:
        print_error(f"Failed to generate summary: {str(e)}")
    finally:
        db.close()

def main():
    """Main seeding function"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='🌱 Seed TechGuro database with all content',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
{Colors.BOLD}Examples:{Colors.ENDC}
  python -m TGbackend.seedAll                 # Seed everything
  python -m TGbackend.seedAll --clear         # Clear and reseed everything
  python -m TGbackend.seedAll --courses       # Only seed courses
  python -m TGbackend.seedAll --milestones    # Only seed milestones  
  python -m TGbackend.seedAll --quizzes       # Only seed quizzes

{Colors.BOLD}Note:{Colors.ENDC} This script calls the individual seeders in TGbackend/seeders/ folder
        """
    )
    parser.add_argument('--clear', action='store_true', 
                       help='Clear all existing data before seeding')
    parser.add_argument('--courses', action='store_true', 
                       help='Only seed courses and assessments')
    parser.add_argument('--milestones', action='store_true', 
                       help='Only seed milestones')
    parser.add_argument('--quizzes', action='store_true', 
                       help='Only seed quizzes')
    
    args = parser.parse_args()
    
    # Create database session
    db = SessionLocal()
    
    try:
        print_header("🌱 TECHGURO DATABASE SEEDER 🌱")
        print_info("Master seeder calling individual seeders from seeders/ folder")
        
        # Clear database if requested
        if args.clear:
            print_warning("⚠️  CLEAR FLAG DETECTED ⚠️")
            print_warning("This will DELETE ALL existing data!")
            response = input(f"\n{Colors.WARNING}Are you sure you want to continue? (yes/no): {Colors.ENDC}")
            if response.lower() == 'yes':
                clear_database(db)
            else:
                print_info("Clear operation cancelled. Exiting.")
                return
        
        # Determine what to seed
        seed_all = not (args.courses or args.milestones or args.quizzes)
        
        # Seed courses (must be first due to dependencies)
        if seed_all or args.courses:
            seed_courses()
        
        # Seed milestones
        if seed_all or args.milestones:
            seed_milestones()
        
        # Seed quizzes (must be after courses)
        if seed_all or args.quizzes:
            seed_quizzes()
        
        # Print detailed summary
        print_database_summary()
        
        # Final success message
        print_header("✨ SEEDING COMPLETE ✨")
        print_success("All data has been seeded successfully! 🎉")
        print_info("Your TechGuro database is ready to use!")
        
    except ImportError as e:
        print_error(f"Failed to import seeder: {str(e)}")
        print_info("Make sure all seeder files are in TGbackend/seeders/ folder")
        print_info("and that __init__.py exists in the seeders folder")
        sys.exit(1)
        
    except Exception as e:
        print_error(f"Seeding failed: {str(e)}")
        print_info("Please check the error messages above for details.")
        sys.exit(1)
        
    finally:
        db.close()

if __name__ == "__main__":
    main()