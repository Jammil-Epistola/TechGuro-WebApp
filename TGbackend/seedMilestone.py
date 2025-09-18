import os
import json
from sqlalchemy.orm import Session
from TGbackend.database import SessionLocal, engine
from TGbackend.models import Base, Milestone

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Base path for milestone icons in public folder
BASE_MILESTONE_IMG_PATH = "/images/milestones/"

SEED_FOLDER = os.path.join(os.path.dirname(__file__), "seed_milestones")


def load_json_files(folder_path):
    """Load all JSON files from a folder."""
    json_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    data_list = []

    for file_name in json_files:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                data_list.append((file_name, data))
                print(f"✅ Loaded {file_name}")
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing {file_name}: {e}")
    return data_list


def seed_database(session: Session, filename: str, data):
    """Seed milestones from JSON data."""
    if not isinstance(data, list):
        print(f"⚠️ Skipping {filename}: expected top-level array of milestones.")
        return

    for m_data in data:
        if not isinstance(m_data, dict):
            print(f"⚠️ Skipping malformed milestone in {filename}: {m_data}")
            continue

        milestone_id = m_data.get("id")
        if milestone_id is None:
            print(f"⚠️ Milestone missing 'id' in {filename}, skipping.")
            continue

        existing = session.query(Milestone).filter_by(id=milestone_id).first()
        if existing:
            existing.title = m_data.get("title", existing.title)
            existing.description = m_data.get("description", existing.description)
            icon_file = m_data.get("icon_url", "placeholder.png")
            existing.icon_url = BASE_MILESTONE_IMG_PATH + icon_file
            print(f"🔄 Updated milestone {milestone_id} → {existing.title}")
        else:
            new_milestone = Milestone(
                id=milestone_id,
                title=m_data.get("title", ""),
                description=m_data.get("description", ""),
                icon_url=BASE_MILESTONE_IMG_PATH + m_data.get("icon_url", "placeholder.png")
            )
            session.add(new_milestone)
            print(f"➕ Inserted milestone {milestone_id} → {new_milestone.title}")


def main():
    db = SessionLocal()
    try:
        files_data = load_json_files(SEED_FOLDER)
        for filename, data in files_data:
            seed_database(db, filename, data)
        db.commit()
        print("✅ All milestone JSON files seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding milestones: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
