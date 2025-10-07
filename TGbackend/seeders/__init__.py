"""
TechGuro Seeders Package
========================

This package contains all database seeding scripts for TechGuro.

Individual Seeders:
- seedCourse.py: Seeds courses, lessons, slides, and assessment questions
- seedMilestone.py: Seeds milestone/achievement data
- seedQuiz.py: Seeds quiz data (multiple choice, drag & drop, typing)

Usage:
    Run individual seeders:
        python -m TGbackend.seeders.seedCourse
        python -m TGbackend.seeders.seedMilestone
        python -m TGbackend.seeders.seedQuiz
    
    Or use the master seeder (recommended):
        python -m TGbackend.seedAll
"""

# Package metadata
__version__ = "1.0.0"
__author__ = "TechGuro Team"

# This allows the seeders folder to be treated as a Python package
# No additional code needed here - the individual seeder files are standalone