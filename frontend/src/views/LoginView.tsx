import React, { useState } from 'react';
import { UserRoleType } from '../types';
import { loginApi } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRoleType>('EXECUTIVE_MANAGER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleMeta: Record<UserRoleType, { title: string; desc: string; icon: string }> = {
    EXECUTIVE_MANAGER: {
      title: 'Executive Manager',
      desc: 'Executive Portfolio & Strategic Governance Workspace',
      icon: 'shield_person',
    },
    PROJECT_MANAGER: {
      title: 'Project Manager',
      desc: 'Project Execution, Timelines & Team Assignment',
      icon: 'account_tree',
    },
    RISK_MANAGER: {
      title: 'Risk Manager',
      desc: 'Risk Matrix, Mitigation Controls & Compliance',
      icon: 'security',
    },
    TEAM_MEMBER: {
      title: 'Team Member',
      desc: 'My Tasks, Deliverables & Collaboration',
      icon: 'person',
    },
  };

  const handleRoleChange = (newRole: UserRoleType) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginApi(email, password, role);

      if (!data || !data.success) {
        throw new Error(data?.message || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to PMO authentication service. Please check network connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[#00174b] p-3.5 rounded-2xl shadow-xl shadow-indigo-950/20 border border-blue-900/30">
            <span className="material-symbols-outlined text-white text-3xl block">rocket_launch</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">
          Enterprise PMO Control Tower
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Select your role and enter credentials to sign in
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-md animate-fadeIn">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
                  </div>
                  <div className="ml-2.5">
                    <p className="text-xs text-red-700 font-semibold leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Account Role *</span>
                <span className="text-[10px] text-indigo-600 normal-case font-bold">Verified against database</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-indigo-600 text-lg">
                    {roleMeta[role]?.icon || 'badge'}
                  </span>
                </div>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRoleType)}
                  className="appearance-none block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg shadow-2xs font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="EXECUTIVE_MANAGER">Executive Manager (Director)</option>
                  <option value="PROJECT_MANAGER">Project Manager (PM)</option>
                  <option value="RISK_MANAGER">Risk Manager (Governance)</option>
                  <option value="TEAM_MEMBER">Team Member (Engineer / Specialist)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                {roleMeta[role]?.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-2xs placeholder-slate-400 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                  placeholder="name@enterprise-pmo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-2xs placeholder-slate-400 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-xs font-bold text-white bg-[#00174b] hover:bg-indigo-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    <span>Verifying Credentials &amp; Role...</span>
                  </div>
                ) : (
                  `Sign In as ${roleMeta[role]?.title || 'User'}`
                )}
              </button>
            </div>
          </form>

          {/* Reference Guide of Seeded Database Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Default System Accounts (MySQL Seeded):
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Executive Manager</p>
                <p className="text-slate-500 font-mono">executive@pmo.com</p>
                <p className="text-slate-400 font-mono">Executive@123</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Project Manager</p>
                <p className="text-slate-500 font-mono">pm@pmo.com</p>
                <p className="text-slate-400 font-mono">Project@123</p>
              </div>
              <div className="space-y-0.5 pt-1 border-t border-slate-200">
                <p className="font-bold text-slate-800">Risk Manager</p>
                <p className="text-slate-500 font-mono">risk@pmo.com</p>
                <p className="text-slate-400 font-mono">Risk@123</p>
              </div>
              <div className="space-y-0.5 pt-1 border-t border-slate-200">
                <p className="font-bold text-slate-800">Team Member</p>
                <p className="text-slate-500 font-mono">team@pmo.com</p>
                <p className="text-slate-400 font-mono">Team@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
