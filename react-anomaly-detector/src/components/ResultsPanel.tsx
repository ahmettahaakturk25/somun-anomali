import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhotoIcon,
  FireIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { translations, Language } from '../i18n/translations.ts';

interface ResultsPanelProps {
  results: {
    originalImage: string;
    anomalyMap: string;
    overlayImage: string;
    anomalyScore: number;
    isAnomaly: boolean;
    confidence: number;
    threshold: number;
    processingTime: number;
  };
  language: Language;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, language }) => {
  const [selectedView, setSelectedView] = useState<'grid' | 'focus'>('grid');
  const [focusedImage, setFocusedImage] = useState<string>('');
  const t = translations[language];

  const visualizations = [
    {
      id: 'original',
      title: t.originalImage,
      icon: PhotoIcon,
      image: results.originalImage,
      description: t.originalImageDesc
    },
    {
      id: 'heatmap',
      title: t.anomalyHeatmap,
      icon: FireIcon,
      image: results.anomalyMap,
      description: `${t.anomalyHeatmapDesc} ${results.anomalyScore.toFixed(4)})`
    },
    {
      id: 'overlay',
      title: t.overlayAnalysis,
      icon: EyeIcon,
      image: results.overlayImage,
      description: t.overlayAnalysisDesc
    }
  ];

  const handleImageClick = (image: string) => {
    setFocusedImage(image);
    setSelectedView('focus');
  };

  const downloadResults = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('BTC AI Anomaly Detection Results', 20, 40);
      
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${results.anomalyScore.toFixed(4)} | Threshold: ${results.threshold.toFixed(4)}`, 20, 70);
      ctx.fillText(`Result: ${results.isAnomaly ? 'ANOMALY' : 'NORMAL'} | Confidence: ${(results.confidence * 100).toFixed(1)}%`, 20, 95);
      
      const link = document.createElement('a');
      link.download = `anomaly-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">{t.analysisResults}</h2>
              <p className="text-blue-100 text-sm">
                {t.processingCompleted} {results.processingTime.toFixed(1)}s
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedView('grid')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedView === 'grid' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {t.gridView}
            </button>
            <button
              onClick={downloadResults}
              className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>{t.download}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedView === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visualizations.map((viz, index) => (
              <motion.div
                key={viz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleImageClick(viz.image)}
              >
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <viz.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{viz.title}</h3>
                  </div>
                  
                  <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <img
                      src={viz.image}
                      alt={viz.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">{viz.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Focus View */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="max-w-2xl mx-auto">
              <img
                src={focusedImage}
                alt="Focused view"
                className="w-full rounded-xl shadow-lg"
              />
              <button
                onClick={() => setSelectedView('grid')}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
              >
                {t.backToGrid}
              </button>
            </div>
          </motion.div>
        )}

        {/* Metrics Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.detailedMetrics}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.anomalyScore.toFixed(4)}
              </div>
              <div className="text-sm text-gray-600">{t.anomalyScore}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.threshold.toFixed(4)}
              </div>
              <div className="text-sm text-gray-600">{t.thresholdValue}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(results.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{t.confidenceValue}</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${results.isAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                {results.isAnomaly ? t.anomaly : t.normalClass}
              </div>
              <div className="text-sm text-gray-600">{t.classification}</div>
            </div>
          </div>

          {/* Score Visualization */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t.scoreComparison}</span>
              <span>{results.anomalyScore > results.threshold ? t.aboveThreshold : t.belowThreshold}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    results.isAnomaly 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ 
                    width: `${Math.min((results.anomalyScore / Math.max(results.anomalyScore, results.threshold * 2)) * 100, 100)}%` 
                  }}
                />
              </div>
              
              {/* Threshold marker */}
              <div
                className="absolute top-0 w-1 h-4 bg-gray-600"
                style={{ 
                  left: `${Math.min((results.threshold / Math.max(results.anomalyScore, results.threshold * 2)) * 100, 100)}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{t.threshold}: {results.threshold.toFixed(4)}</span>
              <span>Max</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResultsPanel;
