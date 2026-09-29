const axios = require('axios');
const FormData = require('form-data');
const { calculateGrading } = require('./gradingEngine');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8088/analyze';
const MODEL_INFO_URL = process.env.MODEL_INFO_URL || 'http://127.0.0.1:8088/model-info';

async function analyzeOnionImage(fileBuffer, originalFilename) {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: originalFilename || 'onion_batch.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(AI_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 15000
    });

    const aiData = response.data;
    
    // Check if FastAPI returned an error message or no onions detected (e.g. steel can)
    if (aiData.error || aiData.is_onion_valid === false || (aiData.total_onions === 0 && (!aiData.detections || aiData.detections.length === 0))) {
      return {
        error: aiData.error || 'No onion detected in the image. The system only captures and analyzes onions.',
        totalOnionsDetected: 0,
        total_onions: 0,
        detectedOnions: [],
        detections: [],
        is_onion_valid: false,
        isDemoModel: false
      };
    }

    const grading = calculateGrading(aiData);

    return {
      batch_id: aiData.batch_id || `BATCH_${Date.now()}`,
      totalOnionsDetected: aiData.total_onions ?? aiData.totalOnionsDetected ?? 0,
      total_onions: aiData.total_onions ?? aiData.totalOnionsDetected ?? 0,
      defectBreakdown: aiData.summary || aiData.defectBreakdown || {},
      qualityScore: aiData.quality_score ?? grading.qualityScore,
      quality_score: aiData.quality_score ?? grading.qualityScore,
      grade: aiData.grade ?? grading.suggestedGrade,
      suggestedGrade: aiData.grade ?? grading.suggestedGrade,
      finalAssignedGrade: aiData.grade ?? grading.finalAssignedGrade,
      detections: aiData.detections || [],
      detectedOnions: aiData.detectedOnions || [],
      predictions: aiData.predictions || [],
      image: aiData.image || { width: 800, height: 600 },
      annotated_image: aiData.annotated_image || null,
      explanationText: aiData.reason || grading.explanationText,
      detection_stage: aiData.detection_stage || aiData.detectionStage || 'YOLOv8 Dual-Stage',
      detectionStage: aiData.detection_stage || aiData.detectionStage || 'YOLOv8 Dual-Stage',
      deduction_breakdown: aiData.deduction_breakdown || aiData.deductionBreakdown || [],
      deductionBreakdown: aiData.deduction_breakdown || aiData.deductionBreakdown || [],
      debug_info: aiData.debug_info || aiData.debugInfo || {},
      debugInfo: aiData.debug_info || aiData.debugInfo || {},
      inference_specs: aiData.inference_specs || { is_real_yolo: true },
      isDemoModel: false
    };
  } catch (err) {
    console.error('❌ AI Service Error:', err.message);
    if (err.response && err.response.data && err.response.data.detail) {
      return {
        error: err.response.data.detail,
        totalOnionsDetected: 0,
        detections: [],
        isDemoModel: false
      };
    }
    return {
      error: `AI Service Connection Failed: ${err.message}. Ensure Python AI microservice is running on port 8088.`,
      totalOnionsDetected: 0,
      detections: [],
      isDemoModel: false
    };
  }
}

async function getModelInfo() {
  try {
    const response = await axios.get(MODEL_INFO_URL, { timeout: 5000 });
    return response.data;
  } catch (err) {
    return {
      error: `Model Info Service Unreachable: ${err.message}`,
      is_real_inference: false
    };
  }
}

module.exports = {
  analyzeOnionImage,
  getModelInfo
};
