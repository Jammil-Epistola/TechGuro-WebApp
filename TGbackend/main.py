# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from TGbackend.database import engine, Base
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.routers import userRoutes, progressRoutes, lessonsRoutes, assessmentRoutes, bktRoutes, milestoneRoutes, quizRoutes, adminRoutes

# Initialize FastAPI
print("Before FastAPI instance")
app = FastAPI()
print("After FastAPI instance")

# Startup event to create tables automatically
@app.on_event("startup")
async def startup_event():
    """
    Create database tables on startup if they don't exist.
    This runs automatically when the app starts on Render.
    """
    try:
        print("🔄 Creating/verifying database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully!")
    except Exception as e:
        print(f"⚠️ Error creating tables: {e}")

# Read CORS origins from environment variable
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

print(f"🔒 CORS Origins: {CORS_ORIGINS}")  # Debug log

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Add this
)

# Include all routers
print("About to include routers...")

# Admin Endpoints
app.include_router(adminRoutes.router)

# User management (register/login endpoints)
app.include_router(userRoutes.router)

# Progress tracking
app.include_router(progressRoutes.router)

# Milestones
app.include_router(milestoneRoutes.router)

# Lessons and courses
app.include_router(lessonsRoutes.router)

# Assessment management 
app.include_router(assessmentRoutes.router)

# Quiz
app.include_router(quizRoutes.router)

# BKT (Bayesian Knowledge Tracing)
app.include_router(bktRoutes.router) 

print("All routers included.")

# Test root endpoint
@app.get("/")
def read_root():
    return {"message": "TechGuro Backend is Live!"}