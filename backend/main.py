from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from db import users, db
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime, timedelta
import os
import re

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET")

# Collections
friend_requests = db["friend_requests"]
friendships = db["friendships"]

class RegisterModel(BaseModel):
    name: str
    surname: str
    gender: str
    job: str
    email: EmailStr
    password: str
    anxiety: int

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class UpdateProfileModel(BaseModel):
    name: str
    email: EmailStr
    gender: str
    occupation: str
    anxietyLevel: int

class ChangePasswordModel(BaseModel):
    currentPassword: str
    newPassword: str

class ChallengeCompletionModel(BaseModel):
    challengeText: str
    date: str

class FriendRequestModel(BaseModel):
    targetUserId: str

class FriendRequestActionModel(BaseModel):
    requestId: str

def hash_pass(p):
    return pwd.hash(p)

def verify(p, h):
    return pwd.verify(p, h)

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["id"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_by_id(user_id: str):
    """Helper function to get user by ID"""
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        return user
    except:
        return None

def format_user_response(user):
    """Format user data for API responses"""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "surname": user.get("surname", ""),
        "email": user["email"],
        "gender": user.get("gender", ""),
        "occupation": user.get("occupation", user.get("job", "")),
        "lifetimeCompleted": user.get("lifetimeCompleted", 0),
        "currentStreak": user.get("currentStreak", 0),
        "longestStreak": user.get("longestStreak", 0),
        "weeklyCompleted": user.get("weeklyCompleted", 0),
        "monthlyCompleted": user.get("monthlyCompleted", 0)
    }

@app.post("/api/register")
def register(data: RegisterModel):
    if users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User exists")

    res = users.insert_one({
        "name": data.name,
        "surname": data.surname,
        "gender": data.gender,
        "occupation": data.job,
        "email": data.email,
        "password": hash_pass(data.password),
        "anxietyLevel": data.anxiety,
        "lifetimeCompleted": 0,
        "currentStreak": 0,
        "longestStreak": 0,
        "weeklyCompleted": 0,
        "monthlyCompleted": 0,
        "lastCompletionDate": None,
        "weekResetDate": datetime.now().isoformat(),
        "monthResetDate": datetime.now().isoformat(),
        "challengeHistory": [],
        "achievements": []
    })

    user_id = str(res.inserted_id)
    
    # Generate JWT token
    token = jwt.encode({"id": user_id}, JWT_SECRET, algorithm="HS256")

    # Return token and user data (same format as login)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": data.name,
            "surname": data.surname,
            "email": data.email,
            "gender": data.gender,
            "occupation": data.job,
            "anxietyLevel": data.anxiety
        }
    }

@app.post("/api/login")
def login(data: LoginModel):
    user = users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = jwt.encode({"id": str(user["_id"])}, JWT_SECRET, algorithm="HS256")

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "surname": user.get("surname", ""),
            "email": user["email"],
            "gender": user["gender"],
            "occupation": user.get("occupation", user.get("job", "")),
            "anxietyLevel": user.get("anxietyLevel", user.get("anxiety", 5))
        }
    }

@app.put("/api/users/{user_id}")
def update_profile(user_id: str, data: UpdateProfileModel, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "name": data.name,
            "email": data.email,
            "gender": data.gender,
            "occupation": data.occupation,
            "anxietyLevel": data.anxietyLevel
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = users.find_one({"_id": ObjectId(user_id)})
    
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "gender": updated_user["gender"],
        "occupation": updated_user["occupation"],
        "anxietyLevel": updated_user["anxietyLevel"]
    }

@app.post("/api/users/{user_id}/uncomplete-challenge")
def uncomplete_challenge(user_id: str, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    lifetime_completed = max(0, user.get("lifetimeCompleted", 0) - 1)
    weekly_completed = max(0, user.get("weeklyCompleted", 0) - 1)
    monthly_completed = max(0, user.get("monthlyCompleted", 0) - 1)
    users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "lifetimeCompleted": lifetime_completed,
            "weeklyCompleted": weekly_completed,
            "monthlyCompleted": monthly_completed
        }}
    )
    return {"lifetimeCompleted": lifetime_completed}

@app.put("/api/users/{user_id}/password")
def change_password(user_id: str, data: ChangePasswordModel, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify(data.currentPassword, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hash_pass(data.newPassword)}}
    )

    return {"success": True, "message": "Password changed successfully"}

