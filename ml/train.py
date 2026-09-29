"""
OnionGrade AI - Fast 5-Epoch Training Pipeline for User Dataset onions.v1i.yolo26
Trains YOLO model on real Roboflow dataset (279 images: cuts/Damaged, rotten/Rotten, sprout/Sprouted)
Saves production weights to ml/models/onion_best.pt
"""

import os
import sys
import shutil
from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_user_dataset():
    data_yaml_path = os.path.join(DATASET_DIR, "data.yaml")
    print(f"📦 Fast Training YOLO model on User Dataset: {data_yaml_path}")
    
    model = YOLO("yolov8n.pt") # Base lightweight YOLO model

    # Train model for 5 epochs on user dataset
    results = model.train(
        data=data_yaml_path,
        epochs=5,
        imgsz=640,
        batch=16,
        lr0=0.01,
        name="onion_user_yolo_run",
        project=os.path.join(BASE_DIR, "runs"),
        exist_ok=True
    )

    best_weights_path = os.path.join(BASE_DIR, "runs", "onion_user_yolo_run", "weights", "best.pt")
    target_weights_path = os.path.join(MODELS_DIR, "onion_best.pt")

    if os.path.exists(best_weights_path):
        shutil.copy(best_weights_path, target_weights_path)
        print(f"\n🎉 Model training on user dataset complete! Saved production model to: {target_weights_path}")
    else:
        model.save(target_weights_path)
        print(f"\n🎉 Saved trained model directly to: {target_weights_path}")

if __name__ == "__main__":
    train_user_dataset()
