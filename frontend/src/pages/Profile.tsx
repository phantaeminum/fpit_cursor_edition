import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Lock, Trash2, Moon, Sun, Download } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { authService } from '../services/auth';
import Button from '../components/Button';
import Input from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, financialProfile, logout } = useUserStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await authService.updateProfile(data);
      alert('Profile updated successfully');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.changePassword(data.current_password, data.new_password);
      alert('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.deleteAccount();
      logout();
      navigate('/welcome');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await authService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to export data');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings & Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="inline-block mr-2 h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="inline-block mr-2 h-4 w-4" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="inline-block mr-2 h-4 w-4" />
            Settings
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <Input
                label="Full Name"
                {...profileForm.register('full_name')}
                error={profileForm.formState.errors.full_name?.message}
              />
              <Input
                label="Email"
                type="email"
                {...profileForm.register('email')}
                error={profileForm.formState.errors.email?.message}
              />
              <Input
                label="Phone Number"
                {...profileForm.register('phone')}
                error={profileForm.formState.errors.phone?.message}
              />
              <Button type="submit" variant="primary" disabled={isLoading}>
                Save Changes
              </Button>
            </form>

            {financialProfile && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income
                    </label>
                    <p className="text-lg text-gray-900">
                      ${financialProfile.monthly_income?.toLocaleString() || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Savings
                    </label>
                    <p className="text-lg text-gray-900">
                      ${financialProfile.current_savings?.toLocaleString() || 'Not set'}
                    </p>
                  </div>
                  {financialProfile.financial_goals && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Financial Goals
                      </label>
                      <p className="text-gray-900">{financialProfile.financial_goals}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                {...passwordForm.register('current_password')}
                error={passwordForm.formState.errors.current_password?.message}
              />
              <Input
                label="New Password"
                type="password"
                {...passwordForm.register('new_password')}
                error={passwordForm.formState.errors.new_password?.message}
              />
              <Input
                label="Confirm New Password"
                type="password"
                {...passwordForm.register('confirm_password')}
                error={passwordForm.formState.errors.confirm_password?.message}
              />
              <Button type="submit" variant="primary" disabled={isLoading}>
                Change Password
              </Button>
            </form>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Toggle dark theme</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-600">Download all your data as JSON</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleExportData}>
                  Export
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-red-200">
              <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Delete Account</p>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;


