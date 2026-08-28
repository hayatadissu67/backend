import React, { useState } from 'react';
import { changePasswordApi } from '../services/api';

interface FirstLoginChangePasswordModalProps {
  userName: string;
  userEmail: string;
  onPasswordChanged: () => void;
}

export const FirstLoginChangePasswordModal: React.FC<FirstLoginChangePasswordModalProps> = ({
  userName,
  userEmail,
  onPasswordChanged,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      onPasswordChanged();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 text-indigo-900 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">First-Time Login Security Setup</h2>
            <p className="text-xs text-slate-500 font-medium">{userEmail}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg mb-6 leading-relaxed flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-700 text-sm mt-0.5">info</span>
          <span>
            Welcome <strong>{userName}</strong>! You were provisioned with a temporary default password.
            For platform security, you must establish a permanent password before accessing your PMO workspace.
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md text-xs text-red-700 font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Current Temporary Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter temporary password provided by creator"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              New Permanent Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Updating Password...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Set Permanent Password &amp; Enter Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
