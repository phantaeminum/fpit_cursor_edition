import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Brain, Shield } from 'lucide-react';
import Button from '../components/Button';

const Welcome: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized budget recommendations based on your spending patterns',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your spending and savings with beautiful charts and analytics',
    },
    {
      icon: Shield,
      title: 'Stay on Budget',
      description: 'Receive alerts when you approach or exceed your budget limits',
    },
    {
      icon: DollarSign,
      title: 'Smart Recommendations',
      description: 'Adaptive budgeting that adjusts to your life events and goals',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <DollarSign className="h-20 w-20 text-primary-600" />
          </motion.div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Budgeting Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take control of your finances with intelligent insights and adaptive recommendations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <Icon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Link to="/onboarding">
            <Button variant="primary" className="px-8 py-4 text-lg">
              Get Started
            </Button>
          </Link>
          <p className="mt-4 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;

