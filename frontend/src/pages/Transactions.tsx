import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Transaction, Category } from '../types';
import { transactionService, TransactionCreate } from '../services/transactions';
import { categoryService } from '../services/categories';
import TransactionItem from '../components/TransactionItem';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category_id: z.string().optional(),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'Date is required'),
  payment_method: z.string().optional(),
  is_recurring: z.boolean().default(false),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount: editingTransaction.amount,
        category_id: editingTransaction.category_id || '',
        description: editingTransaction.description || '',
        transaction_date: editingTransaction.transaction_date.split('T')[0],
        payment_method: editingTransaction.payment_method || '',
        is_recurring: editingTransaction.is_recurring,
      });
    }
  }, [editingTransaction, reset]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txns, cats] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(txns);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await transactionService.create(data);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingTransaction(null);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(id);
        await loadData();
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return undefined;
    return categories.find(c => c.id === categoryId)?.name;
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = !searchQuery || 
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.amount.toString().includes(searchQuery);
    const matchesCategory = !selectedCategory || txn.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your income and expenses</p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null);
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <TransactionItem
                  transaction={transaction}
                  categoryName={getCategoryName(transaction.category_id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          reset();
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('category_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              type="text"
              {...register('description')}
              error={errors.description?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <Input
              type="date"
              {...register('transaction_date')}
              error={errors.transaction_date?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <Input
              type="text"
              placeholder="e.g., Credit Card, Cash, Bank Transfer"
              {...register('payment_method')}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              {...register('is_recurring')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              Recurring transaction
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
                reset();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1">
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;

