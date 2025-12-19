export const translations = {
  en: {
    appTitle: "BTC AI",
    appSubtitle: "Anomaly Detection",
    modelLabel: "Model:",
    modelValue: "ResNet50",
    statusReady: "Ready",
    
    uploadTitle: "Upload Image",
    dragDropText: "Drag & drop an image here",
    orClickText: "or click to select • PNG, JPG, JPEG",
    dropHereText: "Drop the image here...",
    
    analyzeButton: "Analyze Image",
    analyzingButton: "Analyzing...",
    processingText: "Processing...",
    
    anomalyDetected: "ANOMALY DETECTED",
    normal: "NORMAL",
    confidence: "Confidence",
    score: "Score",
    threshold: "Threshold",
    processingTime: "Processing Time",
    scoreVsThreshold: "Score vs Threshold",
    
    analysisResults: "Analysis Results",
    processingCompleted: "Processing completed in",
    gridView: "Grid View",
    download: "Download",
    backToGrid: "Back to Grid",
    
    originalImage: "Original Image",
    originalImageDesc: "Input image for analysis",
    anomalyHeatmap: "Anomaly Heatmap",
    anomalyHeatmapDesc: "Heat map showing anomaly intensity (Score:",
    overlayAnalysis: "Overlay Analysis",
    overlayAnalysisDesc: "Original image with anomaly overlay",
    
    detailedMetrics: "Detailed Metrics",
    anomalyScore: "Anomaly Score",
    thresholdValue: "Threshold",
    confidenceValue: "Confidence",
    classification: "Classification",
    anomaly: "ANOMALY",
    normalClass: "NORMAL",
    scoreComparison: "Score vs Threshold Comparison",
    aboveThreshold: "Above Threshold",
    belowThreshold: "Below Threshold",
    
    readyForAnalysis: "Ready for Analysis",
    readyDescription: "Upload a metal nut image to detect anomalies using our advanced BTC AI model. Get detailed analysis with heatmaps and confidence scores."
  },
  tr: {
    appTitle: "Somun Anomali",
    appSubtitle: "Anomali Tespiti",
    modelLabel: "Model:",
    modelValue: "ResNet50",
    statusReady: "Hazır",
    
    uploadTitle: "Görüntü Yükle",
    dragDropText: "Bir görüntüyü buraya sürükleyip bırakın",
    orClickText: "veya seçmek için tıklayın • PNG, JPG, JPEG",
    dropHereText: "Görüntüyü buraya bırakın...",
    
    analyzeButton: "Görüntüyü Analiz Et",
    analyzingButton: "Analiz Ediliyor...",
    processingText: "İşleniyor...",
    
    anomalyDetected: "ANOMALİ TESPİT EDİLDİ",
    normal: "NORMAL",
    confidence: "Güven",
    score: "Skor",
    threshold: "Eşik",
    processingTime: "İşlem Süresi",
    scoreVsThreshold: "Skor / Eşik Karşılaştırması",
    
    analysisResults: "Analiz Sonuçları",
    processingCompleted: "İşlem tamamlandı",
    gridView: "Izgara Görünümü",
    download: "İndir",
    backToGrid: "Izgaraya Dön",
    
    originalImage: "Orijinal Görüntü",
    originalImageDesc: "Analiz için giriş görüntüsü",
    anomalyHeatmap: "Anomali Isı Haritası",
    anomalyHeatmapDesc: "Anomali yoğunluğunu gösteren ısı haritası (Skor:",
    overlayAnalysis: "Katman Analizi",
    overlayAnalysisDesc: "Anomali katmanı ile orijinal görüntü",
    
    // Metrics
    detailedMetrics: "Detaylı Metrikler",
    anomalyScore: "Anomali Skoru",
    thresholdValue: "Eşik Değeri",
    confidenceValue: "Güven",
    classification: "Sınıflandırma",
    anomaly: "ANOMALİ",
    normalClass: "NORMAL",
    scoreComparison: "Skor / Eşik Karşılaştırması",
    aboveThreshold: "Eşiğin Üstünde",
    belowThreshold: "Eşiğin Altında",
    
    // Placeholder
    readyForAnalysis: "Analiz İçin Hazır",
    readyDescription: "Gelişmiş BTC AI modelimizi kullanarak anomalileri tespit etmek için bir metal somun görüntüsü yükleyin. Isı haritaları ve güven skorları ile detaylı analiz alın."
  }
};

export type Language = 'en' | 'tr';
export type TranslationKey = keyof typeof translations.en;
