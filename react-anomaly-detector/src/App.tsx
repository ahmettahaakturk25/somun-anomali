import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  ChartBarIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

import ResultsPanel from './components/ResultsPanel.tsx';
import StatusCard from './components/StatusCard.tsx';
import { translations, Language } from './i18n/translations.ts';
import './App.css';

interface AnalysisResult {
  originalImage: string;
  anomalyMap: string;
  overlayImage: string;
  anomalyScore: number;
  isAnomaly: boolean;
  confidence: number;
  threshold: number;
  processingTime: number;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  
  const t = translations[language];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress(0);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      // Real API call to Python backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const realResults: AnalysisResult = {
          originalImage: data.results.originalImage,
          anomalyMap: data.results.anomalyMap,
          overlayImage: data.results.overlayImage,
          anomalyScore: data.results.anomalyScore,
          isAnomaly: data.results.isAnomaly,
          confidence: data.results.confidence,
          threshold: data.results.threshold,
          processingTime: data.results.processingTime
        };

        setProgress(100);
        setTimeout(() => {
          setResults(realResults);
          setIsAnalyzing(false);
          setProgress(0);
        }, 500);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Analysis failed: ${error}`);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.appTitle}</h1>
                <p className="text-sm text-gray-500">{t.appSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white text-sm font-medium transition-all shadow-md hover:shadow-lg"
              >
                <LanguageIcon className="w-4 h-4" />
                <span>{language === 'en' ? 'TR' : 'EN'}</span>
              </button>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">{t.modelLabel}</span> {t.modelValue}
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{t.statusReady}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-blue-500" />
                {t.uploadTitle}
              </h2>
              
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">{t.dropHereText}</p>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium mb-2">
                      {t.dragDropText}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t.orClickText}
                    </p>
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <img
                    src={previewUrl}
                    alt="Önizleme"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Analyze Button */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white
                    transition-all duration-300 ease-in-out transform
                    ${isAnalyzing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t.analyzingButton}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>{t.analyzeButton}</span>
                    </div>
                  )}
                </button>

                {/* Progress Bar */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{t.processingText}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Status Card */}
            {results && <StatusCard results={results} language={language} />}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {results ? (
                <ResultsPanel key="results" results={results} language={language} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-12 text-center"
                >
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t.readyForAnalysis}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {t.readyDescription}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
