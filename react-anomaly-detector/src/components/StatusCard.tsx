import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { translations, Language } from '../i18n/translations.ts';

interface StatusCardProps {
  results: {
    anomalyScore: number;
    isAnomaly: boolean;
    confidence: number;
    threshold: number;
    processingTime: number;
  };
  language: Language;
}

const StatusCard: React.FC<StatusCardProps> = ({ results, language }) => {
  const { anomalyScore, isAnomaly, confidence, threshold, processingTime } = results;
  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl shadow-lg p-6 text-white
        ${isAnomaly 
          ? 'bg-gradient-to-r from-red-500 to-orange-500' 
          : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isAnomaly ? (
            <ExclamationTriangleIcon className="w-8 h-8" />
          ) : (
            <CheckCircleIcon className="w-8 h-8" />
          )}
          <div>
            <h3 className="text-lg font-bold">
              {isAnomaly ? t.anomalyDetected : t.normal}
            </h3>
            <p className="text-sm opacity-90">
              {t.confidence}: {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">
            {anomalyScore.toFixed(4)}
          </div>
          <div className="text-sm opacity-90">
            {t.score}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4" />
          <span>{t.threshold}: {threshold.toFixed(4)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4" />
          <span>{processingTime.toFixed(1)}s</span>
        </div>
      </div>

      {/* Progress bar for score vs threshold */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>{t.scoreVsThreshold}</span>
          <span>{((anomalyScore / Math.max(anomalyScore, threshold)) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min((anomalyScore / Math.max(anomalyScore, threshold)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StatusCard;
