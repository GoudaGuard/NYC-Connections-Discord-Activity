import json
import sys
from datetime import date
from pathlib import Path
import requests

BASE = Path(__file__).resolve().parent
CONN_PATH = BASE / "connections.json"

# Load existing connections (empty list if missing)
if CONN_PATH.exists():
    try:
        with CONN_PATH.open('r', encoding='utf-8') as fh:
            connections = json.load(fh)
    except Exception:
        # empty or invalid JSON — start with empty list
        connections = []
else:
    connections = []

# Compute next id and today's date
last_id = int(connections[-1]["id"]) if connections else 0
next_id = last_id + 1
con_date = date.today().strftime('%Y-%m-%d')

if connections and connections[-1].get("date") == con_date:
    print(f"Connection #{next_id-1} from {con_date} already exists in file, exiting")
    sys.exit(0)

# Fetch today's Connections puzzle
URL = f"https://www.nytimes.com/svc/connections/v2/{con_date}.json"
try:
    r = requests.get(URL, timeout=10)
    r.raise_for_status()
    content = r.json()
except Exception as e:
    print("Failed to fetch Connections data:", e)
    sys.exit(1)

print(f"Adding Connection #{next_id} from {con_date}")
groups = []
for group in content.get("categories", []):
    categ = {"level": -1, "group": group.get("title", ""), "members": []}
    for member in group.get("cards", []):
        categ["members"].append(member.get("content", ""))
    groups.append(categ)

con_item = {"id": next_id, "date": con_date, "answers": groups}
connections.append(con_item)

with CONN_PATH.open('w', encoding='utf-8') as fh:
    json.dump(connections, fh, indent=4, ensure_ascii=False)