@app.delete("/api/users/{user_id}")
def delete_account(user_id: str, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = users.delete_one({"_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "Account deleted successfully"}

@app.get("/api/users/{user_id}/lifetime-completed")
def get_lifetime_completed(user_id: str, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"lifetimeCompleted": user.get("lifetimeCompleted", 0)}

@app.post("/api/users/{user_id}/complete-challenge")
def complete_challenge(user_id: str, data: ChallengeCompletionModel, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_streak = user.get("currentStreak", 0)
    longest_streak = user.get("longestStreak", 0)
    last_completion = user.get("lastCompletionDate")
    lifetime_completed = user.get("lifetimeCompleted", 0)
    weekly_completed = user.get("weeklyCompleted", 0)
    monthly_completed = user.get("monthlyCompleted", 0)
    achievements = user.get("achievements", [])

    today = datetime.now().date().isoformat()
    now = datetime.now()
    
    # Check if we need to reset weekly/monthly counters
    week_reset = user.get("weekResetDate")
    month_reset = user.get("monthResetDate")
    
    if week_reset:
        week_reset_date = datetime.fromisoformat(week_reset)
        if (now - week_reset_date).days >= 7:
            weekly_completed = 0
            week_reset = now.isoformat()
    
    if month_reset:
        month_reset_date = datetime.fromisoformat(month_reset)
        if (now - month_reset_date).days >= 30:
            monthly_completed = 0
            month_reset = now.isoformat()
    
    # Update streak
    if last_completion:
        last_date = datetime.fromisoformat(last_completion).date()
        today_date = datetime.now().date()
        
        if (today_date - last_date).days == 1:
            current_streak += 1
        elif (today_date - last_date).days > 1:
            current_streak = 1
    else:
        current_streak = 1

    if current_streak > longest_streak:
        longest_streak = current_streak

    lifetime_completed += 1
    weekly_completed += 1
    monthly_completed += 1

    new_achievements = []
    if lifetime_completed == 1 and "first_challenge" not in achievements:
        new_achievements.append("first_challenge")
    if current_streak == 7 and "week_warrior" not in achievements:
        new_achievements.append("week_warrior")
    if lifetime_completed == 50 and "social_butterfly" not in achievements:
        new_achievements.append("social_butterfly")
    if current_streak == 30 and "comfort_zone_breaker" not in achievements:
        new_achievements.append("comfort_zone_breaker")

    users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "currentStreak": current_streak,
                "longestStreak": longest_streak,
                "lastCompletionDate": today,
                "lifetimeCompleted": lifetime_completed,
                "weeklyCompleted": weekly_completed,
                "monthlyCompleted": monthly_completed,
                "weekResetDate": week_reset,
                "monthResetDate": month_reset
            },
            "$push": {
                "challengeHistory": {
                    "text": data.challengeText,
                    "date": data.date,
                    "completedAt": datetime.now().isoformat()
                }
            },
            "$addToSet": {
                "achievements": {"$each": new_achievements}
            }
        }
    )

    return {
        "currentStreak": current_streak,
        "longestStreak": longest_streak,
        "lifetimeCompleted": lifetime_completed,
        "newAchievements": new_achievements
    }

@app.get("/api/users/{user_id}/stats")
def get_user_stats(user_id: str, authorization: str = Header(None)):
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "currentStreak": user.get("currentStreak", 0),
        "longestStreak": user.get("longestStreak", 0),
        "lifetimeCompleted": user.get("lifetimeCompleted", 0),
        "achievements": user.get("achievements", []),
        "challengeHistory": user.get("challengeHistory", [])
    }

# ========== FRIENDS SYSTEM ==========

@app.get("/api/users/search")
def search_users(query: str, exclude: str = None):
    """Search for users by name, surname, or email"""
    if not query or len(query) < 2:
        return {"users": []}
    
    # Create case-insensitive regex pattern
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    
    search_filter = {
        "$or": [
            {"name": {"$regex": pattern}},
            {"surname": {"$regex": pattern}},
            {"email": {"$regex": pattern}}
        ]
    }
    
    # Exclude specific user (usually the searcher)
    if exclude:
        try:
            search_filter["_id"] = {"$ne": ObjectId(exclude)}
        except:
            pass
    
    found_users = users.find(search_filter).limit(20)
    
    results = []
    for user in found_users:
        results.append(format_user_response(user))
    
    return {"users": results}

