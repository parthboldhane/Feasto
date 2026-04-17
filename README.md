# 🚀 Feasto - Smart Canteen Management System
See for now to LOGIN USE
FOR ADMIN 
USERNAME-ADMIN 
PASSWORD-K@143
AND FOR USER 
USERNAME-USER
AND PASSWORD -K@143
Feasto is a complete web application designed to optimize the canteen ordering experience. It offers a smart dashboard, wait-time predictions, predefined food ordering, loyalty points, and strong administrative controls.

## ✨ Features

### 👤 User Features
- **Smart Crowd Dashboard**: View live crowd percentage with color indicators (🟢 Low, 🟡 Moderate, 🔴 High). Get suggestions on the best time to visit and future predictions.
- **Pre-Order Food**: Browse the menu, select items, and place orders directly from the app.
- **Payment System**: Flexible options with Cash on Delivery (COD) and a Dummy UPI integration.
- **Feasto Coins (Loyalty System)**: Earn coins on every order completion (e.g every ₹1 spend will give you 5 Feasto coins and then 100 festo coin can be used as an discount for ₹2)
- **Unique Order Code**: A secure order verification system combining order IDs with status checks.
- **Feedback & Ratings**: 1-5 star ratings and comment system available after each order.
- **Authentication**: Secure role-based access for both users and admins.

### 👨‍💼 Admin Features
- **Admin Dashboard**: Live overview of current crowd levels, orders, and system status.
- **Manual Crowd Control**: An overriding hybrid control system (70% admin input / 30% system) to accurately reflect current canteen scenarios.
- **Order Management**: Accept/reject incoming orders, verify unique order codes, and see detailed order metrics.
- **Feedback Management**: Analyze user feedback and ratings.

### 🧠 System Features
- **Hybrid Crowd Logic**: Blends admin manual inputs with background logic.
- **Prediction Engine**: Forecasts time-based patterns and trends smoothly.
- **Real-time Live Updates**: Dynamic frontend updates via API.

## 📁 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: FastAPI (Python), Uvicorn.
- **Database**: MongoDB (referenced in system design).

## 🚀 How to Run

### 1. Start the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```
   *The API will be available at `http://localhost:8001`. You can view the automated Swagger docs at `http://localhost:8001/docs`.*

### 2. Start the Frontend

Since the frontend is built using standard web technologies without a bundler, you can serve it via any basic HTTP server.

1. Navigate to the project root directory or the `frontend` folder.
2. Serve the directory:
   - **Using VS Code**: Right-click `frontend/user/index.html` (or `admin/index.html`) and select **"Open with Live Server"**.
   - **Using Python**:
     ```bash
     cd frontend
     python -m http.server 5500
     ```
   - **Using Node.js**:
     ```bash
     cd frontend
     npx serve .
     ```
3. Open the provided local URL in your browser (e.g., `http://localhost:5500/user/index.html`).

---

## 🛠 Project Structure

- **`backend/`**: Contains the FastAPI server, endpoint routes, database connections, and business logic.
- **`frontend/`**: The complete UI split across `/user` and `/admin` sections, along with shared `assets` (CSS/JS) and API configuration.
- **`🚀 FEASTO – COMPLETE FEATURE LIST.txt`**: Detailed list of planned and implemented features.
- **`Complete File Structure.txt`**: Comprehensive breakdown of files and their responsibilities.
