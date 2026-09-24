from sqlalchemy import create_engine
from database import SQLALCHEMY_DATABASE_URL
import sys

print(f"Testing connection to: {SQLALCHEMY_DATABASE_URL}")

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as connection:
        print("SUCCESS! Connected to the database.")
except Exception as e:
    print(f"FAILED to connect.\nError: {e}")
    sys.exit(1)
