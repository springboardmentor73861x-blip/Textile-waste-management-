import numpy as np


def sanitize_for_json(obj):
    """
    Recursively converts numpy data types (np.float32, np.float64, np.int64, np.ndarray)
    into standard Python native types (float, int, list) for clean JSON serialization in FastAPI.
    """
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return sanitize_for_json(obj.tolist())
    return obj
