import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Check } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { authService } from '../services/auth';
import { useUserStore } from '../store/userStore';

const step1Schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
});

const step2Schema = z.object({
  monthly_income: z.number().min(0, 'Income must be positive').optional(),
  current_savings: z.number().min(0, 'Savings must be positive').optional(),
  financial_goals: z.string().optional(),
  currency: z.string().default('USD'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loadUser } = useUserStore();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const totalSteps = 2;

  const handleStep1Submit = (data: Step1Data) => {
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    setIsLoading(true);
    try {
      const step1Data = step1Form.getValues();
      const tokens = await authService.register({
        ...step1Data,
        financial_profile: {
          monthly_income: data.monthly_income,
          current_savings: data.current_savings,
          financial_goals: data.financial_goals,
          currency: data.currency,
        },
      });

      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      await loadUser();
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="card">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <DollarSign className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Let's get started with your basic information</p>
                </div>

                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                  <Input
                    label="Username"
                    {...step1Form.register('username')}
                    error={step1Form.formState.errors.username?.message}
                  />

                  <Input
                    label="Full Name"
                    {...step1Form.register('full_name')}
                    error={step1Form.formState.errors.full_name?.message}
                  />

                  <Input
                    label="Email"
                    type="email"
                    {...step1Form.register('email')}
                    error={step1Form.formState.errors.email?.message}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    {...step1Form.register('phone')}
                    error={step1Form.formState.errors.phone?.message}
                  />

                  <Input
                    label="Password"
                    type="password"
                    {...step1Form.register('password')}
                    error={step1Form.formState.errors.password?.message}
                  />

                  <Button type="submit" variant="primary" className="w-full">
                    Continue
                  </Button>
                </form>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <Check className="h-12 w-12 text-success-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Profile</h2>
                  <p className="text-gray-600">Help us understand your financial situation</p>
                </div>

                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                  <Input
                    label="Monthly Income (Optional)"
                    type="number"
                    step="0.01"
                    {...step2Form.register('monthly_income', { valueAsNumber: true })}
                    error={step2Form.formState.errors.monthly_income?.message}
                  />

                  <Input
                    label="Current Savings (Optional)"
                    type="number"
                    step="0.01"
                    {...step2Form.register('current_savings', { valueAsNumber: true })}
                    error={step2Form.formState.errors.current_savings?.message}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Financial Goals (Optional)
                    </label>
                    <textarea
                      className="input"
                      rows={4}
                      {...step2Form.register('financial_goals')}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                      Complete Setup
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

