from flask import Flask, render_template, request, jsonify,Response
import json
app = Flask(__name__)
@app.route('/api/append-school', methods=['POST'])
def save_school():
    new_school = request.get_json() 

    with open("./src/components/savedSchool.json", "r") as f:
        saved_data = json.load(f)

    saved_data["database"].setdefault("schools", []).append(new_school)

    with open("./src/components/savedSchool.json", "w") as f:
        json.dump(saved_data, f, indent=2)
