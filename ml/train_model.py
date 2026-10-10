"""ChainSentinel ML Model Training"""
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

np.random.seed(42)

def generate_training_data(n_samples=2000):
    X = []
    y = []
    for _ in range(n_samples):
        risk = np.random.randint(1, 6)
        if risk == 1:
            tx_count = np.random.randint(1, 20)
            counterparties = np.random.randint(1, 10)
            avg_value = np.random.uniform(0, 0.1)
            max_value = np.random.uniform(0, 0.5)
            contracts = np.random.randint(0, 3)
            days = np.random.randint(1, 365)
            mixing = np.random.uniform(0, 0.1)
        elif risk == 2:
            tx_count = np.random.randint(10, 50)
            counterparties = np.random.randint(5, 30)
            avg_value = np.random.uniform(0.1, 1)
            max_value = np.random.uniform(0.5, 5)
            contracts = np.random.randint(0, 10)
            days = np.random.randint(30, 730)
            mixing = np.random.uniform(0, 0.3)
        elif risk == 3:
            tx_count = np.random.randint(30, 100)
            counterparties = np.random.randint(20, 100)
            avg_value = np.random.uniform(1, 10)
            max_value = np.random.uniform(5, 50)
            contracts = np.random.randint(5, 30)
            days = np.random.randint(90, 1095)
            mixing = np.random.uniform(0.1, 0.6)
        elif risk == 4:
            tx_count = np.random.randint(80, 300)
            counterparties = np.random.randint(80, 500)
            avg_value = np.random.uniform(10, 100)
            max_value = np.random.uniform(50, 500)
            contracts = np.random.randint(20, 100)
            days = np.random.randint(180, 1825)
            mixing = np.random.uniform(0.4, 0.9)
        else:
            tx_count = np.random.randint(200, 1000)
            counterparties = np.random.randint(300, 2000)
            avg_value = np.random.uniform(50, 1000)
            max_value = np.random.uniform(500, 10000)
            contracts = np.random.randint(50, 500)
            days = np.random.randint(365, 3650)
            mixing = np.random.uniform(0.7, 1.0)
        X.append([tx_count, counterparties, avg_value, max_value, contracts, days, mixing])
        y.append(risk)
    return np.array(X), np.array(y)

def main():
    print("Generating training data...")
    X, y = generate_training_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print("Training RandomForest classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, zero_division=0))
    os.makedirs("ml/models", exist_ok=True)
    with open("ml/models/risk_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Model saved to ml/models/risk_model.pkl")

if __name__ == "__main__":
    main()