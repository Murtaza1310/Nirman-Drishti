import sys
import json
import os

# Dynamically locate project base directory (handles any destination machine or folder)
current_dir = os.path.dirname(os.path.abspath(__file__))
web_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(web_dir)

candidates = [
    web_dir,
    os.path.join(root_dir, "ml"),
    root_dir,
    r"C:\Users\murta\OneDrive\Desktop\SIH Project"
]

base_dir = web_dir
for cand in candidates:
    if os.path.exists(os.path.join(cand, "models")) and os.path.exists(os.path.join(cand, "src")):
        base_dir = cand
        break

if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from src.predict_pipeline import ProjectMonitoringPredictor

def main():
    try:
        if len(sys.argv) > 1 and sys.argv[1] != "-":
            raw_input = sys.argv[1]
        else:
            raw_input = sys.stdin.read()
            
        if not raw_input or not raw_input.strip():
            print(json.dumps({"error": "Empty input payload"}))
            sys.exit(1)
            
        payload = json.loads(raw_input)
        
        models_dir = os.path.join(base_dir, "models")
        predictor = ProjectMonitoringPredictor(models_dir=models_dir)
        
        result = predictor.predict_project(payload)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
