# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from TGbackend.database import engine
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.routers import bktRoutes, user, progress, lessonCourses

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

# (register/login endpoints)
print("About to include router...")
app.include_router(user.router)
print("Router included.")

# (progress endpoint)
app.include_router(progress.router)
# (bkt endpoints)
app.include_router(bktRoutes.router)
app.include_router(bktRoutes.bkt_router)
app.include_router(lessonCourses.router)

#Test root endpoint
@app.get("/")
def read_root():
    return {"message": "TechGuro Backend is Live!"}

