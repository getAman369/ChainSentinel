"""Preprocessing pipeline for address data.

Validates, normalizes, and sanitizes address data before
feature extraction and ML inference. Handles missing values,
out-of-range inputs, and data type coercion.
"""
import re
import numpy as np
from typing import Tuple, Optional

ETH_ADDRESS_PATTERN = re.compile(r"^0x[a-fA-F0-9]{40}$")


def validate_ethereum_address(address: str) -> bool:
    """Check if a string is a valid Ethereum address format.

    Args:
        address: The address string to validate.

    Returns:
        True if the address matches the 0x + 40 hex characters pattern.
    """
    if not address or not isinstance(address, str):
        return False
    return bool(ETH_ADDRESS_PATTERN.match(address.lower()))


def normalize_value(value, default=0.0, min_val=None, max_val=None) -> float:
    """Normalize a numeric value with bounds checking.

    Args:
        value: Raw input value.
        default: Default if value is invalid.
        min_val: Optional minimum clamp.
        max_val: Optional maximum clamp.

    Returns:
        Normalized float value.
    """
    try:
        result = float(value)
    except (TypeError, ValueError):
        result = default

    if np.isnan(result) or np.isinf(result):
        result = default

    if min_val is not None:
        result = max(min_val, result)
    if max_val is not None:
        result = min(max_val, result)

    return result


def preprocess_address_data(raw_data: dict, enforce_address_validation: bool = False) -> dict:
    """Preprocess raw address data into a clean, normalized dictionary.

    Args:
        raw_data: Dictionary potentially containing:
            address, tx_count, counterparties, avg_value, max_value,
            contracts, days_active, mixing_score
        enforce_address_validation: If True, raises ValueError on invalid address.

    Returns:
        Cleaned dictionary with all numeric fields as floats.
    """
    address = raw_data.get("address", "")

    if enforce_address_validation and not validate_ethereum_address(address):
        raise ValueError(f"Invalid Ethereum address: {address}")

    cleaned = {
        "address": address.lower() if address else "",
        "tx_count": normalize_value(raw_data.get("tx_count"), default=0, min_val=0),
        "counterparties": normalize_value(raw_data.get("counterparties"), default=0, min_val=0),
        "avg_value": normalize_value(raw_data.get("avg_value"), default=0.0, min_val=0.0),
        "max_value": normalize_value(raw_data.get("max_value"), default=0.0, min_val=0.0),
        "contracts": normalize_value(raw_data.get("contracts"), default=0, min_val=0),
        "days_active": normalize_value(raw_data.get("days_active"), default=1, min_val=1),
        "mixing_score": normalize_value(raw_data.get("mixing_score"), default=0.0, min_val=0.0, max_val=1.0),
    }

    if cleaned["max_value"] < cleaned["avg_value"]:
        cleaned["max_value"] = cleaned["avg_value"]

    return cleaned


def batch_preprocess(raw_data_list: list) -> list:
    """Preprocess a batch of address data.

    Args:
        raw_data_list: List of raw address data dictionaries.

    Returns:
        List of cleaned dictionaries.
    """
    return [preprocess_address_data(data) for data in raw_data_list]


def validate_features(data: dict) -> Tuple[bool, Optional[str]]:
    """Validate that all required feature fields are present and numeric.

    Args:
        data: Dictionary of address data.

    Returns:
        Tuple of (is_valid, error_message).
    """
    required_fields = ["tx_count", "counterparties", "avg_value", "max_value",
                       "contracts", "days_active", "mixing_score"]

    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
        try:
            float(data[field])
        except (TypeError, ValueError):
            return False, f"Field '{field}' must be numeric, got: {type(data[field])}"

    return True, None


def run_health_check() -> dict:
    """Run a health check on the preprocessing pipeline.

    Returns:
        Dictionary with pipeline status.
    """
    test_input = {
        "address": "0x1234567890123456789012345678901234567890",
        "tx_count": 100,
        "counterparties": 50,
        "avg_value": 10.5,
        "max_value": 100.0,
        "contracts": 10,
        "days_active": 365,
        "mixing_score": 0.4,
    }

    try:
        cleaned = preprocess_address_data(test_input)
        is_valid, error = validate_features(cleaned)

        return {
            "status": "healthy",
            "test_input_address": validate_ethereum_address(test_input["address"]),
            "preprocessing_works": cleaned is not None,
            "feature_validation": is_valid,
            "error": error if not is_valid else None,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }
