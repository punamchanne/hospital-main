// predict.js
// Handles form submission for heart disease risk prediction UI.
// Assumes Flask API is running on http://localhost:5000/predict

async function predictRisk() {
    const age = Number(document.getElementById('age').value);
    const sex = Number(document.getElementById('sex').value);
    const cp = Number(document.getElementById('cp').value);
    const trestbps = Number(document.getElementById('trestbps').value);
    const chol = Number(document.getElementById('chol').value);
    const fbs = Number(document.getElementById('fbs').value);
    const thalach = Number(document.getElementById('thalach').value);

    const payload = {
        features: [age, sex, cp, trestbps, chol, fbs, thalach]
    };

    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const resultDiv = document.getElementById('result');
        if (response.ok) {
            const prediction = data.prediction;
            const text = prediction === 1 ? '⚠️ High risk of heart disease detected.' : '✅ Low risk – heart disease unlikely.';
            resultDiv.style.color = prediction === 1 ? '#e74c3c' : '#27ae60';
            resultDiv.textContent = text;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.textContent = data.error || 'Unexpected error.';
            resultDiv.style.color = '#e74c3c';
            resultDiv.style.display = 'block';
        }
    } catch (err) {
        console.error('Fetch error:', err);
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = 'Failed to connect to prediction service.';
        resultDiv.style.color = '#e74c3c';
        resultDiv.style.display = 'block';
    }
}
