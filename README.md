# TrustShield - Continuous Adaptive Authentication Framework

Developed for the **PSB Hackathon** (IIT Gandhinagar & Bank of Baroda).

TrustShield is a privacy-first, risk-based continuous identity trust framework designed to secure customer and enterprise access across digital banking channels. By monitoring contextual signals and behavioral biometrics (keystroke dynamics) in real-time, the system calculates a composite risk score and triggers step-up multi-factor verification (MFA) only when risk levels are elevated. This minimizes friction for legitimate users while effectively mitigating Account Takeover (ATO), KYC fraud, and credential misuse.

---

## Key Features

*   **Behavioral Biometrics (Keystroke Dynamics):** Analyzes key dwell times (how long a key is held) and flight times (interval between keys) using a machine learning engine powered by **Isolation Forest** (unsupervised anomaly detection).
*   **Rule-Based Context Engine:** Evaluates environmental risk signals including unrecognized devices (user-agent), timezone alterations, screen resolution mismatches, and multiple recent failed login attempts.
*   **Targeted Real-Time Step-Up MFA:** Dynamically prompts the user with a 6-digit OTP verification check only if the composite risk score exceeds the acceptable threshold.
*   **Stunning Dark-Theme Dashboard:** A premium, glassmorphism-based financial security interface featuring an animated circular risk gauge, detailed risk factor breakdown, and active session details.

---

## Tech Stack

*   **Frontend:** React 18, Vite, Vanilla CSS (Premium Dark Theme design system, custom animations, SVG assets).
*   **Backend:** FastAPI (Python), Uvicorn, Pydantic, NumPy, Scikit-Learn (ML modeling).

---

## System Architecture Flow

1.  **Invisible Capture:** The React frontend monitors the password input fields during login to record keystroke dynamics alongside standard credentials and environmental context (IP, user-agent, timezone, resolution).
2.  **Authentication & Evaluation:** The credentials are validated. If correct, the backend triggers the **Context Engine** (weighted rules up to 75 points) and the **ML Biometric Engine** (keystroke anomaly scoring up to 25 points).
3.  **Risk Decision:**
    *   **Low Risk (0–30) / Medium Risk (31–60):** User receives an immediate session token (Friction-Optimized Access).
    *   **High Risk (61–100):** A step-up MFA challenge is issued, displaying a 6-digit OTP input modal.
4.  **Verification:** Upon entering the correct OTP (printed in the backend console for demo verification), the session token is generated and the user is redirected to the Dashboard.

---

## Setup & Execution Instructions

Ensure you have [Python 3.10+](https://www.python.org/downloads/) and [Node.js](https://nodejs.org/) installed.

### 1. Backend Server Setup
Navigate to the backend directory, install the required libraries, and start the FastAPI uvicorn server:
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server (runs on port 8000)
python -m uvicorn main:app --reload --port 8000
```
*The interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### 2. Frontend Setup
In a new terminal window, navigate to the frontend directory, install npm packages, and run the development server:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## Demo Accounts & How to Test

We have pre-seeded three demo accounts in the in-memory user store:

*   **Username:** `demo_user` | **Password:** `password123`
*   **Username:** `admin_user` | **Password:** `admin@456`
*   **Username:** `test_user` | **Password:** `test789`

### How to trigger anomalous behaviors:
1.  **Frictionless Login:** Log in typing at a normal, steady pace. Since it's the first login, it registers your initial baseline.
2.  **High Risk (New Device / Timezone):** Try logging in from a different browser or simulated device resolution, or type with highly irregular rhythms (very fast, long pauses between keys). 
3.  **Step-Up Verification:** The high-risk score will lock the login and prompt you with an OTP modal. You can see the generated 6-digit code printing live on your running backend terminal. Enter it to unlock your dashboard and view the risk analyzer display!
