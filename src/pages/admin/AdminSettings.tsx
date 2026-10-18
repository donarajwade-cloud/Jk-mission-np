import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { SystemSettings } from '../../types/index.ts';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSettings();
        if (res.success) setSettings(res.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Platform Configuration
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          System Settings & Policies
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Global defaults for website branding, Nepal contact info, and 15-day settlement rules.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System settings updated and saved to persistent database!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.websiteName}
              onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Domain URL</label>
            <input
              type="text"
              value={settings.websiteUrl}
              onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Withdrawal & Settlement Limits</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Withdrawal (NPR)</label>
              <input
                type="number"
                value={settings.minWithdrawalNpr}
                onChange={(e) => setSettings({ ...settings, minWithdrawalNpr: Number(e.target.value) || 100 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Withdrawal (NPR)</label>
              <input
                type="number"
                value={settings.maxWithdrawalNpr}
                onChange={(e) => setSettings({ ...settings, maxWithdrawalNpr: Number(e.target.value) || 50000 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Settlement Cycle (Days)</label>
              <input
                type="number"
                value={settings.settlementPeriodDays}
                onChange={(e) => setSettings({ ...settings, settlementPeriodDays: Number(e.target.value) || 15 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center space-x-1.5 shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
