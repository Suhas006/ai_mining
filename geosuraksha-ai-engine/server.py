from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import io
from PIL import Image

# 1. Initialize FastAPI app (this fixes the error)
app = FastAPI()

# 2. Load lightweight YOLOv8 model
model = YOLO('yolov8n.pt')

@app.get("/")
def health_check():
    return {"status": "online", "system": "DepthFence Sovereign AI"}

@app.post("/api/ai/analyze-raster")
async def analyze_raster(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    results = model(image)
    
    anomalies = []
    for result in results:
        for box in result.boxes:
            coords = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            
            if confidence > 0.85:
                anomalies.append({
                    "type": "Unpermitted Pit",
                    "confidence": confidence,
                    "bounding_box": coords
                })
                
    return {"status": "success", "anomalies": anomalies}