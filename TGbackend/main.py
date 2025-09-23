# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from TGbackend.database import engine
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.routers import userRoutes, progressRoutes, lessonsRoutes, assessmentRoutes, bktRoutes, milestoneRoutes, quizRoutes

# Create the database tables
models.Base.metadata.create_all(bind=engine)

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

#Milestones
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