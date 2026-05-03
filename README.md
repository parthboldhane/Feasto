🚀 Feasto - Smart Canteen Management System

Login Credentials (for testing/demo purposes):

- Admin Access
  Username: "ADMIN"
  Password: "K@143"

- User Access
  Username: "USER"
  Password: "K@143"

---

Feasto is a full-stack web application designed to streamline and enhance the canteen ordering experience. It combines intelligent crowd monitoring, efficient pre-ordering, loyalty rewards, and robust administrative controls into a single platform.

---

✨ Features

👤 User Features

- Smart Crowd Dashboard
  Monitor real-time crowd levels with intuitive color indicators:
  🟢 Low | 🟡 Moderate | 🔴 High
  Includes smart suggestions for optimal visit times and future crowd predictions.

- Pre-Order System
  Browse the menu, select items, and place orders seamlessly through the application.

- Flexible Payment Options
  Supports Cash on Delivery (COD) and a simulated UPI payment system.

- Feasto Coins (Loyalty Program)
  Earn rewards on every purchase:
  
  - ₹1 spent = 5 Feasto Coins
  - 100 Coins = ₹2 discount

- Secure Order Verification
  Unique order codes ensure safe and reliable order tracking and validation.

- Feedback & Ratings
  Submit 1–5 star ratings along with comments after completing an order.

- Authentication System
  Secure, role-based login for both users and administrators.

---

👨‍💼 Admin Features

- Admin Dashboard
  Real-time overview of crowd density, active orders, and overall system status.

- Manual Crowd Control
  Hybrid system combining:
  
  - 70% admin input
  - 30% system-generated data
    for accurate real-world representation.

- Order Management
  Accept or reject orders, verify order codes, and monitor detailed order analytics.

- Feedback Analysis
  Access and evaluate user ratings and feedback to improve service quality.

---

🧠 System Features

- Hybrid Crowd Intelligence
  Integrates manual inputs with automated logic for improved accuracy.

- Prediction Engine
  Analyzes historical patterns to forecast crowd trends.

- Real-Time Updates
  Dynamic frontend updates powered by API integration.

---

📁 Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: FastAPI (Python), Uvicorn
- Database: MongoDB (as per system design)

---

🚀 How to Run

1. Start the Backend

1. Navigate to the backend directory:
   
   cd backend

2. (Optional) Create and activate a virtual environment:
   
   python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

3. Install dependencies:
   
   pip install -r requirements.txt

4. Run the server:
   
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   
   The API will be available at:
   "http://localhost:8001"
   Swagger Docs:
   "http://localhost:8001/docs"

---

2. Start the Frontend

Since the frontend uses plain web technologies, it can be served using any basic HTTP server.

1. Navigate to the frontend directory:
   
   cd frontend

2. Serve the project using one of the following methods:
   
   - VS Code (Recommended)
     Right-click "user/index.html" or "admin/index.html" → Open with Live Server
   
   - Python Server
     
     python -m http.server 5500
   
   - Node.js
     
     npx serve .

3. Open in browser:
   
   http://localhost:5500/user/index.html

---

🛠 Project Structure

- "backend/"
  Contains FastAPI server, API routes, database integration, and core business logic.

- "frontend/"
  User interface divided into "/user" and "/admin" modules, along with shared assets (CSS/JS) and API configuration.

- "🚀 FEASTO – COMPLETE FEATURE LIST.txt"
  Detailed documentation of all implemented and planned features.

- "Complete File Structure.txt"
  In-depth breakdown of project architecture and file responsibilities.