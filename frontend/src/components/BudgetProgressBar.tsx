import React from 'react';
import { motion } from 'framer-motion';
import { BudgetStatus } from '../types';

interface BudgetProgressBarProps {
  budget: BudgetStatus;
  showDetails?: boolean;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ budget, showDetails = true }) => {
  const percentage = Math.min(budget.percentage_used, 100);
  const isWarning = percentage >= 70 && percentage < 90;
  const isCritical = percentage >= 90;

  const getColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{budget.category_name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              ${budget.spent.toFixed(2)} / ${budget.budget_limit.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${
              isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
      {showDetails && budget.remaining < 0 && (
        <p className="text-xs text-red-600 mt-1">
          Over budget by ${Math.abs(budget.remaining).toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default BudgetProgressBar;

