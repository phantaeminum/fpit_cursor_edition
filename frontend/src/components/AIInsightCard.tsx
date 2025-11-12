import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

interface AIInsightCardProps {
  content: string;
  type?: string;
  isRead?: boolean;
  onMarkRead?: () => void;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  content,
  type,
  isRead = false,
  onMarkRead,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200 ${
        !isRead ? 'ring-2 ring-primary-300' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">AI Insight</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-sm text-gray-700 leading-relaxed"
              >
                {content}
              </motion.p>
            )}
          </AnimatePresence>
          {!isRead && onMarkRead && (
            <button
              onClick={onMarkRead}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsightCard;

