from fastapi import FastAPI, Query
from datetime import datetime, timedelta
import random
from threading import Lock

app = FastAPI()

last_value = 50
lock = Lock()

# ADMIN INPUT (OPTION B)
admin_value = None

# -------------------------------
# BASE CROWD (UPDATED LOGIC)
# -------------------------------
def get_base_crowd(hour: int) -> int:
    if 12 <= hour < 13:   # lunch peak
        return 90
    elif 13 <= hour < 14: # post lunch
        return 70
    elif 8 <= hour <= 10:
        return 50
    elif 16 <= hour <= 18:
        return 65
    return 30

# -------------------------------
# SMOOTH CURRENT CROWD
# -------------------------------
def smooth_change(base: int) -> int:
    global last_value

    with lock:
        drift = (base - last_value) * 0.1
        noise = random.randint(-5, 5)

        new_value = last_value + drift + noise
        new_value = max(0, min(100, int(new_value)))

        last_value = new_value
        return new_value

# -------------------------------
# LEVEL + SUGGESTION
# -------------------------------
def get_level(value: int) -> str:
    if value < 40:
        return "LOW"
    elif value < 70:
        return "MODERATE"
    return "HIGH"

def get_suggestion(level: str) -> str:
    if level == "LOW":
        return "Go now"
    elif level == "MODERATE":
        return "Okay to go"
    return "Wait 15 min"

# -------------------------------
# TIME FACTOR (IMPROVED)
# -------------------------------
def get_time_factor(hour: int) -> int:
    if 12 <= hour < 13:
        return 15
    elif 13 <= hour < 14:
        return 5
    elif 16 <= hour <= 18:
        return 10
    elif hour >= 18:
        return -10
    return -5

# -------------------------------
# ROBUST PREDICTION
# -------------------------------
def robust_prediction(current: int, base: int, hour: int) -> int:
    difference = abs(current - base)

    if difference > 15:
        w_current = 0.5
        w_base = 0.3
    else:
        w_current = 0.3
        w_base = 0.5

    w_time = 0.2

    time_factor = get_time_factor(hour)

    prediction = (
        current * w_current +
        base * w_base +
        time_factor * w_time
    )

    return max(0, min(100, int(prediction)))

# -------------------------------
# ADMIN BLENDING (OPTION B)
# -------------------------------
def apply_admin_blend(system_value: int) -> int:
    global admin_value

    if admin_value is None:
        return system_value

    # 70% admin + 30% system
    final = int((admin_value * 0.7) + (system_value * 0.3))
    return max(0, min(100, final))

# -------------------------------
# FUTURE TIMELINE
# -------------------------------
def generate_timeline(current: int):
    timeline = []
    now = datetime.now()

    for i in range(1, 5):
        future_time = now + timedelta(minutes=15 * i)
        hour = future_time.hour

        base = get_base_crowd(hour)
        predicted = robust_prediction(current, base, hour)

        predicted = apply_admin_blend(predicted)

        timeline.append({
            "time": future_time.strftime("%H:%M"),
            "crowd": predicted,
            "level": get_level(predicted)
        })

    return timeline

# -------------------------------
# BEST TIME
# -------------------------------
def get_best_time(timeline):
    return min(timeline, key=lambda x: x["crowd"])

# -------------------------------
# MAIN API
# -------------------------------
@app.get("/api/crowd")
def get_crowd():
    now = datetime.now()
    hour = now.hour

    base = get_base_crowd(hour)
    current = smooth_change(base)

    current = apply_admin_blend(current)

    level = get_level(current)
    suggestion = get_suggestion(level)

    timeline = generate_timeline(current)
    best_time = get_best_time(timeline)

    if level == "HIGH":
        recommendation = f"Not a good time. Try at {best_time['time']}"
    else:
        recommendation = suggestion

    return {
        "currentCrowd": current,
        "level": level,
        "suggestion": suggestion,
        "timeline": timeline,
        "bestTime": best_time["time"],
        "recommendation": recommendation,
        "timestamp": now.isoformat()
    }

# -------------------------------
# NEW: PREDICT ANY TIME 🔥
# -------------------------------
@app.get("/api/crowd/predict")
def predict_time(time: str = Query(..., example="13:30")):
    try:
        hour, minute = map(int, time.split(":"))
    except:
        return {"error": "Invalid time format. Use HH:MM"}

    now = datetime.now()

    base = get_base_crowd(hour)
    current = last_value  # use last known

    predicted = robust_prediction(current, base, hour)
    predicted = apply_admin_blend(predicted)

    return {
        "time": time,
        "predictedCrowd": predicted,
        "level": get_level(predicted),
        "suggestion": get_suggestion(get_level(predicted))
    }

# -------------------------------
# ADMIN INPUT
# -------------------------------
@app.post("/api/admin/crowd")
def set_admin_crowd(value: int):
    global admin_value
    admin_value = value

    return {
        "message": "Admin crowd updated",
        "adminValue": admin_value
    }