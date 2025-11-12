import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, AlertCircle, DollarSign, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { budgetService } from '../services/budget';
import { transactionService } from '../services/transactions';
import { aiService } from '../services/ai';
import { alertService } from '../services/alerts';
import { BudgetStatus, Alert, AIInsight } from '../types';
import BudgetProgressBar from '../components/BudgetProgressBar';
import AIInsightCard from '../components/AIInsightCard';
import Button from '../components/Button';
import ChartCard from '../components/ChartCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [budgets, summary, alertsData, insightsData] = await Promise.all([
        budgetService.getStatus(),
        transactionService.getSummary(),
        alertService.getAll(true),
        aiService.getInsights(),
      ]);

      setBudgetStatus(budgets);
      const total = budgets.reduce((sum, b) => sum + b.budget_limit, 0);
      const spent = budgets.reduce((sum, b) => sum + b.spent, 0);
      setTotalBudget(total);
      setTotalSpent(spent);
      setAlerts(alertsData.slice(0, 5));
      setInsights(insightsData.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;

  // Prepare chart data
  const spendingData = budgetStatus.slice(0, 7).map(b => ({
    name: b.category_name,
    spent: b.spent,
    limit: b.budget_limit,
  }));

  const pieData = budgetStatus.map(b => ({
    name: b.category_name,
    value: b.spent,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your budget and spending</p>
        </div>
        <Button
          onClick={() => navigate('/transactions?action=add')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold mt-1 ${remaining < 0 ? 'text-red-600' : 'text-success-600'}`}>
                ${Math.abs(remaining).toFixed(2)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              remaining < 0 ? 'bg-red-100' : 'bg-success-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${remaining < 0 ? 'text-red-600' : 'text-success-600'}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Budget Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
            <span className="text-sm font-semibold text-gray-900">
              {percentageUsed.toFixed(1)}% used
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                percentageUsed >= 90 ? 'bg-red-500' :
                percentageUsed >= 70 ? 'bg-amber-500' : 'bg-primary-500'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                content={insight.content}
                type={insight.insight_type}
                isRead={insight.is_read}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Budget Status by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget by Category</h2>
        <div className="space-y-4">
          {budgetStatus.length > 0 ? (
            budgetStatus.map((budget, index) => (
              <motion.div
                key={budget.category_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BudgetProgressBar budget={budget} />
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No budgets set yet. <button
                onClick={() => navigate('/budget')}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Create your first budget
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Spending by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#3B82F6"
                strokeWidth={2}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="limit"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