@app.get("/api/users/{user_id}/friends")
def get_friends(user_id: str, authorization: str = Header(None)):
    """Get all friends of a user"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Find all friendships where user is involved
    friendships_list = friendships.find({
        "$or": [
            {"user1_id": user_id},
            {"user2_id": user_id}
        ],
        "status": "accepted"
    })
    
    friends_data = []
    for friendship in friendships_list:
        # Get the friend's ID (the other user in the friendship)
        friend_id = friendship["user2_id"] if friendship["user1_id"] == user_id else friendship["user1_id"]
        
        # Get friend's data
        friend = get_user_by_id(friend_id)
        if friend:
            friends_data.append(format_user_response(friend))
    
    return {"friends": friends_data}

@app.post("/api/users/{user_id}/friend-requests/send")
def send_friend_request(user_id: str, data: FriendRequestModel, authorization: str = Header(None)):
    """Send a friend request"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    target_user_id = data.targetUserId
    
    # Check if target user exists
    target_user = get_user_by_id(target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    # Check if already friends
    existing_friendship = friendships.find_one({
        "$or": [
            {"user1_id": user_id, "user2_id": target_user_id},
            {"user1_id": target_user_id, "user2_id": user_id}
        ]
    })
    
    if existing_friendship:
        raise HTTPException(status_code=400, detail="Already friends or request pending")
    
    # Check if request already exists
    existing_request = friend_requests.find_one({
        "sender_id": user_id,
        "recipient_id": target_user_id,
        "status": "pending"
    })
    
    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already sent")
    
    # Create friend request
    sender = get_user_by_id(user_id)
    friend_requests.insert_one({
        "sender_id": user_id,
        "recipient_id": target_user_id,
        "senderName": sender["name"],
        "senderSurname": sender.get("surname", ""),
        "recipientName": target_user["name"],
        "recipientSurname": target_user.get("surname", ""),
        "status": "pending",
        "createdAt": datetime.now().isoformat()
    })
    
    return {"success": True, "message": "Friend request sent"}

@app.get("/api/users/{user_id}/friend-requests/pending")
def get_pending_requests(user_id: str, authorization: str = Header(None)):
    """Get friend requests received by the user"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    requests = friend_requests.find({
        "recipient_id": user_id,
        "status": "pending"
    })
    
    result = []
    for req in requests:
        result.append({
            "id": str(req["_id"]),
            "senderId": req["sender_id"],
            "senderName": req["senderName"],
            "senderSurname": req.get("senderSurname", ""),
            "createdAt": req["createdAt"]
        })
    
    return {"requests": result}

@app.get("/api/users/{user_id}/friend-requests/sent")
def get_sent_requests(user_id: str, authorization: str = Header(None)):
    """Get friend requests sent by the user"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    requests = friend_requests.find({
        "sender_id": user_id,
        "status": "pending"
    })
    
    result = []
    for req in requests:
        result.append({
            "id": str(req["_id"]),
            "recipientId": req["recipient_id"],
            "recipientName": req["recipientName"],
            "recipientSurname": req.get("recipientSurname", ""),
            "createdAt": req["createdAt"]
        })
    
    return {"requests": result}

@app.post("/api/users/{user_id}/friend-requests/accept")
def accept_friend_request(user_id: str, data: FriendRequestActionModel, authorization: str = Header(None)):
    """Accept a friend request"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Find the request
    try:
        request = friend_requests.find_one({
            "_id": ObjectId(data.requestId),
            "recipient_id": user_id,
            "status": "pending"
        })
    except:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    if not request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    sender_id = request["sender_id"]
    
    # Create friendship
    friendships.insert_one({
        "user1_id": sender_id,
        "user2_id": user_id,
        "status": "accepted",
        "createdAt": datetime.now().isoformat()
    })
    
    # Update request status
    friend_requests.update_one(
        {"_id": ObjectId(data.requestId)},
        {"$set": {"status": "accepted"}}
    )
    
    return {"success": True, "message": "Friend request accepted"}

@app.post("/api/users/{user_id}/friend-requests/reject")
def reject_friend_request(user_id: str, data: FriendRequestActionModel, authorization: str = Header(None)):
    """Reject a friend request"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Update request status
    try:
        result = friend_requests.update_one(
            {
                "_id": ObjectId(data.requestId),
                "recipient_id": user_id,
                "status": "pending"
            },
            {"$set": {"status": "rejected"}}
        )
    except:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    return {"success": True, "message": "Friend request rejected"}

@app.delete("/api/users/{user_id}/friends/{friend_id}")
def remove_friend(user_id: str, friend_id: str, authorization: str = Header(None)):
    """Remove a friend"""
    token_user_id = verify_token(authorization)
    
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Delete friendship
    result = friendships.delete_one({
        "$or": [
            {"user1_id": user_id, "user2_id": friend_id},
            {"user1_id": friend_id, "user2_id": user_id}
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    return {"success": True, "message": "Friend removed"}

# ========== LEADERBOARD ==========

@app.get("/api/leaderboard/{ranking_type}")
def get_leaderboard(ranking_type: str):
    """
    Get leaderboard based on type
    Types: lifetime, weekly, monthly, streak
    """
    valid_types = ["lifetime", "weekly", "monthly", "streak"]
    if ranking_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid ranking type")
    
    # Determine sort field
    if ranking_type == "lifetime":
        sort_field = "lifetimeCompleted"
    elif ranking_type == "weekly":
        sort_field = "weeklyCompleted"
    elif ranking_type == "monthly":
        sort_field = "monthlyCompleted"
    elif ranking_type == "streak":
        sort_field = "currentStreak"
    
    # Get top users
    top_users = users.find().sort(sort_field, -1).limit(100)
    
    leaderboard = []
    for user in top_users:
        leaderboard.append(format_user_response(user))
    
    return {"leaderboard": leaderboard}

@app.get("/api/test-db")
def test_db():
    return {"count": users.count_documents({})}