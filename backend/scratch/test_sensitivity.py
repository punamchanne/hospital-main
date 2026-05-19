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
    # Mapping logic from app.py
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
        0.0,  # oldpeak (default)
        1,    # slope (default)
        0,    # ca (default)
        2,    # thal (default)
        0,    # cv_index (default)
        0     # elder_sym (default)
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
print(f"Case 1 (Screenshot): Pred={pred1}, Prob={prob1*100:.2f}%")

# Case 2: Low Thalach (Max Heart Rate) - should increase risk
low_thalach_features = [95, 1, 2, 195, 445, 1, 60]
pred2, prob2 = get_prediction(low_thalach_features)
print(f"Case 2 (Low Thalach): Pred={pred2}, Prob={prob2*100:.2f}%")

# Case 3: Extreme High Risk (all defaults set to high risk values)
def get_extreme_prediction(f):
    full_features = [
        f[0], f[1], f[2], f[3], f[4], f[5], 
        2,    # restecg (2 is high)
        f[6], 
        1,    # exang (1 is Yes)
        3.0,  # oldpeak (3.0 is high)
        2,    # slope (2 is bad)
        3,    # ca (3 is bad)
        3,    # thal (3 is bad)
        1,    # cv_index
        1     # elder_sym
    ]
    arr = np.array(full_features).reshape(1, -1)
    if imputer: arr = imputer.transform(arr)
    if scaler: arr = scaler.transform(arr)
    prob = model.predict_proba(arr)[0][1]
    return prob

prob3 = get_extreme_prediction(user_features)
print(f"Case 3 (Extreme Mapping): Prob={prob3*100:.2f}%")
