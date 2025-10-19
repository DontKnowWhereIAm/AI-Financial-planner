from flask import Flask, render_template, request, jsonify,Response
from flask_cors import CORS
import requests
import time
import json
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
@app.route('/api/append-school', methods=['POST'])
def save_school():
    new_school = request.get_json() 

    with open("./src/components/savedSchool.json", "r") as f:
        saved_data = json.load(f)

    saved_data["database"].setdefault("schools", []).append(new_school)

    with open("./src/components/savedSchool.json", "w") as f:
        json.dump(saved_data, f, indent=2)

API_KEY = "AvpTLjsZFAG52doRNNY5JgYrvenIfE1IgF6YrrTE"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
YEAR = 2022
TUITION_MULTIPLIER = 1.052

def build_fields():
    prefix = f"{YEAR}"
    return [
        "id",
        "school.name",
        "school.city",
        "school.state",
        "school.zip",
        "school.school_url",
        f"{prefix}.cost.tuition.in_state",
        f"{prefix}.cost.tuition.out_of_state",
    ]

def request_page(params, page=0, per_page=50):
    qp = {
        "api_key": API_KEY,
        "page": str(page),
        "per_page": str(per_page),
        "keys_nested": "true",
    }
    qp.update(params)
    resp = requests.get(BASE_URL, params=qp, timeout=30)
    resp.raise_for_status()
    return resp.json()

def normalize(s):
    return " ".join(s.lower().split())

def pick_best_match(results, target_name):
    if not target_name:
        return None
    target = normalize(target_name)
    for r in results:
        nm = r.get("school", {}).get("name", "")
        if normalize(nm) == target:
            return r
    return None

def extract_tuition(rec):
    obj = rec.get(str(YEAR), {})
    cost = obj.get("cost", {}).get("tuition", {})
    in_state = cost.get("in_state")
    out_state = cost.get("out_of_state")
    if in_state is not None:
        in_state = round(in_state * TUITION_MULTIPLIER, 2)
    if out_state is not None:
        out_state = round(out_state * TUITION_MULTIPLIER, 2)
    return {"in_state": in_state, "out_of_state": out_state}

@app.route("/api/tuition", methods=["GET"])
def get_tuition():
    name = request.args.get("name")
    state = request.args.get("state")
    city = request.args.get("city")

    fields = build_fields()
    params = {"fields": ",".join(fields)}
    if name:
        params["school.name"] = name
    if state:
        params["school.state"] = state
    if city:
        params["school.city"] = city

    try:
        data = request_page(params)
        results = data.get("results", [])
        if not results:
            return jsonify({"error": "No results found"}), 404

        chosen = pick_best_match(results, name) or results[0]
        school_info = chosen.get("school", {})
        tuition = extract_tuition(chosen)

        return jsonify({
            "name": school_info.get("name"),
            "city": school_info.get("city"),
            "state": school_info.get("state"),
            "zip": school_info.get("zip"),
            "url": school_info.get("school_url"),
            "tuition": tuition
        })

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500