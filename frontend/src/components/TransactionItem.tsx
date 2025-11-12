import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../types';
import { Calendar, Tag, CreditCard } from 'lucide-react';
// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface TransactionItemProps {
  transaction: Transaction;
  categoryName?: string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  categoryName,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              ${transaction.amount.toFixed(2)}
            </h3>
            {transaction.is_recurring && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Recurring
              </span>
            )}
          </div>
          {transaction.description && (
            <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(transaction.transaction_date)}
            </div>
            {categoryName && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {categoryName}
              </div>
            )}
            {transaction.payment_method && (
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {transaction.payment_method}
              </div>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionItem;

