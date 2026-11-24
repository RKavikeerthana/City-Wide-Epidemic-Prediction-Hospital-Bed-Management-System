# backend/ml_model.py
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

# Flask App
app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb+srv://<username>:<password>@cluster.mongodb.net/<database_name>?retryWrites=true&w=majority')
db = client['<database_name>']  # Replace with your database name
collection = db['<collection_name>']  # Replace with your collection name

# Fetch Data from MongoDB
def fetch_data_from_db():
    records = list(collection.find({}, {'_id': 0, 'day': 1, 'disease_count': 1}))
    return pd.DataFrame(records)

# Preprocessing
def preprocess_data(data):
    sequence_length = 10
    X, y = [], []
    for i in range(len(data) - sequence_length):
        X.append(data[i:i + sequence_length])
        y.append(data[i + sequence_length])
    return np.array(X), np.array(y)

@app.route('/api/ml-data', methods=['GET'])
def predict_disease():
    # Fetch data from MongoDB
    data = fetch_data_from_db()

    if data.empty:
        return jsonify({"error": "No data available in the database"}), 404

    disease_counts = data['disease_count'].values

    # Preprocess
    X, y = preprocess_data(disease_counts)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    # LSTM Model
    model = Sequential([
        LSTM(50, activation='relu', input_shape=(X.shape[1], 1)),
        Dense(1)
    ])

    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=10, batch_size=16, verbose=0)

    # Predict the next value
    last_sequence = X[-1].reshape((1, X.shape[1], 1))
    prediction = model.predict(last_sequence)

    return jsonify({
        "statistics": f"Predicted disease count for next day: {prediction[0][0]}"
    })

if __name__ == '__main__':
    app.run(debug=True)
