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

client = MongoClient(MONGO_URI)

try:
    client.admin.command("ping")
    print("MongoDB connected")
except ServerSelectionTimeoutError as e:
    print("MongoDB connection failed:", e)

db = client[DB_NAME]
users = db["users"]
