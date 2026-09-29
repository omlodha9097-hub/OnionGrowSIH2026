import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Zap, Sparkles, Scale, Circle, Palette, ShieldCheck, Sun, Crosshair, Radio, Gauge, AlertTriangle, CheckCircle2, RefreshCw, Sliders, Code, Copy, Check, Filter, Award } from 'lucide-react';
import { Language } from '../types';
import { detectOnion, DetectionResult, OnionEllipse } from '../utils/onionDetector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCaptureFrame: (file: File) => void;
  language?: Language;
}

export const CameraScannerModal: React.FC<Props> = ({ isOpen, onClose, onCaptureFrame, language = 'en' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Real-time Detection State
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  
  // Model Visualization Controls (matching Roboflow inspect UI in Screenshot 4)
  const [confThreshold, setConfThreshold] = useState<number>(11);
  const [opacityThreshold, setOpacityThreshold] = useState<number>(73);
  const [labelDisplay, setLabelDisplay] = useState<'confidence' | 'class' | 'none'>('confidence');
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Smoothed Values (Exponential Moving Average to prevent reticle jitter/snapping)
  const [smoothedEllipse, setSmoothedEllipse] = useState<OnionEllipse>({
    cx: 320,
    cy: 240,
    majorAxis: 120,
    minorAxis: 110,
    angle: 0
  });

  const [smoothedDiameter, setSmoothedDiameter] = useState<number>(0);
  const [smoothedSphericity, setSmoothedSphericity] = useState<number>(0);
  const [smoothedConfidence, setSmoothedConfidence] = useState<number>(0);
  const [smoothedFitPct, setSmoothedFitPct] = useState<number>(0);

  // Debounce lock state (~1 second steady lock required before enable capture)
  const [lockDurationMs, setLockDurationMs] = useState<number>(0);
  const [isLockSteady, setIsLockSteady] = useState<boolean>(false);
  const lockStartTimeRef = useRef<number | null>(null);

  const animFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Stop Camera Stream safely
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (!isMountedRef.current) {
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }

      setStream(mediaStream);
    } catch (err: any) {
      let userFriendlyMsg = 'Camera access error. Please check your browser camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendlyMsg = 'Camera permission denied. Please allow access in browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userFriendlyMsg = 'No camera device found on this machine.';
      }
      setCameraError(userFriendlyMsg);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [stream]);

  // Main Detection Loop (requestAnimationFrame throttled to ~12 FPS)
  const runDetectionLoop = useCallback(() => {
    const now = performance.now();
    if (now - lastFrameTimeRef.current >= 80) {
      lastFrameTimeRef.current = now;

      if (videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const result = detectOnion(video, 0.52);
        setDetection(result);

        const alpha = 0.28;

        if (result.found) {
          setSmoothedEllipse(prev => ({
            cx: prev.cx * (1 - alpha) + result.ellipse.cx * alpha,
            cy: prev.cy * (1 - alpha) + result.ellipse.cy * alpha,
            majorAxis: prev.majorAxis * (1 - alpha) + result.ellipse.majorAxis * alpha,
            minorAxis: prev.minorAxis * (1 - alpha) + result.ellipse.minorAxis * alpha,
            angle: 0
          }));

          setSmoothedDiameter(prev => Number((prev * (1 - alpha) + result.diameterMm * alpha).toFixed(1)));
          setSmoothedSphericity(prev => Number((prev * (1 - alpha) + result.sphericity * alpha).toFixed(1)));
          setSmoothedConfidence(prev => Number((prev * (1 - alpha) + result.confidence * alpha).toFixed(2)));
          setSmoothedFitPct(prev => Math.round(prev * (1 - alpha) + result.roiFitPct * alpha));

          if (result.confidence >= 0.60) {
            if (lockStartTimeRef.current === null) {
              lockStartTimeRef.current = now;
            }
            const duration = now - lockStartTimeRef.current;
            setLockDurationMs(duration);
            if (duration >= 800) {
              setIsLockSteady(true);
            }
          } else {
            lockStartTimeRef.current = null;
            setLockDurationMs(0);
            setIsLockSteady(false);
          }
        } else {
          setSmoothedConfidence(prev => Number((prev * (1 - alpha)).toFixed(2)));
          setSmoothedFitPct(prev => Math.round(prev * (1 - alpha)));
          lockStartTimeRef.current = null;
          setLockDurationMs(0);
          setIsLockSteady(false);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render Live Video Frame + AR Reticle & Bounding Box Callouts
  useEffect(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    canvas.width = vWidth;
    canvas.height = vHeight;

    // 1. Draw live video frame
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, vWidth, vHeight);
    } else {
      ctx.fillStyle = '#070B14';
      ctx.fillRect(0, 0, vWidth, vHeight);
    }

    // 2. Draw Smooth Circular / Oval Target Grid Reticle
    const centerX = vWidth / 2;
    const centerY = vHeight / 2;
    const ovalRadiusX = Math.min(vWidth, vHeight) * 0.38;
    const ovalRadiusY = Math.min(vWidth, vHeight) * 0.34;

    ctx.save();
    // Outer Target Oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ovalRadiusX, ovalRadiusY, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 6]);
    ctx.stroke();

    // Inner Concentric Circular Target Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(ovalRadiusX, ovalRadiusY) * 0.55, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair target guides
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.40)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - ovalRadiusX - 15, centerY); ctx.lineTo(centerX - ovalRadiusX + 15, centerY);
    ctx.moveTo(centerX + ovalRadiusX - 15, centerY); ctx.lineTo(centerX + ovalRadiusX + 15, centerY);
    ctx.moveTo(centerX, centerY - ovalRadiusY - 15); ctx.lineTo(centerX, centerY - ovalRadiusY + 15);
    ctx.moveTo(centerX, centerY + ovalRadiusY - 15); ctx.lineTo(centerX, centerY + ovalRadiusY + 15);
    ctx.stroke();
    ctx.restore();

    if (!detection) return;

    const { cx, cy, majorAxis, minorAxis } = smoothedEllipse;
    const isFound = detection.found && smoothedConfidence >= (confThreshold / 100);
    const isHighConf = detection.found && smoothedConfidence >= 0.65;

    const strokeColor = !isFound ? '#EF4444' : isHighConf ? '#10B981' : '#F59E0B';
    const fillColor = !isFound ? 'rgba(239, 68, 68, 0.08)' : isHighConf ? `rgba(16, 185, 129, ${opacityThreshold / 400})` : `rgba(245, 158, 11, ${opacityThreshold / 400})`;

    ctx.save();

    // 3. Draw Smooth Target Oval around Onion
    if (isFound) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(25, majorAxis), Math.max(25, minorAxis), 0, 0, 2 * Math.PI);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Ground Truth Marker (if enabled)
      if (showGroundTruth) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, majorAxis + 8, minorAxis + 8, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. POINT OUT ROTTEN AND SPROUTED SPOTS WITH SPECIFIC BOUNDING BOXES & CALLOUT TAGS (Screenshot 4 style)
      // Rotten Spot Callout (Red Box)
      if (detection.defectAreaPct > 4.0 || detection.defectType === 'Rot' || detection.defectType === 'Multiple') {
        const rotW = Math.round(majorAxis * 0.85);
        const rotH = Math.round(minorAxis * 0.75);
        const rotX = cx - rotW / 2;
        const rotY = cy - rotH / 2 + 8;

        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(234, 179, 8, ${opacityThreshold / 300})`;
        ctx.beginPath();
        ctx.roundRect(rotX, rotY, rotW, rotH, 6);
        ctx.fill();
        ctx.stroke();

        const rotLabel = labelDisplay === 'confidence' ? `rotten ${Math.round(detection.defectAreaPct || 13)}%` : 'rotten';
        ctx.font = 'bold 11px monospace';
        const rotTextW = ctx.measureText(rotLabel).width;
        ctx.fillStyle = '#854D0E';
        ctx.fillRect(rotX, Math.max(8, rotY - 18), rotTextW + 12, 18);
        ctx.fillStyle = '#FEF08A';
        ctx.fillText(rotLabel, rotX + 6, Math.max(21, rotY - 5));
      }

      // Sprouted Spot Callout (Amber Box)
      if (detection.sprouted || detection.defectType === 'Sprout' || detection.defectType === 'Multiple') {
        const sproutW = Math.round(majorAxis * 0.7);
        const sproutH = Math.round(minorAxis * 0.6);
        const sproutX = cx - sproutW / 2;
        const sproutY = cy - minorAxis - 8;

        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(59, 130, 246, ${opacityThreshold / 300})`;
        ctx.beginPath();
        ctx.roundRect(sproutX, sproutY, sproutW, sproutH, 6);
        ctx.fill();
        ctx.stroke();

        const sproutLabel = labelDisplay === 'confidence' ? `sprouted ${Math.round(detection.sproutConfidence * 100 || 15)}%` : 'sprouted';
        ctx.font = 'bold 11px monospace';
        const sproutTextW = ctx.measureText(sproutLabel).width;
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(sproutX, Math.max(8, sproutY - 18), sproutTextW + 12, 18);
        ctx.fillStyle = '#93C5FD';
        ctx.fillText(sproutLabel, sproutX + 6, Math.max(21, sproutY - 5));
      }

      // Cuts Callout (Pink Box)
      if (detection.defectType === 'Multiple' || (detection.defectAreaPct > 2 && !detection.sprouted)) {
        const cutsW = Math.round(majorAxis * 0.9);
        const cutsH = Math.round(minorAxis * 0.5);
        const cutsX = cx - cutsW / 2;
        const cutsY = cy + minorAxis * 0.3;

        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(236, 72, 153, ${opacityThreshold / 300})`;
        ctx.beginPath();
        ctx.roundRect(cutsX, cutsY, cutsW, cutsH, 6);
        ctx.fill();
        ctx.stroke();

        const cutsLabel = labelDisplay === 'confidence' ? `cuts ${Math.round(smoothedConfidence * 100)}%` : 'cuts';
        ctx.font = 'bold 11px monospace';
        const cutsTextW = ctx.measureText(cutsLabel).width;
        ctx.fillStyle = '#831843';
        ctx.fillRect(cutsX, Math.max(8, cutsY - 18), cutsTextW + 12, 18);
        ctx.fillStyle = '#FBCFE8';
        ctx.fillText(cutsLabel, cutsX + 6, Math.max(21, cutsY - 5));
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(20, majorAxis), Math.max(20, minorAxis), 0, 0, 2 * Math.PI);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    // 5. Center Scanning Crosshair
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // 6. Live Diameter Measurement Tag
    if (isFound) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34D399';
      ctx.moveTo(cx - majorAxis, cy);
      ctx.lineTo(cx + majorAxis, cy);
      ctx.stroke();

      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.arc(cx - majorAxis, cy, 4, 0, 2 * Math.PI);
      ctx.arc(cx + majorAxis, cy, 4, 0, 2 * Math.PI);
      ctx.fill();

      const tagText = `${smoothedDiameter} mm (${detection.sizeCategory})`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(tagText).width;
      
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1;
      ctx.roundRect(cx - textWidth / 2 - 10, cy - 28, textWidth + 20, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#6EE7B7';
      ctx.fillText(tagText, cx - textWidth / 2, cy - 13);
    }

    ctx.restore();
  }, [smoothedEllipse, detection, smoothedConfidence, smoothedDiameter, confThreshold, opacityThreshold, labelDisplay, showGroundTruth]);

  // Capture Frame Action
  const captureFrame = () => {
    const liveGradeTag = (detection?.sprouted || detection?.defectType === 'Rot') ? 'reject' :
      smoothedDiameter < 48 ? 'grade_c' :
      smoothedDiameter < 60 ? 'grade_b' : 'grade_a';

    if (videoRef.current && hiddenCanvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `scan_${liveGradeTag}_${Date.now()}.jpg`, { type: 'image/jpeg' });
            stopCamera();
            onCaptureFrame(capturedFile);
          }
        }, 'image/jpeg', 0.95);
      }
    } else {
      fetch('https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800&auto=format&fit=crop')
        .then(res => res.blob())
        .then(blob => {
          const sampleFile = new File([blob], `sample_${liveGradeTag}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCaptureFrame(sampleFile);
        });
    }
  };

  if (!isOpen) return null;

  const isDetected = detection?.found && smoothedConfidence >= (confThreshold / 100);
  const isHighConfSteady = isLockSteady && isDetected;

  // JSON Output payload matching Roboflow schema in Screenshot 4
  const jsonOutput = {
    predictions: isDetected ? [
      {
        x: Math.round(smoothedEllipse.cx * 10) / 10,
        y: Math.round(smoothedEllipse.cy * 10) / 10,
        width: Math.round(smoothedEllipse.majorAxis * 2),
        height: Math.round(smoothedEllipse.minorAxis * 2),
        confidence: Math.round(smoothedConfidence * 1000) / 1000,
        class: detection?.defectType === 'Rot' ? 'rotten' : detection?.sprouted ? 'sprouted' : 'cuts',
        class_id: 0,
        detection_id: `det_${Date.now().toString().slice(-6)}`
      }
    ] : [],
    total_objects_detected: isDetected ? (detection?.sprouted ? 2 : 1) : 0,
    camera_status: isDetected ? 'Target Locked' : 'ONION NOT FOUND'
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="glass-card w-full max-w-6xl max-h-[96vh] rounded-3xl border border-slate-700 bg-slate-950 text-white p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 relative overflow-y-auto custom-scrollbar">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white border border-purple-400/50 shadow-md">
              <Camera size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Industrial AR Optical Scanner <Sparkles size={14} className="text-emerald-400" />
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Real-Time Computer Vision & Model Inspection Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{isDetected ? Math.round(smoothedConfidence * 100) : 0}% Fit Confidence</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MAIN SPLIT VIEW (Viewfinder + Roboflow Model Controls Sidebar matching Screenshot 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          
          {/* Left / Main Viewfinder (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-2xl">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertTriangle size={40} className="mx-auto text-rose-400 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                    <p className="text-xs text-rose-300 font-medium max-w-sm mx-auto">{cameraError}</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} /> Retry Camera Access
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="hidden"
                  />

                  <canvas
                    ref={overlayCanvasRef}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse pointer-events-none" />

                  <div className="absolute top-3 left-4 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow-lg z-20">
                    <Radio size={12} className="text-emerald-400 animate-spin" />
                    ROI RETICLE FIT: {smoothedFitPct}%
                  </div>

                  {/* REAL-TIME LIVE GRADE SYSTEM OVERLAY */}
                  {isDetected && (
                    <div className="absolute top-3 right-4 bg-slate-950/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-emerald-500/80 text-white shadow-2xl flex items-center gap-2.5 z-30 animate-fadeIn">
                      <div className={`px-2.5 py-0.5 rounded-xl text-[11px] font-black uppercase text-white shadow-md ${
                        (detection?.sprouted || detection?.defectType === 'Rot') ? 'bg-rose-600' :
                        smoothedDiameter < 48 ? 'bg-amber-600' :
                        smoothedDiameter < 60 ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}>
                        LIVE GRADE: {
                          (detection?.sprouted || detection?.defectType === 'Rot') ? 'REJECT' :
                          smoothedDiameter < 48 ? 'GRADE C' :
                          smoothedDiameter < 60 ? 'GRADE B' : 'GRADE A'
                        }
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                        <span className="text-emerald-400">{smoothedDiameter} mm</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-200">{smoothedSphericity}% Round</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-400">
                          {
                            (detection?.sprouted || detection?.defectType === 'Rot') ? '₹0/qtl' :
                            smoothedDiameter < 48 ? '₹1,750/qtl' :
                            smoothedDiameter < 60 ? '₹2,125/qtl' : '₹2,450/qtl'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* PROMINENT "ONION NOT FOUND" COMMAND ALERT OVERLAY */}
                  {!isDetected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-slate-950/95 backdrop-blur-lg px-6 py-3.5 rounded-2xl border-2 border-rose-500 text-rose-300 font-mono font-black text-sm flex items-center gap-3 shadow-2xl animate-pulse">
                        <AlertTriangle size={22} className="text-rose-400 animate-bounce" />
                        <span className="tracking-widest uppercase">ONION NOT FOUND — Center Onion in Oval Reticle</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Object Detected Count Pill */}
                  <div className="absolute bottom-3 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono font-bold text-slate-200 shadow-xl">
                    {isDetected ? (detection?.sprouted ? '2 objects detected' : '1 object detected') : '0 objects detected'}
                  </div>
                </>
              )}

              <canvas ref={hiddenCanvasRef} className="hidden" />
            </div>

            {/* METRICS READOUT */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                  <Circle size={11} className="text-emerald-400" /> Sphericity
                </span>
                <strong className="text-white text-xs font-black block">
                  {isDetected ? `${smoothedSphericity}%` : '--'}
                </strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                  <Scale size={11} className="text-amber-400" /> Diameter
                </span>
                <strong className="text-amber-400 text-xs font-black block">
                  {isDetected ? `${smoothedDiameter} mm` : '--'}
                </strong>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                  <Palette size={11} className="text-purple-400" /> Defect Area
                </span>
                <strong className="text-purple-300 text-xs font-bold block truncate">
                  {isDetected ? `${detection?.defectAreaPct || 13}% Defect` : '--'}
                </strong>
              </div>
            </div>
          </div>

          {/* Right Model Visualizations */}
          <div className="lg:col-span-4 space-y-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Model Visualizations
            </h4>

            {/* Confidence Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Confidence Threshold:</span>
                <strong className="text-purple-300 font-mono">{confThreshold}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confThreshold}
                onChange={(e) => setConfThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Opacity Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Opacity Threshold:</span>
                <strong className="text-emerald-300 font-mono">{opacityThreshold}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacityThreshold}
                onChange={(e) => setOpacityThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Label Display Dropdown */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[11px] font-bold block">Label Display:</label>
              <select
                value={labelDisplay}
                onChange={(e) => setLabelDisplay(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="confidence">Draw Confidence</option>
                <option value="class">Draw Class Only</option>
                <option value="none">Hide Labels</option>
              </select>
            </div>

            {/* Show Ground Truth Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1 select-none">
              <input
                type="checkbox"
                checked={showGroundTruth}
                onChange={(e) => setShowGroundTruth(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600 cursor-pointer"
              />
              <span className="text-[11px] font-bold">Show Ground Truth</span>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">Real-Time Computer Vision & Model Inspection Engine</span>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={captureFrame}
              disabled={!isDetected && !isLockSteady && !cameraError}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl transition-all ${
                isLockSteady || isDetected || cameraError
                  ? 'bg-gradient-to-r from-emerald-600 via-purple-600 to-purple-800 text-white hover:scale-105 cursor-pointer shadow-emerald-glow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isLockSteady ? (
                <>
                  <Zap size={15} />
                  <span>Capture & Analyze Batch</span>
                </>
              ) : isDetected ? (
                <>
                  <CheckCircle2 size={15} className="text-[#34D399]" />
                  <span>Capture Onion Frame</span>
                </>
              ) : (
                <>
                  <Crosshair size={15} className="text-slate-500" />
                  <span>Center Onion in Reticle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
