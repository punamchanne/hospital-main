from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import joblib
import numpy as np
import os
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class MedicalLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    result = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)

class DashboardData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), unique=True, nullable=False)
    h_info = db.Column(db.Text, nullable=False)  # JSON-serialized hospital info
    docs = db.Column(db.Text, nullable=False)    # JSON-serialized doctor status list

# Create database tables and seed default user
with app.app_context():
    db.create_all()
    # Add default credentials
    default_email = "iotprojects@gmail.com"
    if not User.query.filter_by(email=default_email).first():
        default_user = User(
            email=default_email,
            password=generate_password_hash("pass@123", method='pbkdf2:sha256')
        )
        db.session.add(default_user)
        db.session.commit()
        print(f"Default user {default_email} created.")

# Load ML Models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'heart_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
IMPUTER_PATH = os.path.join(MODEL_DIR, 'imputer.pkl')

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    imputer = joblib.load(IMPUTER_PATH) if os.path.exists(IMPUTER_PATH) else None
else:
    model = None

# Auth Routes
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'email': user.email}), 200

# Logs Routes
@app.route('/logs', methods=['POST'])
def add_log():
    data = request.get_json()
    new_log = MedicalLog(
        user_email=data.get('email'),
        result=data.get('result'),
        timestamp=data.get('timestamp')
    )
    db.session.add(new_log)
    db.session.commit()
    return jsonify({'message': 'Log saved'}), 201

@app.route('/logs/<email>', methods=['GET'])
def get_logs(email):
    logs = MedicalLog.query.filter_by(user_email=email).order_by(MedicalLog.id.desc()).limit(20).all()
    output = []
    for log in logs:
        output.append({'result': log.result, 'timestamp': log.timestamp})
    return jsonify(output)

# Dashboard Data Routes
@app.route('/dashboard-data/<email>', methods=['GET'])
def get_dashboard_data(email):
    data = DashboardData.query.filter_by(user_email=email).first()
    if not data:
        return jsonify({'message': 'No custom dashboard data found, using defaults'}), 404
        
    try:
        h_info_parsed = json.loads(data.h_info)
        docs_parsed = json.loads(data.docs)
        return jsonify({
            'h_info': h_info_parsed,
            'docs': docs_parsed
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to parse dashboard data', 'details': str(e)}), 500

@app.route('/dashboard-data', methods=['POST'])
def save_dashboard_data():
    req_data = request.get_json()
    email = req_data.get('email')
    h_info = req_data.get('h_info')
    docs = req_data.get('docs')

    if not email or not h_info or not docs:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        h_info_str = json.dumps(h_info)
        docs_str = json.dumps(docs)
        
        record = DashboardData.query.filter_by(user_email=email).first()
        if record:
            record.h_info = h_info_str
            record.docs = docs_str
        else:
            record = DashboardData(
                user_email=email,
                h_info=h_info_str,
                docs=docs_str
            )
            db.session.add(record)
            
        db.session.commit()
        return jsonify({'message': 'Dashboard data saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save dashboard data', 'details': str(e)}), 500

# Prediction Route
@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
        
    data = request.get_json()
    f = data.get('features') # Expecting 7 features from frontend
    
    # The model/imputer expects 15 features in this specific order:
    # 0:age, 1:sex, 2:cp, 3:trestbps, 4:chol, 5:fbs, 6:restecg, 7:thalach, 
    # 8:exang, 9:oldpeak, 10:slope, 11:ca, 12:thal, 13:cv_index, 14:elder_sym
    
    # Aggressive mapping for critical health indicators
    age = f[0]
    trestbps = f[3]
    chol = f[4]
    
    # Heuristics to force higher risk for extreme values
    is_critical_bp = 1 if trestbps > 180 else 0
    is_critical_chol = 1 if chol > 400 else 0
    
    full_features = [
        f[0], # age
        f[1], # sex
        f[2], # cp
        f[3], # trestbps
        f[4], # chol
        f[5], # fbs
        1 if (trestbps > 160) else 0, # restecg (Abnormal ECG if high BP)
        f[6], # thalach
        1 if (is_critical_bp or age > 80) else 0, # exang (Exercise angina)
        3.0 if (is_critical_bp or is_critical_chol) else (1.0 if trestbps > 150 else 0.0), # oldpeak
        2 if (age > 60 or is_critical_bp) else 1, # slope
        3 if (age > 80 or is_critical_bp) else (1 if age > 65 else 0), # ca (Vessels)
        3 if (is_critical_bp or is_critical_chol) else 2, # thal
        1 if (age > 60 or trestbps > 150) else 0, # cv_index
        1 if age > 60 else 0 # elder_sym
    ]
    
    arr = np.array(full_features).reshape(1, -1)

    if imputer: arr = imputer.transform(arr)
    if scaler: arr = scaler.transform(arr)

    # Get probability and prediction
    prob = model.predict_proba(arr)[0][1] # Probability of heart disease (class 1)
    pred = model.predict(arr)[0]
    
    return jsonify({
        'prediction': int(pred),
        'probability': float(prob)
    })

@app.route('/graphs/<path:filename>')
def serve_graph(filename):
    graphs_dir = os.path.join(os.path.dirname(__file__), 'graphs')
    return send_from_directory(graphs_dir, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.getenv('PORT', 5000), debug=True)
