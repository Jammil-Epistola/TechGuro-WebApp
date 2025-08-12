TECHGURO: AI-Based Learning WebApp For Computer Literacy for Adults and Elderly Users
<br>
This Project is for our Thesis with the same Title
<br>
Epistola, Jammil
<br>
Javier, Raquel
<br>
Ojoy, Angel

Local Host Set-up
DATABASE:
  TGbackend/.env : DATABASE_URL=postgresql://postgres:[password]localhost:5432/techguro_db
  <br>
BACKEND:
  cd TGbackend
  venv\Scripts\activate
  cd..
  uvicorn TGbackend.main:app --reload
  <br>
FRONTEND:
  cd TechGuro
  npm run dev
  <br>
DATABASE SEED:
  python -m TGbackend.seedCourse

