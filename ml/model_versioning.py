"""Model versioning system with metadata.

Tracks model versions, creation timestamps, feature sets,
training parameters, and evaluation metrics.
"""
import json
import os
import hashlib
from datetime import datetime
from typing import Optional

MODELS_DIR = "ml/models"
VERSIONS_FILE = os.path.join(MODELS_DIR, "versions.json")

MODEL_VERSION = "1.1.0"


def _load_versions() -> list:
    """Load the version history from disk."""
    if not os.path.exists(VERSIONS_FILE):
        return []
    try:
        with open(VERSIONS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def _save_versions(versions: list) -> None:
    """Persist version history to disk."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(VERSIONS_FILE, "w") as f:
        json.dump(versions, f, indent=2)


def get_latest_version() -> Optional[dict]:
    """Return the metadata for the latest model version."""
    versions = _load_versions()
    return versions[-1] if versions else None


def get_version(version: str) -> Optional[dict]:
    """Return metadata for a specific version."""
    versions = _load_versions()
    for v in versions:
        if v["version"] == version:
            return v
    return None


def compute_model_hash(model_path: str) -> str:
    """Compute a SHA-256 hash of the model file for integrity."""
    h = hashlib.sha256()
    with open(model_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def register_version(
    version: str,
    model_file: str = "risk_model.pkl",
    training_params: Optional[dict] = None,
    feature_set: Optional[list] = None,
    metrics: Optional[dict] = None,
    notes: str = "",
) -> dict:
    """Register a new model version with metadata.

    Args:
        version: Semantic version string (e.g. "1.1.0").
        model_file: Filename of the model artifact.
        training_params: Dictionary of training hyperparameters.
        feature_set: List of feature names used for training.
        metrics: Evaluation metrics dictionary.
        notes: Free-form notes about this version.

    Returns:
        The version metadata dictionary.
    """
    model_path = os.path.join(MODELS_DIR, model_file)

    metadata = {
        "version": version,
        "model_file": model_file,
        "model_hash": compute_model_hash(model_path) if os.path.exists(model_path) else None,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "training_params": training_params or {},
        "feature_set": feature_set or [],
        "metrics": metrics or {},
        "notes": notes,
    }

    versions = _load_versions()
    versions.append(metadata)
    _save_versions(versions)

    print(f"Registered model version {version}")
    print(f"  Model hash: {metadata['model_hash']}")
    print(f"  Created at: {metadata['created_at']}")

    return metadata


def list_versions() -> list:
    """List all registered versions (most recent last)."""
    return _load_versions()


def promote_to_production(version: str) -> dict:
    """Mark a version as production-ready and update the active version pointer."""
    versions = _load_versions()
    for v in versions:
        v["production"] = (v["version"] == version)
        if v["version"] == version:
            v["promoted_at"] = datetime.utcnow().isoformat() + "Z"

    _save_versions(versions)
    print(f"Promoted version {version} to production")
    return get_version(version)
