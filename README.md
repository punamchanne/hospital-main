# Hospital‑Main 📋

**A lightweight web portal for a health‑monitoring dashboard with a **heart‑disease risk prediction** model**.  
The project ships a **React + Vite** frontend, a **Flask** backend serving a pretrained RandomForest model, and a collection of evaluation graphs.

---

## Table of Contents
- [Demo](#demo)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup – Backend (Flask)](#setup--backend-flask)
- [Setup – Frontend (React)](#setup--frontend-react)
- [Training a New Model](#training-a-new-model)
- [Running the Full Stack](#running-the-full-stack)
- [API Reference](#api-reference)
- [Visualization Assets](#visualization-assets)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Demo
Open the React UI (`frontend`) in a browser and fill the form with patient data. The app will call the Flask endpoint and display either:
- **⚠️ High risk of heart disease** (prediction = 1)
- **✅ Low risk – heart disease unlikely** (prediction = 0)

> The UI mirrors the original static HTML (`predict.html`) but with a premium glass‑morphism design and smooth micro‑animations.

---

## Project Structure
```
hospital-main/
├─ frontend/                # React + Vite (Client)
│   ├─ src/
│   ├─ package.json
│   └─ vite.config.js
├─ backend/                 # Flask API (Server)
│   ├─ app.py               # Main API logic
│   ├─ train_model.py       # Training script
│   ├─ models/              # ML Models & Preprocessing
│   └─ graphs/              # Analysis Graphs
├─ legacy/                  # Old HTML/JS files
└─ README.md
```
## Folder Descriptions

- **frontend/** – The React application (Client-side).
- **backend/** – The Flask server, ML models, and data processing (Server-side).
- **backend/models/** – Pickled ML models (`heart_model.pkl`) and scalers.
- **backend/graphs/** – Evaluation plots served by the API.
- **legacy/** – Older static versions of the project.

```

---

## Prerequisites
| Tool | Minimum version |
|------|-----------------|
| **Node.js** | 20.x (for Vite) |
| **npm** | 10.x |
| **Python** | 3.11 |
| **Git** | any (for cloning) |

> **Tip:** Use a virtual environment (`python -m venv venv`) for the Python side to avoid polluting your global packages.

---

## Setup – Backend (Flask)
```powershell
# 1️⃣ Navigate to the backend folder
cd "c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\backend"

# 2️⃣ (Optional) create & activate a venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3️⃣ Install dependencies
pip install -r .\requirements.txt

# 4️⃣ Verify the pretrained artefacts exist in \models (they are shipped with the repo)
#    If you want to train your own model, see the section below.

# 5️⃣ Run the API
python app.py   # runs on http://localhost:5000
```
The API exposes two routes:
- `POST /predict` – expects JSON `{ "features": [age, sex, cp, trestbps, chol, fbs, thalach] }`
- `GET /graphs/<filename>` – serves static evaluation images (e.g. `roc_curve.png`).

---

## Setup – Frontend (React)
```powershell
# 1️⃣ Navigate to the frontend folder
cd "c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\frontend"

# 2️⃣ Install npm packages
npm install

# 3️⃣ Launch the dev server (Vite opens http://localhost:5173)
npm run dev
```
The React app talks to the Flask service at `http://localhost:5000/predict`.  Ensure the backend is running before submitting the form.

---

## Training a New Model
If you have a customised dataset (CSV with the same column layout as the UCI Heart Disease set), run:
```powershell
cd "c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\backend"
python train_model.py   # produces model.pkl and preprocessing artefacts
```
After training, **replace** the files in the `models/` directory with the newly generated ones (`heart_model.pkl`, `scaler.pkl`, `imputer.pkl`, `features.pkl`).  The Flask API will automatically pick them up on the next start.

---

## Running the Full Stack
1. **Start Flask** (`npm run dev` can be run in a separate terminal).<br>
2. **Start Vite** (`npm run dev`).<br>
3. Open `http://localhost:5173` in your browser.
4. Fill the form, click **Predict Risk**, and view the result.
5. (Optional) Browse evaluation graphs via `http://localhost:5000/graphs/roc_curve.png`.

---

## API Reference
```http
POST /predict HTTP/1.1
Content-Type: application/json

{
  "features": [
    63,   // age
    1,    // sex (1=m, 0=f)
    3,    // chest‑pain type (0‑3)
    145,  // resting blood pressure
    233,  // serum cholesterol
    1,    // fasting blood sugar (>120 mg/dl)
    150   // max heart rate achieved
  ]
}
```
**Response (200)**
```json
{ "prediction": 1 }
```
`1` = disease present, `0` = absent.

---

## Visualization Assets
The `graphs/` folder contains pre‑generated plots that you can embed directly in the UI. Example usage in React:
```jsx
<img src="http://localhost:5000/graphs/roc_curve.png" alt="ROC Curve" style={{width: '100%'}} />
```
Feel free to add more visualisations – they are served statically by Flask.

---

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| **CORS error** in browser console | Flask not allowing origin | Ensure `CORS(app)` is present in `app.py`. You can restrict origins in production by passing `origins=['http://localhost:5173']`.
| **`Connection refused`** when clicking Predict | Flask not running or wrong port | Run `python app.py` and verify it listens on `http://localhost:5000`.
| **`Model file not found`** on Flask start | `models/` folder missing or renamed | Keep the pretrained artefacts in `hospital-main/models/` exactly as named.
| **UI does not update** after submitting | Browser cached old JS | Hard‑refresh (`Ctrl+Shift+R`) or stop the Vite dev server and restart.

---

## License
This project is provided **as‑is** for educational purposes.  Feel free to fork, modify, and deploy it in any environment.  No commercial warranty is implied.

---

*Happy hacking! 🎉*
