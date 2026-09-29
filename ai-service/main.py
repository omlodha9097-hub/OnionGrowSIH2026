"""
Harvest Heist - Python AI Microservice
FastAPI server serving computer vision onion grading inference endpoints.
"""

import os
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from vision_service import VisionService
from analyzer import OnionAnalyzer

app = FastAPI(
    title="Harvest Heist AI Onion Grading Microservice",
    description="Computer Vision analysis service for automated onion quality grading & defect detection.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vision_service = VisionService()
analyzer = OnionAnalyzer()

@app.get("/")
def read_root():
    return {
        "service": "Harvest Heist AI Microservice",
        "status": "online",
        "version": "2.0.0",
        "realYoloReady": vision_service.model is not None,
        "model_path": vision_service.model_path,
        "model_info": vision_service.model_info
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "model_loaded": vision_service.model is not None
    }

@app.post("/analyze")
async def analyze_onion_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, processes it via real YOLO computer vision,
    and returns detected onions with bounding boxes, sizes, defects, and overall score.
    """
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        result = vision_service.analyze_image(contents)
        result["filename"] = file.filename
        
        if "error" in result and result.get("total_onions", 0) == 0 and not result.get("detections"):
            if "not found" in result["error"].lower():
                raise HTTPException(status_code=404, detail=result["error"])
                
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@app.get("/model-info")
def get_model_info():
    """
    Returns actual model information and actual evaluation metrics.
    """
    eval_file = "/Users/omlodha/Desktop/onionSIH/ml/evaluation_results.json"
    eval_metrics = {}
    if os.path.exists(eval_file):
        try:
            with open(eval_file, "r") as f:
                eval_metrics = json.load(f)
        except Exception:
            pass

    return {
        "model_info": vision_service.model_info,
        "evaluation_metrics": eval_metrics,
        "is_real_inference": True,
        "disclaimer": "Metrics from actual model evaluation"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8088, reload=False)
