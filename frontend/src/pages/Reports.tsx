import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import { reportService } from '../services/reports';
import ChartCard from '../components/ChartCard';
import Button from '../components/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<'month' | '3months' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (dateRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (dateRange === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange();
      const [trendsData, breakdown, incomeExp] = await Promise.all([
        reportService.getSpendingTrends(start, end),
        reportService.getCategoryBreakdown(start, end),
        reportService.getIncomeVsExpenses(start, end),
      ]);
      
      // Transform trends data for chart
      const trends = trendsData.dates?.map((date: string, idx: number) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: trendsData.amounts?.[idx] || 0,
      })) || [];
      
      // Transform category breakdown
      const categories = breakdown.map((cat: any) => ({
        name: cat.name,
        amount: cat.value || cat.amount || 0,
      })) || [];
      
      // Transform income vs expenses
      const incomeExpData = [
        {
          period: dateRange === 'month' ? 'This Month' : dateRange === '3months' ? 'Last 3 Months' : 'This Year',
          income: incomeExp.income || 0,
          expenses: incomeExp.expenses || 0,
        },
      ];
      
      setSpendingTrends(trends);
      setCategoryBreakdown(categories);
      setIncomeVsExpenses(incomeExpData);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const { start, end } = getDateRange();
      const blob = await reportService.exportReport(format, start, end);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-report-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Analyze your spending patterns and trends</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 p-4 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-5 w-5 text-gray-600 mt-1" />
          <div className="flex gap-2">
            {(['month', '3months', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'month' ? 'This Month' : range === '3months' ? 'Last 3 Months' : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Spending Trends */}
        <ChartCard title="Spending Trends">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Spending" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <ChartCard title="Category Breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Income vs Expenses */}
          <ChartCard title="Income vs Expenses">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Total Spending</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success-600" />
              <h3 className="font-semibold text-gray-900">Top Category</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {categoryBreakdown.length > 0
                ? categoryBreakdown[0].name
                : 'N/A'}
            </p>
            {categoryBreakdown.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                ${categoryBreakdown[0].amount.toLocaleString()}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Average Daily</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(
                categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0) /
                (dateRange === 'month' ? 30 : dateRange === '3months' ? 90 : 365)
              ).toFixed(2)}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;

