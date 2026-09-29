"""
OnionGrade AI - Explainable Quality Scoring & Penalty Engine
Calculates commercial quality score (0-100), itemized deduction breakdown, and 4-tier grade:
- Base Score: 100
- Severe Rot / Mold ("rotten"): -40 pts
- Advanced Sprouting ("sprout"): -30 pts
- Mechanical Skin Cuts / Peeler Damage ("cuts"): -25 pts
- Low Sphericity (<90%): -10 pts
- Undersized (<50mm): -15 pts
"""

def calculate_quality_score(detections):
    """
    Computes explainable quality score, 4-tier grade, itemized penalty breakdown list, and plain-language rationale.
    """
    if not detections or len(detections) == 0:
        return None, None, "No onions detected. Please upload a clearer image containing onions.", []

    total = len(detections)
    score = 100.0
    deductions_list = []
    structured_breakdown = []

    rotten_count = sum(1 for d in detections if d.get("class", "").lower() in ["rotten", "rot"])
    sprout_count = sum(1 for d in detections if d.get("class", "").lower() in ["sprout", "sprouted"] or d.get("sprout_length_mm", 0) > 3.0)
    cuts_count = sum(1 for d in detections if d.get("class", "").lower() in ["cuts", "cut", "damaged"])
    low_sphericity_count = sum(1 for d in detections if d.get("sphericity", 100) < 90.0)
    undersized_count = sum(1 for d in detections if d.get("diameter_mm", 60) < 50.0 or d.get("estimated_size", "") == "Small")

    # 1. Rot Defect Penalty
    if rotten_count > 0:
        pts = round((rotten_count / total) * 40.0, 1)
        score -= pts
        deductions_list.append(f"{rotten_count} Severe Rot ('rotten') instance(s) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Rotten Defect",
            "penalty": int(pts),
            "count": rotten_count,
            "description": "Severe rot, tissue breakdown, or mold stain"
        })

    # 2. Sprout Defect Penalty
    if sprout_count > 0:
        pts = round((sprout_count / total) * 30.0, 1)
        score -= pts
        deductions_list.append(f"{sprout_count} Sprout ('sprout') instance(s) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Sprout Defect",
            "penalty": int(pts),
            "count": sprout_count,
            "description": "Apical green sprout protrusion (>3mm)"
        })

    # 3. Cuts / Damage Penalty
    if cuts_count > 0:
        pts = round((cuts_count / total) * 25.0, 1)
        score -= pts
        deductions_list.append(f"{cuts_count} Mechanical Cut/Damage ('cuts') instance(s) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Cuts & Damage",
            "penalty": int(pts),
            "count": cuts_count,
            "description": "Skin cuts, bruises, or peeler damage"
        })

    # 4. Low Sphericity Penalty
    if low_sphericity_count > 0:
        pts = round((low_sphericity_count / total) * 10.0, 1)
        score -= pts
        deductions_list.append(f"{low_sphericity_count} Low Sphericity (<90%) instance(s) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Low Sphericity (<90%)",
            "penalty": int(pts),
            "count": low_sphericity_count,
            "description": "Asymmetric or flattened geometric shape"
        })

    # 5. Undersized Penalty
    if undersized_count > 0:
        pts = round((undersized_count / total) * 15.0, 1)
        score -= pts
        deductions_list.append(f"{undersized_count} Undersized (<50mm) instance(s) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Undersized (<50mm)",
            "penalty": int(pts),
            "count": undersized_count,
            "description": "Diameter below 50mm threshold"
        })

    # 6. Surface Defect Area Percentage Penalty
    defect_area_sum = sum(d.get("defect_area_pct", 0) for d in detections)
    avg_defect_area_pct = round(defect_area_sum / total, 1)
    if avg_defect_area_pct > 2.0 and rotten_count == 0 and cuts_count == 0:
        pts = round(min(20.0, avg_defect_area_pct * 1.5), 1)
        score -= pts
        deductions_list.append(f"Surface Defect Area ({avg_defect_area_pct}%) (-{int(pts)} pts)")
        structured_breakdown.append({
            "rule": "Surface Defect Area",
            "penalty": int(pts),
            "count": 1,
            "description": f"Pixel-level surface skin defect area of {avg_defect_area_pct}%"
        })

    final_score = int(max(15, min(100, round(score))))

    # Assign 4-Tier Horticultural Grade based on strict physical benchmarks
    if rotten_count > 0 or sprout_count >= 1 or final_score < 50:
        grade = "Reject"
        rationale_prefix = "Reject (Substandard Tier): High defect threshold breached with apical green sprouting, severe rot, or mold decay."
    elif undersized_count >= 1 or final_score < 70:
        grade = "Grade C"
        rationale_prefix = "Grade C (Local Consumption Tier): Small/undersized bulbs (<50mm) or local processing batch suitable for immediate dehydration."
    elif cuts_count > 0 or low_sphericity_count > 0 or final_score < 85:
        grade = "Grade B"
        rationale_prefix = "Grade B (Domestic Market Tier): Standard domestic quality with loose dry skin or medium diameter (50-60mm)."
    else:
        grade = "Grade A"
        rationale_prefix = "Grade A (Export Tier): Premium export quality with large diameter (>=60mm), >90% sphericity, deep ruby red skin, zero rot, and zero sprouting."

    if len(deductions_list) > 0:
        reason = f"{grade}: {rationale_prefix} ({', '.join(deductions_list)})."
    else:
        reason = rationale_prefix

    return final_score, grade, reason, structured_breakdown
