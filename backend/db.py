from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI:
    raise Exception("MONGO_URI not loaded from .env")

if not DB_NAME:
    raise Exception("DB_NAME not loaded from .env")

try:
    client = MongoClient(
        MONGO_URI,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000
    )
    client.admin.command("ping")
    print("✅ MongoDB connected successfully!")
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}")
    print("⚠️ Server will run but database operations will fail")
    client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)

db = client[DB_NAME]
users = db["users"]