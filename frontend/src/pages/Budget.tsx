import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Settings } from 'lucide-react';
import { Budget, Category, BudgetStatus } from '../types';
import { budgetService, BudgetCreate } from '../services/budget';
import { categoryService } from '../services/categories';
import BudgetProgressBar from '../components/BudgetProgressBar';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  monthly_limit: z.number().min(0.01, 'Limit must be greater than 0'),
  budget_period: z.string().default('monthly'),
  rollover_enabled: z.boolean().default(false),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const Budget: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget_period: 'monthly',
      rollover_enabled: false,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingBudget) {
      reset({
        category_id: editingBudget.category_id,
        monthly_limit: editingBudget.monthly_limit,
        budget_period: editingBudget.budget_period,
        rollover_enabled: editingBudget.rollover_enabled,
      });
    }
  }, [editingBudget, reset]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [budgetsData, statusData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        budgetService.getStatus(),
        categoryService.getAll(),
      ]);
      setBudgets(budgetsData);
      setBudgetStatus(statusData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    try {
      if (editingBudget) {
        await budgetService.update(editingBudget.id, {
          monthly_limit: data.monthly_limit,
          budget_period: data.budget_period,
          rollover_enabled: data.rollover_enabled,
        });
      } else {
        await budgetService.create(data);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingBudget(null);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.delete(id);
        await loadData();
      } catch (error) {
        alert('Failed to delete budget');
      }
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Manage your spending limits</p>
        </div>
        <Button
          onClick={() => {
            setEditingBudget(null);
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalBudget.toFixed(2)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-600">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-success-600'}`}>
            ${(totalBudget - totalSpent).toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Categories</h2>
        <div className="space-y-4">
          {budgetStatus.length > 0 ? (
            budgetStatus.map((status, index) => {
              const budget = budgets.find(b => b.category_id === status.category_id);
              return (
                <motion.div
                  key={status.category_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{status.category_name}</h3>
                      <p className="text-sm text-gray-600">
                        Period: {budget?.budget_period || 'monthly'} | 
                        Rollover: {budget?.rollover_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => budget && handleEdit(budget)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      {budget && (
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <BudgetProgressBar budget={status} />
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No budgets set yet</p>
              <p className="text-sm text-gray-400">Create your first budget to start tracking</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
          reset();
        }}
        title={editingBudget ? 'Edit Budget' : 'Add Budget'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category_id')}
              disabled={!!editingBudget}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Limit *
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('monthly_limit', { valueAsNumber: true })}
              error={errors.monthly_limit?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Period
            </label>
            <select
              {...register('budget_period')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rollover"
              {...register('rollover_enabled')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="rollover" className="ml-2 text-sm text-gray-700">
              Enable budget rollover (unused budget carries to next period)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBudget(null);
                reset();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1">
              {editingBudget ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;

