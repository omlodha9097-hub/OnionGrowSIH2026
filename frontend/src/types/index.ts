export type UserRole = 'farmer' | 'inspector' | 'admin';
export type Language = 'en' | 'hi' | 'mr';

export interface User {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  phoneNumber?: string;
  district?: string;
  village?: string;
  acres?: number;
  aadhaar?: string;
  totalPayout?: number;
}

export interface QualityReport {
  id: string;
  farmerId: string;
  farmerName: string;
  timestamp: string;
  totalCount: number;
  healthyPercentage: number;
  cutsPercentage: number;
  rottenPercentage: number;
  sproutedPercentage: number;
  grade: string;
  imageUrl?: string;
  dbtDisbursed?: boolean;
  dbtAmount?: number;
  sbiRefNo?: string;
}

export interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id?: number;
  detection_id?: string;
}

export interface OnionDetectionItem {
  id: number | string;
  class?: string;
  status?: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
  normalizedBbox?: [number, number, number, number];
  diameterMm?: number;
  sphericity?: number;
  tierGrade?: string;
  colorIndex?: string;
}

export interface DeductionItem {
  rule: string;
  penalty: number;
  description: string;
  count: number;
}

export interface DebugInfo {
  mean_brightness?: number;
  pixel_ratio?: number;
  yolo_top_confidence?: number;
}

export interface AIAnalysisResult {
  totalOnionsDetected: number;
  finalAssignedGrade: string;
  suggestedGrade?: string;
  grade?: string;
  qualityScore: number;
  explanationText?: string;
  reason?: string;
  defectBreakdown?: Record<string, number>;
  tierCounts?: Record<string, number>;
  detectedOnions?: OnionDetectionItem[];
  predictions?: RoboflowPrediction[];
  image?: { width: number; height: number };
  detectionStage?: string;
  detection_stage?: string;
  deductionBreakdown?: DeductionItem[];
  deduction_breakdown?: DeductionItem[];
  debugInfo?: DebugInfo;
  debug_info?: DebugInfo;
  averageDiameterMm?: number;
  averageSphericity?: number;
  colorRating?: string;
  sproutLengthMm?: number;
  defectCount?: number;
}

export interface GradingBatch {
  batchId: string;
  farmerId: string;
  farmerName: string;
  inspectorId: string;
  inspectorName: string;
  procurementCenterId: string;
  procurementCenterName: string;
  quantityQuintals: number;
  imageUrls: string[];
  aiAnalysisResult: AIAnalysisResult;
  status: 'Pending_Verification' | 'Approved' | 'Paid' | 'Disputed';
  blockchainHash: string;
  qrCodePayload: string;
  createdAt: string;
  isOfflineSynced?: boolean;
  offlineSyncedAt?: string | null;
  payoutDetails?: {
    ratePerQuintal?: number;
    totalAmount?: number;
    dbtReference?: string;
    paidAt?: Date | string;
  };
}

export interface SlotCenter {
  id?: string;
  centerId: string;
  name: string;
  district: string;
  activeCounters: number;
  status: string;
  operatingHours: string;
}

export interface SlotBooking {
  bookingId: string;
  farmerId: string;
  farmerName: string;
  centerId: string;
  centerName: string;
  allocatedCounter: string;
  counterName?: string;
  slotDate: string;
  date?: string;
  slotWindow: string;
  timeSlotLabel?: string;
  estimatedPayout: number;
  tokenId: string;
  blockchainHash: string;
  qrCodePayload: string;
  qr?: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
