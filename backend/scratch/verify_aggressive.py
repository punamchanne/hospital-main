import joblib
import os
import numpy as np

MODEL_DIR = r"c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\backend\models"
MODEL_PATH = os.path.join(MODEL_DIR, 'heart_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
IMPUTER_PATH = os.path.join(MODEL_DIR, 'imputer.pkl')

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
imputer = joblib.load(IMPUTER_PATH) if os.path.exists(IMPUTER_PATH) else None

def get_prediction(f):
    # Aggressive mapping logic from app.py
    age = f[0]
    trestbps = f[3]
    chol = f[4]
    is_critical_bp = 1 if trestbps > 180 else 0
    is_critical_chol = 1 if chol > 400 else 0
    
    full_features = [
        f[0], f[1], f[2], f[3], f[4], f[5],
        1 if (trestbps > 160) else 0,
        f[6],
        1 if (is_critical_bp or age > 80) else 0,
        3.0 if (is_critical_bp or is_critical_chol) else (1.0 if trestbps > 150 else 0.0),
        2 if (age > 60 or is_critical_bp) else 1,
        3 if (age > 80 or is_critical_bp) else (1 if age > 65 else 0),
        3 if (is_critical_bp or is_critical_chol) else 2,
        1 if (age > 60 or trestbps > 150) else 0,
        1 if age > 60 else 0
    ]
    arr = np.array(full_features).reshape(1, -1)
    if imputer: arr = imputer.transform(arr)
    if scaler: arr = scaler.transform(arr)
    
    prob = model.predict_proba(arr)[0][1]
    return prob

user_features = [95, 1, 2, 195, 445, 1, 195]
prob = get_prediction(user_features)
print(f"Aggressive Case Prob={prob*100:.2f}%")
