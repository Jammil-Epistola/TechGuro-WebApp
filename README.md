# TECHGURO

An AI-Based Learning WebApp for Computer Literacy designed for Adults and Elderly Users.

## About

This project is developed as part of our thesis with the same title.

**Team Members:**
- Epistola, Jammil
- Javier, Raquel
- Ojoy, Angel

---

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- [Visual Studio Code](https://code.visualstudio.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js](https://nodejs.org/) (for npm)
- [Python 3.x](https://www.python.org/downloads/)

### 1. Database Setup

First, create a PostgreSQL database named `techguro_db`.

Then configure your database connection:

**Update `TGbackend/.env`:**
```
DATABASE_URL=postgresql://postgres:[your_password]@localhost:5432/techguro_db
```

**Update `alembic.ini`:**

Find the `sqlalchemy.url` line and replace it with the same PostgreSQL URL:
```
sqlalchemy.url = postgresql://postgres:[your_password]@localhost:5432/techguro_db
```

### 2. Backend Setup

**Set up the virtual environment:**

```bash
cd TGbackend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
cd ..
```

**Install Python dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

Check `.env.example` for reference on required environment variables for local development. Note: Leave `CLOUDINARY_URL` as is, as it points to the centralized image storage.

**Run database migrations:**

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

**Seed the database:**

This will populate the database with all necessary initial data including courses and milestones.

```bash
python -m TGbackend.seedAll
```

### 3. Frontend Setup

**Install dependencies:**

```bash
cd TechGuro
npm install
```

---

## Running the Application

### Start the Backend Server

```bash
cd TGbackend
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
cd ..
uvicorn TGbackend.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Start the Frontend Development Server

In a new terminal:

```bash
cd TechGuro
npm run dev
```

The frontend will be available at the URL shown in your terminal (typically `http://localhost:5173` or `http://localhost:3000`)

---

## Troubleshooting

- **Database connection errors:** Ensure PostgreSQL is running and your credentials in `.env` and `alembic.ini` are correct
- **Port conflicts:** If ports 8000 or 5173/3000 are in use, you can specify different ports in the respective configuration files
- **Migration issues:** If you encounter migration errors, you may need to drop and recreate your database

---

## Contact

For questions or support, please contact the development team.