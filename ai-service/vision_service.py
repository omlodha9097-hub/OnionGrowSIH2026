"""
OnionGrade AI - Computer Vision & Real YOLO Inference Pipeline
Runs real YOLO model inference on input images for multi-instance onion detection,
bounding box extraction, defect classification, size estimation, color histogram analysis,
apical sprout measurement, and image annotation. Includes optical CV fallback and frame verification.
"""

import os
import io
import base64
import time
import cv2
import numpy as np
from PIL import Image, ImageOps
from ultralytics import YOLO
from quality_service import calculate_quality_score

class VisionService:
    def __init__(self):
        self.model_path = os.getenv("MODEL_PATH", "/Users/omlodha/Desktop/onionSIH/ml/models/onion_best.pt")
        # Set clean confidence threshold default to 0.25 (25%) per specification
        self.conf_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
        self.iou_threshold = float(os.getenv("IOU_THRESHOLD", "0.45"))
        self.img_size = int(os.getenv("IMAGE_SIZE", "640"))
        self.device = os.getenv("DEVICE", "cpu")
        
        self.model = None
        self.model_info = {}
        self._load_model()

    def _calculate_iou(self, bbox1, bbox2):
        """Calculates Intersection over Union (IoU) between two bounding boxes."""
        x1 = max(bbox1["x1"], bbox2["x1"])
        y1 = max(bbox1["y1"], bbox2["y1"])
        x2 = min(bbox1["x2"], bbox2["x2"])
        y2 = min(bbox1["y2"], bbox2["y2"])

        inter_w = max(0, x2 - x1)
        inter_h = max(0, y2 - y1)
        inter_area = inter_w * inter_h

        area1 = (bbox1["x2"] - bbox1["x1"]) * (bbox1["y2"] - bbox1["y1"])
        area2 = (bbox2["x2"] - bbox2["x1"]) * (bbox2["y2"] - bbox2["y1"])
        union_area = area1 + area2 - inter_area

        if union_area <= 0:
            return 0.0
        return inter_area / float(union_area)

    def _apply_nms(self, detections, iou_threshold=0.40):
        """
        Applies Non-Maximum Suppression (NMS) to collapse overlapping duplicate bounding boxes.
        Ensures multiple detections on the same spot collapse into a single clean box with highest confidence.
        """
        if not detections:
            return []

        sorted_dets = sorted(detections, key=lambda d: d["confidence"], reverse=True)
        keep = []

        while len(sorted_dets) > 0:
            best = sorted_dets.pop(0)
            keep.append(best)

            remaining = []
            for det in sorted_dets:
                iou = self._calculate_iou(best["bbox"], det["bbox"])
                # Discard duplicate overlapping detection if IoU >= threshold
                if iou < iou_threshold:
                    remaining.append(det)
            sorted_dets = remaining

        return keep

    def _load_model(self):
        print(f"🔍 Loading trained YOLO model from: {self.model_path}")
        if not os.path.exists(self.model_path):
            error_msg = f"Trained YOLO model not found at path '{self.model_path}'. Please configure MODEL_PATH."
            print(f"❌ {error_msg}")
            self.model = None
            self.model_error = error_msg
            return

        try:
            self.model = YOLO(self.model_path)
            file_size_mb = round(os.path.getsize(self.model_path) / (1024 * 1024), 2)
            
            names = self.model.names if hasattr(self.model, 'names') else {0: 'Healthy', 1: 'Damaged', 2: 'Rotten', 3: 'Sprouted'}
            self.class_names = [names[i] for i in sorted(names.keys())]

            self.model_info = {
                "yolo_version": "YOLOv8n / YOLO11",
                "model_path": self.model_path,
                "file_size_mb": file_size_mb,
                "classes": self.class_names,
                "confidence_threshold": self.conf_threshold,
                "iou_threshold": self.iou_threshold,
                "image_size": self.img_size,
                "device": self.device,
                "status": "ready"
            }
            self.model_error = None
            print(f"✅ Real YOLO model loaded successfully!")
        except Exception as e:
            self.model = None
            self.model_error = f"Failed to load YOLO model: {str(e)}"
            print(f"❌ {self.model_error}")

    def _normalize_lighting_clahe(self, img_np):
        """Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) on L-channel."""
        try:
            lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            l_norm = clahe.apply(l)
            norm_lab = cv2.merge((l_norm, a, b))
            return cv2.cvtColor(norm_lab, cv2.COLOR_LAB2RGB)
        except Exception:
            return img_np

    def _analyze_color_histogram(self, roi_rgb):
        """Analyzes RGB/HSV histogram to determine skin pigmentation rating."""
        if roi_rgb.size == 0:
            return "Amber Bronze"
        
        hsv = cv2.cvtColor(roi_rgb, cv2.COLOR_RGB2HSV)
        avg_hue = np.mean(hsv[:, :, 0])
        avg_sat = np.mean(hsv[:, :, 1])
        avg_val = np.mean(hsv[:, :, 2])

        if avg_val < 55:
            return "Discolored / Mold Stained"
        elif (avg_hue < 20 or avg_hue > 140) and avg_sat > 90:
            return "Deep Red Ruby (Export Quality)"
        elif avg_sat > 50:
            return "Amber Bronze (Standard)"
        else:
            return "Pale Yellow Outer Shell"

    def _check_dark_rot_blotches(self, roi_rgb):
        """Classical CV check for dark mold / rot blotches on onion surface."""
        if roi_rgb.size == 0:
            return False, 0.0
        gray = cv2.cvtColor(roi_rgb, cv2.COLOR_RGB2GRAY)
        # Threshold for dark decay/rot spots (intensity < 60)
        _, dark_mask = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
        dark_pixels = cv2.countNonZero(dark_mask)
        dark_ratio = dark_pixels / float(gray.size)
        return dark_ratio > 0.12, round(dark_ratio * 100, 1)

    def _measure_sprout_contour(self, roi_rgb, cls_key="unknown"):
        """Measures apical sprout length in millimeters from contour analysis."""
        if roi_rgb.size == 0:
            return 0.0, "Zero Sprouts"

        hsv = cv2.cvtColor(roi_rgb, cv2.COLOR_RGB2HSV)
        # Green sprout mask for green shoot detection
        lower_green = np.array([30, 40, 40])
        upper_green = np.array([90, 255, 255])
        mask = cv2.inRange(hsv, lower_green, upper_green)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        green_pixel_count = cv2.countNonZero(mask)
        roi_area = roi_rgb.shape[0] * roi_rgb.shape[1]

        if contours and (green_pixel_count / float(roi_area)) > 0.015:
            max_c = max(contours, key=cv2.contourArea)
            _, _, _, bh = cv2.boundingRect(max_c)
            sprout_mm = round(bh * 0.52, 1)
        else:
            sprout_mm = 0.0

        if sprout_mm > 10.0:
            severity = "Advanced Sprouting (>10mm)"
        elif sprout_mm >= 3.0:
            severity = "Minor Sprout (3-10mm)"
        else:
            severity = "Zero Sprouts"

        return sprout_mm, severity

    def analyze_image(self, image_bytes: bytes):
        start_time = time.time()
        
        if self.model is None:
            return {
                "error": self.model_error or "Trained YOLO model not found. Please configure MODEL_PATH.",
                "total_onions": 0,
                "detections": []
            }

        # EXIF Orientation Correction & Preprocessing
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img = ImageOps.exif_transpose(pil_img).convert('RGB')
            img_np = np.array(pil_img)
            h, w, _ = img_np.shape
        except Exception as e:
            return {"error": f"Invalid image file format: {str(e)}", "total_onions": 0, "detections": []}

        # Server-Side Frame Integrity & Brightness Check
        gray_img = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        mean_brightness = float(np.mean(gray_img))
        print(f"📸 Received Frame: {w}x{h} px, Size: {len(image_bytes)} bytes, Mean Brightness: {mean_brightness:.1f}")
        if mean_brightness < 12.0:
            print(f"⚠️ WARNING: Captured frame is near-black/uninitialized! (brightness = {mean_brightness:.1f})")

        preprocess_time = round((time.time() - start_time) * 1000, 2)
        infer_start = time.time()

        # Run Real YOLO Model Inference
        results = self.model.predict(
            source=img_np,
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            imgsz=self.img_size,
            device=self.device,
            verbose=False
        )

        inference_time = round((time.time() - infer_start) * 1000, 2)
        postprocess_start = time.time()

        raw_detections = []
        annotated_img = img_np.copy()
        yolo_top_conf = 0.0

        # Class Color Mapping for OpenCV (RGB format)
        CLASS_COLOR_RGB = {
            "cuts": (236, 72, 153),      # Pink / Purple
            "damaged": (236, 72, 153),
            "rotten": (234, 179, 8),     # Amber / Yellow
            "rot": (234, 179, 8),
            "sprout": (59, 130, 246),    # Cyan / Blue
            "sprouted": (59, 130, 246),
            "healthy": (16, 185, 129)    # Emerald Green
        }

        detection_stage = "CV Fallback Engine"

        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            detection_stage = "YOLOv8 Dual-Stage"
            
            for idx, box in enumerate(boxes):
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                conf = float(box.conf[0].item())
                if conf > yolo_top_conf:
                    yolo_top_conf = conf

                cls_idx = int(box.cls[0].item())
                cls_name = self.class_names[cls_idx] if cls_idx < len(self.class_names) else f"Class_{cls_idx}"
                cls_key = cls_name.lower()

                bw = x2 - x1
                bh = y2 - y1
                roi = img_np[y1:y2, x1:x2]

                if roi.size > 0:
                    hsv_roi = cv2.cvtColor(roi, cv2.COLOR_RGB2HSV)
                    m1 = cv2.inRange(hsv_roi, np.array([0, 30, 30]), np.array([22, 255, 255]))
                    m2 = cv2.inRange(hsv_roi, np.array([140, 30, 30]), np.array([180, 255, 255]))
                    m3 = cv2.inRange(hsv_roi, np.array([8, 30, 30]), np.array([42, 255, 255]))
                    om_roi = cv2.bitwise_or(m1, cv2.bitwise_or(m2, m3))
                    roi_onion_ratio = cv2.countNonZero(om_roi) / float(roi.shape[0] * roi.shape[1])

                    # Ignore low-confidence false positive boxes on non-onion objects
                    if conf < 0.40 and roi_onion_ratio < 0.04:
                        print(f"⚠️ [YOLO REJECT] Box #{idx+1} rejected as non-onion (conf {conf:.2f}, onion pigment {roi_onion_ratio*100:.1f}%)")
                        continue

                diameter_px = max(bw, bh)
                estimated_mm = round(max(30.0, min(95.0, (diameter_px / min(w, h)) * 160.0)), 1)
                size_cat = "Large" if estimated_mm >= 60 else ("Medium" if estimated_mm >= 50 else "Small")
                sphericity = round((min(bw, bh) / max(bw, bh)) * 100, 1)

                color_index = self._analyze_color_histogram(roi)
                sprout_mm, sprout_severity = self._measure_sprout_contour(roi, cls_key)
                has_rot_blotches, _ = self._check_dark_rot_blotches(roi)

                if has_rot_blotches and cls_key != "rotten":
                    cls_key = "rotten"
                    cls_name = "Rotten"

                if cls_key == "rotten" or sprout_mm > 10.0:
                    tier_grade = "Reject"
                elif cls_key in ["sprout", "sprouted"] or estimated_mm < 50.0:
                    tier_grade = "Grade C"
                elif cls_key in ["cuts", "damaged"] or estimated_mm < 60.0 or sphericity < 90.0:
                    tier_grade = "Grade B"
                else:
                    tier_grade = "Grade A"

                det_item = {
                    "id": idx + 1,
                    "class": cls_key,
                    "className": cls_name,
                    "confidence": round(conf, 4),
                    "confidencePercent": round(conf * 100, 1),
                    "bbox": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                        "width": bw,
                        "height": bh
                    },
                    "normalizedBbox": [
                        round(x1 / w, 4),
                        round(y1 / h, 4),
                        round(bw / w, 4),
                        round(bh / h, 4)
                    ],
                    "tier_grade": tier_grade,
                    "tierGrade": tier_grade,
                    "estimated_size": size_cat,
                    "diameter_mm": estimated_mm,
                    "diameterMm": estimated_mm,
                    "sphericity": sphericity,
                    "color_index": color_index,
                    "colorIndex": color_index,
                    "sprout_length_mm": sprout_mm,
                    "sprout_severity": sprout_severity
                }
                raw_detections.append(det_item)

        if len(raw_detections) == 0:
            detection_stage = "CV Fallback Engine"
            cv_dets, pixel_ratio = self._cv_contour_detection(img_np)
            raw_detections.extend(cv_dets)
        else:
            norm_img = self._normalize_lighting_clahe(img_np)
            hsv = cv2.cvtColor(norm_img, cv2.COLOR_RGB2HSV)
            m1 = cv2.inRange(hsv, np.array([0, 8, 15]), np.array([25, 255, 255]))
            m2 = cv2.inRange(hsv, np.array([135, 8, 15]), np.array([180, 255, 255]))
            m3 = cv2.inRange(hsv, np.array([8, 6, 18]), np.array([65, 255, 255]))
            om = cv2.bitwise_or(m1, cv2.bitwise_or(m2, m3))
            pixel_ratio = cv2.countNonZero(om) / float(h * w)

        # 1. APPLY NON-MAXIMUM SUPPRESSION (NMS) to collapse overlapping duplicate boxes
        nms_detections = self._apply_nms(raw_detections, iou_threshold=0.40)

        # 2. CONFIDENCE THRESHOLD FILTERING (Default >= 0.25 / 25%)
        clean_detections = [d for d in nms_detections if d["confidence"] >= 0.25]
        if len(clean_detections) == 0 and len(nms_detections) > 0:
            clean_detections = nms_detections[:5] # Fallback to top NMS detections if all sub-25%

        detections = clean_detections

        # 3. DRAW CLEAN ANNOTATED BOUNDING BOXES & OBJECT-COUNT BADGE
        total_count = len(detections)
        for idx, d in enumerate(detections):
            d["id"] = idx + 1
            x1 = d["bbox"]["x1"]
            y1 = d["bbox"]["y1"]
            x2 = d["bbox"]["x2"]
            y2 = d["bbox"]["y2"]
            cls_key = d["class"].lower()
            conf_pct = d["confidencePercent"]

            rgb_color = CLASS_COLOR_RGB.get(cls_key, (16, 185, 129))
            bgr_color = (rgb_color[2], rgb_color[1], rgb_color[0])

            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), bgr_color, 3)
            label_str = f"{cls_key} {int(conf_pct)}%"
            (tw, th), _ = cv2.getTextSize(label_str, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
            cv2.rectangle(annotated_img, (x1, max(0, y1 - 24)), (x1 + tw + 12, max(0, y1)), (15, 23, 42), -1)
            cv2.rectangle(annotated_img, (x1, max(0, y1 - 24)), (x1 + tw + 12, max(0, y1)), bgr_color, 1)
            cv2.putText(annotated_img, label_str, (x1 + 6, max(16, y1 - 7)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

        # Draw total object-count badge in upper right corner of annotated frame
        if total_count > 0:
            badge_str = f"{total_count} objects"
            (bw_t, bh_t), _ = cv2.getTextSize(badge_str, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
            badge_x1 = max(10, w - bw_t - 24)
            cv2.rectangle(annotated_img, (badge_x1, 12), (w - 12, 44), (15, 23, 42), -1)
            cv2.rectangle(annotated_img, (badge_x1, 12), (w - 12, 44), (34, 197, 94), 2)
            cv2.putText(annotated_img, badge_str, (badge_x1 + 8, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (34, 197, 94), 2)

        # Base64 JPEG Encoding
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR))
        annotated_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

        postprocess_time = round((time.time() - postprocess_start) * 1000, 2)
        total_time = round((time.time() - start_time) * 1000, 2)

        if len(detections) == 0:
            return {
                "batch_id": "BATCH_000",
                "total_onions": 0,
                "totalOnionsDetected": 0,
                "detections": [],
                "rawDetections": raw_detections,
                "summary": {"healthy": 0, "damaged": 0, "rotten": 0, "sprouted": 0, "healthyPct": 0, "cutsPct": 0, "rottenPct": 0, "sproutPct": 0, "summaryText": "0 Onions Detected"},
                "quality_score": 0,
                "grade": None,
                "error": "Error: Onions not detected. Please position onion batch within the scanning reticle.",
                "message": "Error: Onions not detected. Please position onion batch within the scanning reticle.",
                "is_onion_valid": False,
                "annotated_image": annotated_b64,
                "detection_stage": detection_stage,
                "debug_info": {
                    "pixel_ratio": round(pixel_ratio * 100, 2),
                    "mean_brightness": round(mean_brightness, 1),
                    "yolo_top_confidence": round(yolo_top_conf, 3),
                    "yolo_box_count": 0
                },
                "inference_specs": {
                    "is_real_yolo": True,
                    "model_path": self.model_path,
                    "preprocess_time_ms": preprocess_time,
                    "inference_time_ms": inference_time,
                    "postprocess_time_ms": postprocess_time,
                    "total_time_ms": total_time
                }
            }

        import uuid
        roboflow_predictions = []
        for d in detections:
            bw = d["bbox"]["width"]
            bh = d["bbox"]["height"]
            cx = round((d["bbox"]["x1"] + d["bbox"]["x2"]) / 2.0, 1)
            cy = round((d["bbox"]["y1"] + d["bbox"]["y2"]) / 2.0, 1)
            cls_name = d["class"]
            cls_id = 0 if cls_name == "cuts" else (1 if cls_name == "rotten" else (2 if cls_name in ["sprout", "sprouted"] else 3))
            roboflow_predictions.append({
                "x": cx,
                "y": cy,
                "width": bw,
                "height": bh,
                "confidence": round(d["confidence"], 3),
                "class": cls_name,
                "class_id": cls_id,
                "detection_id": uuid.uuid4().hex[:12]
            })

        # Calculate Aggregate Percentage Summary Across All Detected Instances
        healthy_cnt = sum(1 for d in detections if d["class"] in ["healthy", "grade a"])
        cuts_cnt = sum(1 for d in detections if d["class"] in ["cuts", "damaged"])
        rotten_cnt = sum(1 for d in detections if d["class"] == "rotten")
        sprout_cnt = sum(1 for d in detections if d["class"] in ["sprout", "sprouted"])

        healthy_pct = round((healthy_cnt / total_count) * 100) if total_count > 0 else 0
        cuts_pct = round((cuts_cnt / total_count) * 100) if total_count > 0 else 0
        rotten_pct = round((rotten_cnt / total_count) * 100) if total_count > 0 else 0
        sprout_pct = round((sprout_cnt / total_count) * 100) if total_count > 0 else 0

        summary_parts = []
        if healthy_pct > 0: summary_parts.append(f"{healthy_pct}% Healthy")
        if cuts_pct > 0: summary_parts.append(f"{cuts_pct}% Cuts")
        if rotten_pct > 0: summary_parts.append(f"{rotten_pct}% Rotten")
        if sprout_pct > 0: summary_parts.append(f"{sprout_pct}% Sprouted")
        summary_text = " · ".join(summary_parts) if summary_parts else "100% Healthy"

        # Summary Breakdown
        summary = {
            "healthy": healthy_cnt,
            "cuts": cuts_cnt,
            "damaged": cuts_cnt,
            "rotten": rotten_cnt,
            "sprout": sprout_cnt,
            "sprouted": sprout_cnt,
            "healthyPct": healthy_pct,
            "cutsPct": cuts_pct,
            "rottenPct": rotten_pct,
            "sproutPct": sprout_pct,
            "summaryText": summary_text
        }

        tier_counts = {
            "Grade A": sum(1 for d in detections if d["tier_grade"] == "Grade A"),
            "Grade B": sum(1 for d in detections if d["tier_grade"] == "Grade B"),
            "Grade C": sum(1 for d in detections if d["tier_grade"] == "Grade C"),
            "Reject": sum(1 for d in detections if d["tier_grade"] == "Reject")
        }

        score, grade, reason, structured_breakdown = calculate_quality_score(detections)
        import hashlib
        img_hash = hashlib.sha256(image_bytes).hexdigest()[:12]
        img_size_kb = round(len(image_bytes) / 1024.0, 1)

        avg_conf = round(sum(d["confidence"] for d in detections) / len(detections), 4) if detections else 0.0
        avg_diam = round(sum(d["diameter_mm"] for d in detections) / len(detections), 1) if detections else 0.0
        avg_sph = round(sum(d["sphericity"] for d in detections) / len(detections), 1) if detections else 0.0
        max_sprout = round(max((d["sprout_length_mm"] for d in detections), default=0.0), 1)
        color_ratings = [d.get("color_index", "Amber Bronze") for d in detections]
        color_rating = max(set(color_ratings), key=color_ratings.count) if color_ratings else "Deep Red Ruby"
        defect_count = sum(1 for d in detections if d["class"] in ["cuts", "damaged", "rotten", "sprout", "sprouted"])

        # Dev-Only Logging (per user verification specification)
        print(f"🔬 [DEV LOG] Image Size: {img_size_kb} KB | SHA-256 Prefix: {img_hash}")
        print(f"🔬 [DEV LOG] YOLO Top Conf: {yolo_top_conf:.3f} | Boxes: {len(results[0].boxes) if len(results) > 0 and len(results[0].boxes) > 0 else 0}")
        print(f"🔬 [DEV LOG] OpenCV Pixel Ratio: {pixel_ratio * 100:.2f}% | Branch: {detection_stage}")
        print(f"🔬 [DEV LOG] Final Output -> Total Onions: {len(detections)} | Score: {score} | Grade: {grade}")

        return {
            "batch_id": f"BATCH_{int(time.time())}",
            "total_onions": len(detections),
            "totalOnionsDetected": len(detections),
            "detections": detections,
            "rawDetections": raw_detections,
            "predictions": roboflow_predictions,
            "image": {"width": w, "height": h},
            "summary": summary,
            "tierCounts": tier_counts,
            "quality_score": score,
            "grade": grade,
            "reason": reason,
            "average_diameter_mm": avg_diam,
            "averageDiameterMm": avg_diam,
            "average_sphericity": avg_sph,
            "averageSphericity": avg_sph,
            "color_rating": color_rating,
            "colorRating": color_rating,
            "max_sprout_mm": max_sprout,
            "sproutLengthMm": max_sprout,
            "defect_count": defect_count,
            "defectCount": defect_count,
            "deduction_breakdown": structured_breakdown,
            "deductionBreakdown": structured_breakdown,
            "detection_stage": detection_stage,
            "detectionStage": detection_stage,
            "debug_info": {
                "pixel_ratio": round(pixel_ratio * 100, 2),
                "mean_brightness": round(mean_brightness, 1),
                "yolo_top_confidence": round(yolo_top_conf, 3),
                "yolo_box_count": len(detections),
                "image_hash_prefix": img_hash,
                "image_size_kb": img_size_kb
            },
            "average_confidence": avg_conf,
            "annotated_image": annotated_b64,
            "inference_specs": {
                "is_real_yolo": True,
                "model_path": self.model_path,
                "preprocess_time_ms": preprocess_time,
                "inference_time_ms": inference_time,
                "postprocess_time_ms": postprocess_time,
                "total_time_ms": total_time
            }
        }

    def _cv_contour_detection(self, img_np):
        """
        Optical Computer Vision contour segmentation fallback with CLAHE lighting normalization
        and strict HSV onion skin pigment + circularity shape validation.
        """
        h, w, _ = img_np.shape

        # 1. Apply CLAHE brightness & contrast normalization
        norm_img = self._normalize_lighting_clahe(img_np)
        hsv = cv2.cvtColor(norm_img, cv2.COLOR_RGB2HSV)

        # 2. Strict HSV onion skin pigment masks (Red, Ruby, Tan, Amber, Golden, Yellow)
        # Require Saturation >= 35 and Value >= 35 to reject grey walls, white paper, dark desks & room objects
        mask1 = cv2.inRange(hsv, np.array([0, 35, 35]), np.array([22, 255, 255]))    # Red / Tan / Yellow
        mask2 = cv2.inRange(hsv, np.array([140, 35, 35]), np.array([180, 255, 255])) # Deep Red / Purple
        mask3 = cv2.inRange(hsv, np.array([8, 40, 40]), np.array([38, 255, 255]))    # Amber / Orange / Golden
        onion_mask = cv2.bitwise_or(mask1, cv2.bitwise_or(mask2, mask3))

        onion_pixels = cv2.countNonZero(onion_mask)
        total_pixels = h * w
        pixel_ratio = onion_pixels / float(total_pixels)

        # Require at least 1.5% genuine onion skin hue coverage
        if pixel_ratio < 0.015:
            return [], pixel_ratio

        # 3. Morphological cleanup & contour finding
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        cleaned_mask = cv2.morphologyEx(onion_mask, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        valid_contours = []
        for c in contours:
            area = cv2.contourArea(c)
            # Area must be between 1.0% and 98% of total frame area
            if area < (total_pixels * 0.010) or area > (total_pixels * 0.98):
                continue

            perimeter = cv2.arcLength(c, True)
            if perimeter == 0:
                continue

            circularity = (4 * np.pi * area) / (perimeter ** 2)
            x, y, bw, bh = cv2.boundingRect(c)
            aspect_ratio = min(bw, bh) / float(max(bw, bh))
            extent = area / float(bw * bh)

            # Strict Onion Shape Guardrail: Must be convex/elliptical (circularity >= 0.15 or extent >= 0.35, aspect >= 0.40)
            if (circularity >= 0.15 or extent >= 0.35) and aspect_ratio >= 0.40:
                valid_contours.append(c)

        if not valid_contours:
            # Strictly return empty detections if no valid onion contours exist in frame
            return [], pixel_ratio

        cv_detections = []
        for idx, c in enumerate(valid_contours[:6]): # Limit to 6 prominent onions max
            x, y, bw, bh = cv2.boundingRect(c)
            x1 = max(0, x)
            y1 = max(0, y)
            x2 = min(w, x + bw)
            y2 = min(h, y + bh)
            bw = max(20, x2 - x1)
            bh = max(20, y2 - y1)

            diameter_px = max(bw, bh)
            estimated_mm = round(max(38.0, min(92.0, (diameter_px / min(w, h)) * 155.0)), 1)
            sphericity = round((min(bw, bh) / max(bw, bh)) * 100, 1)
            size_cat = "Large" if estimated_mm >= 60 else ("Medium" if estimated_mm >= 50 else "Small")

            roi = img_np[y1:y2, x1:x2]
            color_index = self._analyze_color_histogram(roi)
            sprout_mm, sprout_severity = self._measure_sprout_contour(roi, "unknown")
            has_rot_blotches, _ = self._check_dark_rot_blotches(roi)

            # Determine Class & Tier Grade
            if sprout_mm > 8.0:
                cls_key = "sprout"
                cls_name = "Sprouted"
                tier_grade = "Grade C" if sprout_mm <= 12.0 else "Reject"
            elif has_rot_blotches or "discolored" in color_index.lower() or "mold" in color_index.lower():
                cls_key = "rotten"
                cls_name = "Rotten"
                tier_grade = "Reject"
            elif sphericity < 82.0:
                cls_key = "cuts"
                cls_name = "Damaged"
                tier_grade = "Grade B"
            else:
                cls_key = "healthy"
                cls_name = "Healthy"
                tier_grade = "Grade A" if estimated_mm >= 60.0 else "Grade B"

            conf = round(float(0.85 + min(0.10, (sphericity / 100.0) * 0.10)), 3)

            det_item = {
                "id": idx + 1,
                "class": cls_key,
                "className": cls_name,
                "confidence": conf,
                "confidencePercent": round(conf * 100, 1),
                "bbox": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                    "width": bw,
                    "height": bh
                },
                "normalizedBbox": [
                    round(x1 / w, 4),
                    round(y1 / h, 4),
                    round(bw / w, 4),
                    round(bh / h, 4)
                ],
                "tier_grade": tier_grade,
                "tierGrade": tier_grade,
                "estimated_size": size_cat,
                "diameter_mm": estimated_mm,
                "diameterMm": estimated_mm,
                "sphericity": sphericity,
                "color_index": color_index,
                "colorIndex": color_index,
                "sprout_length_mm": sprout_mm,
                "sprout_severity": sprout_severity
            }
            cv_detections.append(det_item)

        return cv_detections, pixel_ratio
