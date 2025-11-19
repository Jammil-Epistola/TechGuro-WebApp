# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from TGbackend.database import engine, Base
from TGbackend.database import SessionLocal
from TGbackend import models
from TGbackend.routers import userRoutes, progressRoutes, lessonsRoutes, assessmentRoutes, bktRoutes, milestoneRoutes, quizRoutes, adminRoutes

# Initialize FastAPI
app = FastAPI()

print("🔒 Configuring CORS...")

# Read CORS origins from environment variable or use defaults
CORS_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "")

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Add production origins if they exist
if CORS_ORIGINS_ENV:
    CORS_ORIGINS.extend(CORS_ORIGINS_ENV.split(","))

print(f"✅ CORS middleware configured with origins: {CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to create tables automatically
#@app.on_event("startup")
#async def startup_event():
#    try:
#        print("🔄 Creating/verifying database tables...")
#        Base.metadata.create_all(bind=engine)
#        print("✅ Database tables created/verified successfully!")
#    except Exception as e:
#        print(f"⚠️ Error creating tables: {e}")

# Include all routers
print("📦 Including routers...")

app.include_router(adminRoutes.router)
app.include_router(userRoutes.router)
app.include_router(progressRoutes.router)
app.include_router(milestoneRoutes.router)
app.include_router(lessonsRoutes.router)
app.include_router(assessmentRoutes.router)
app.include_router(quizRoutes.router)
app.include_router(bktRoutes.router) 

print("✅ All routers included")

# Test root endpoint
@app.get("/")
def read_root():
    return {"message": "TechGuro Backend is Live!"}