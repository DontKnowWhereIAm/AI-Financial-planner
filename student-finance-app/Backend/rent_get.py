
# rentcast_api.py
# Simple utility to call RentCast and print average rent for given zip codes.
# Expects environment variable RENTCAST_API_KEY to be set.
# Replace RENTCAST_API_BASE if your RentCast endpoint differs.

import os
import requests
from typing import Iterable, Union
from dotenv import load_dotenv
load_dotenv()

RENTCAST_API_BASE = os.getenv("RENTCAST_API_BASE", "https://api.rentcast.io/v1")
API_KEY = os.getenv("RENTCAST_API_KEY")


def _extract_average_from_response(resp_json: dict) -> Union[float, None]:
    """
    Try several common locations for an 'average rent' value in the JSON.
    Adjust as necessary depending on the RentCast response shape.
    """
    # common candidates
    candidates = [
        ("average_rent", float),
        ("average", float),
        ("avg_rent", float),
        ("avg", float),
    ]

    # top-level keys
    for key, caster in candidates:
        if key in resp_json:
            try:
                return caster(resp_json[key])
            except Exception:
                pass

    # nested under "data" or "result"
    for container in ("data", "result"):
        if container in resp_json and isinstance(resp_json[container], dict):
            for key, caster in candidates:
                if key in resp_json[container]:
                    try:
                        return caster(resp_json[container][key])
                    except Exception:
                        pass

    return None


def print_average_costs(zip_codes: Union[str, Iterable[str]]) -> None:
    """
    For each zip code provided (single string or iterable of strings),
    call RentCast and print the average cost.

    Example:
        print_average_costs("94016")
        print_average_costs(["94016", "10001"])
    """
    if not API_KEY:
        raise RuntimeError("Missing RENTCAST_API_KEY environment variable")

    # normalize to list
    if isinstance(zip_codes, str):
        zips = [zip_codes]
    else:
        zips = list(zip_codes)

    headers = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}
    endpoint = f"{RENTCAST_API_BASE}/market/average"  # adjust path if needed

    for z in zips:
        params = {"zipcode": z}
        try:
            r = requests.get(endpoint, headers=headers, params=params, timeout=10)
            r.raise_for_status()
            data = r.json()
        except requests.RequestException as e:
            print(f"{z}: request failed: {e}")
            continue
        except ValueError:
            print(f"{z}: invalid JSON response")
            continue

        avg = _extract_average_from_response(data)
        if avg is not None:
            print(f"{z}: average rent = {avg}")
        else:
            # fallback: pretty-print received json for debugging
            print(f"{z}: average rent not found in response. Raw response keys: {list(data.keys())}")


if __name__ == "__main__":
    # quick demo: set RENTCAST_API_KEY in your environment before running
    # python rentcast_api.py 94016 10001
    import sys
    if len(sys.argv) > 1:
        print_average_costs(sys.argv[1:])
    else:
        print("Usage: python rentcast_api.py <zip1> [<zip2> ...]")
