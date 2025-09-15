TECHGURO: AI-Based Learning WebApp For Computer Literacy for Adults and Elderly Users
<br>
This Project is for our Thesis with the same Title
<br>
Epistola, Jammil
<br>
Javier, Raquel
<br>
Ojoy, Angel

Local Host Set-up<br>
DATABASE:<br>
  TGbackend/.env : DATABASE_URL=postgresql://postgres:[password]localhost:5432/techguro_db
  <br>
ALEMBIC MIGRATION:<br>
  alembic revision --autogenerate -m "Initial migration"<br>
  alembic upgrade head<br>
BACKEND:<br>
  cd TGbackend<br>
  venv\Scripts\activate<br>
  cd..<br>
  uvicorn TGbackend.main:app --reload<br>
  <br>
FRONTEND:<br>
  cd TechGuro<br>
  npm run dev<br>
  <br>
DATABASE SEED:<br>
  python -m TGbackend.seedCourse<br>
  python -m TGbackend.seedMilestone<br>


