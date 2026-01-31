from sqlalchemy import create_engine
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
import os

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
  raise RuntimeError("Database URL Not set")

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)


engine = create_engine(db_url)

SessionLocal = sessionmaker(autoflush=False, autocomiit=False, bind=engine)



