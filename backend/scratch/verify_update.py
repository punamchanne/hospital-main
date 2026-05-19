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
    # Updated mapping logic from app.py
    age = f[0]
    trestbps = f[3]
    
    full_features = [
        f[0], # age
        f[1], # sex
        f[2], # cp
        f[3], # trestbps
        f[4], # chol
        f[5], # fbs
        0,    # restecg (default)
        f[6], # thalach
        0,    # exang (default)
        1.0 if trestbps > 150 else 0.0, 
        2 if age > 65 else 1,           
        1 if age > 70 else 0,           
        2,    
        1 if (age > 60 and trestbps > 140) else 0, 
        1 if age > 60 else 0            
    ]
    arr = np.array(full_features).reshape(1, -1)
    if imputer: arr = imputer.transform(arr)
    if scaler: arr = scaler.transform(arr)
    
    prob = model.predict_proba(arr)[0][1]
    pred = model.predict(arr)[0]
    return pred, prob

# Case 1: User's values from screenshot
user_features = [95, 1, 2, 195, 445, 1, 195]
pred1, prob1 = get_prediction(user_features)
print(f"Case 1 (Updated Logic): Prob={prob1*100:.2f}%")
