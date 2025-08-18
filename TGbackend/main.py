# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from TGbackend.database import engine
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.routers import userRoutes, progressRoutes, lessonsRoutes, assessmentRoutes, bktRoutes

# Create the database tables
models.Base.metadata.create_all(bind=engine)

def seed_milestones():
    db = SessionLocal()
    existing = db.query(models.Milestone).first()
    if existing:
        print("Milestones already seeded.")
        db.close()
        return

    milestones = [
        models.Milestone(
            title="Welcome to TechGuro",
            description="Sign in to TechGuro for the first time.",
            exp_reward=10,
            icon_url="placeholderimg"
        ),
        models.Milestone(
            title="First Steps",
            description="Choose a course and complete the Pre-Assessment.",
            exp_reward=10,
            icon_url="placeholderimg"
        ),
        models.Milestone(
            title="First Lesson",
            description="Complete your first lesson.",
            exp_reward=10,
            icon_url="placeholderimg"
        )
    ]

    db.add_all(milestones)
    db.commit()
    db.close()
    print("Milestones seeded successfully.")

seed_milestones()

# Initialize
print("Before FastAPI instance")
app = FastAPI()
print("After FastAPI instance")

# CORS
origins = [
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
print("About to include routers...")

# User management (register/login endpoints)
app.include_router(userRoutes.router)

# Progress tracking
app.include_router(progressRoutes.router)

# Lessons and courses
app.include_router(lessonsRoutes.router)

# Assessment management 
app.include_router(assessmentRoutes.router)

# BKT (Bayesian Knowledge Tracing)
app.include_router(bktRoutes.router)

print("All routers included.")

# Test root endpoint
@app.get("/")
def read_root():
    return {"message": "TechGuro Backend is Live!"}