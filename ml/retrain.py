"""Model retraining script with incremental new data.

Loads existing model (if present), combines with new training data,
retrains, and saves a new versioned model with updated metrics.
"""
import pickle
import json
import os
import argparse
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from datetime import datetime

from train_model import generate_training_data
from feature_engineering import ALL_FEATURES, compute_features
from evaluate import compute_metrics, save_metrics, print_metrics
from model_versioning import register_version, get_latest_version, MODEL_VERSION
from preprocess import preprocess_address_data, validate_features

MODELS_DIR = "ml/models"
NEW_DATA_FILE = os.path.join(MODELS_DIR, "feedback_data.json")


def load_existing_model():
    """Load the existing trained model if it exists."""
    model_path = os.path.join(MODELS_DIR, "risk_model.pkl")
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            return pickle.load(f)
    return None


def load_new_data(filepath=None):
    """Load new labeled data for incremental training.

    Args:
        filepath: Path to JSON file with new data.

    Returns:
        Tuple of (X, y) numpy arrays.
    """
    path = filepath or NEW_DATA_FILE
    if not os.path.exists(path):
        print(f"No new data file found at {path}")
        return np.array([]).reshape(0, len(ALL_FEATURES)), np.array([])

    with open(path, "r") as f:
        raw_data = json.load(f)

    X = []
    y = []
    for sample in raw_data:
        cleaned = preprocess_address_data(sample)
        is_valid, error = validate_features(cleaned)
        if not is_valid:
            print(f"Skipping invalid sample: {error}")
            continue

        engineered = compute_features(cleaned)
        X.append([
            engineered["tx_count"],
            engineered["counterparties"],
            engineered["avg_value"],
            engineered["max_value"],
            engineered["contracts"],
            engineered["days_active"],
            engineered["mixing_score"],
            engineered["tx_frequency"],
            engineered["counterparty_diversity"],
            engineered["value_concentration"],
            engineered["contract_ratio"],
            engineered["risk_velocity"],
            engineered["activity_growth_rate"],
        ])
        y.append(sample.get("risk_level"))

    if len(X) == 0:
        return np.array([]).reshape(0, len(ALL_FEATURES)), np.array([])

    return np.array(X), np.array(y)


def generate_new_version(current_version: str) -> str:
    """Generate the next minor version string."""
    parts = current_version.split(".")
    if len(parts) == 3:
        parts[1] = str(int(parts[1]) + 1)
    return ".".join(parts)


def retrain_with_feedback(
    n_synthetic: int = 2000,
    new_data_path: str = None,
    epochs: dict = None,
):
    """Retrain the model using synthetic data + new feedback data.

    Args:
        n_synthetic: Number of synthetic samples to generate.
        new_data_path: Path to new labeled data file.
        epochs: Optional hyperparameters dict.
    """
    if epochs is None:
        epochs = {
            "n_estimators": 100,
            "max_depth": 10,
            "random_state": 42,
            "class_weight": "balanced",
        }

    print("Loading synthetic training data...")
    X_synth, y_synth = generate_training_data(n_samples=n_synthetic)

    print("Loading new feedback data...")
    X_new, y_new = load_new_data(new_data_path)

    print(f"Synthetic samples: {len(y_synth)}")
    print(f"New samples: {len(y_new)}")

    if len(y_new) > 0:
        X = np.vstack([X_synth, X_new])
        y = np.concatenate([y_synth, y_new])
    else:
        X = X_synth
        y = y_synth

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForest classifier with new data...")
    model = RandomForestClassifier(
        n_estimators=epochs["n_estimators"],
        max_depth=epochs["max_depth"],
        random_state=epochs["random_state"],
        class_weight=epochs["class_weight"],
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, zero_division=0))

    metrics = compute_metrics(y_test, y_pred)
    latest = get_latest_version()
    next_version = generate_new_version(latest["version"] if latest else MODEL_VERSION)
    save_metrics(metrics, next_version)
    print_metrics(metrics)

    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, "risk_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    register_version(
        version=next_version,
        model_file="risk_model.pkl",
        training_params=epochs,
        feature_set=ALL_FEATURES,
        metrics=metrics,
        notes=f"Retrained with {len(y_new)} new samples + {len(y_synth)} synthetic",
    )

    print(f"Model v{next_version} saved to {model_path}")
    return next_version


def main():
    parser = argparse.ArgumentParser(description="Retrain model with new data")
    parser.add_argument("--samples", type=int, default=2000, help="Number of synthetic samples")
    parser.add_argument("--new-data", type=str, default=None, help="Path to new labeled data JSON")
    parser.add_argument("--n-estimators", type=int, default=100, help="Number of trees")
    parser.add_argument("--max-depth", type=int, default=10, help="Max tree depth")
    args = parser.parse_args()

    epochs = {
        "n_estimators": args.n_estimators,
        "max_depth": args.max_depth,
        "random_state": 42,
        "class_weight": "balanced",
    }

    retrain_with_feedback(
        n_synthetic=args.samples,
        new_data_path=args.new_data,
        epochs=epochs,
    )


if __name__ == "__main__":
    main()
