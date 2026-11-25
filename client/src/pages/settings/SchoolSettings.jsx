import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Globe, Building, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const SchoolSettings = () => {
  const [settings, setSettings] = useState({
    school_name: '',
    school_tagline: '',
    school_address: '',
    school_phone: '',
    school_email: '',
    school_currency: 'PKR',
    principal_name: '',
    default_fee_due_day: '10',
    late_fee_fine_amount: '300',
    default_language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data?.success && res.data.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/settings', { settings });
      if (res.data?.success) {
        toast.success('Settings saved successfully!');
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading school configuration..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Institution Settings & Localization</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          General school profile, finance policies, principal information, and interface preferences
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        {/* General Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>School Identification</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={settings.school_name}
                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={settings.school_tagline}
                onChange={(e) => setSettings({ ...settings, school_tagline: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Address *</label>
              <input
                type="text"
                required
                value={settings.school_address}
                onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landline Phone *</label>
              <input
                type="text"
                required
                value={settings.school_phone}
                onChange={(e) => setSettings({ ...settings, school_phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={settings.school_email}
                onChange={(e) => setSettings({ ...settings, school_email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Head of Institution / Principal *</label>
              <input
                type="text"
                required
                value={settings.principal_name}
                onChange={(e) => setSettings({ ...settings, principal_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Finance Policies */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Finance & Currency Policies</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Currency</label>
              <input
                type="text"
                disabled
                value="Pakistani Rupee (PKR - ₨)"
                className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Fee Due Day</label>
              <input
                type="number"
                min="1"
                max="28"
                value={settings.default_fee_due_day}
                onChange={(e) => setSettings({ ...settings, default_fee_due_day: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Late Payment Fine (PKR)</label>
              <input
                type="number"
                value={settings.late_fee_fine_amount}
                onChange={(e) => setSettings({ ...settings, late_fee_fine_amount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Localization & Language */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>Interface Language</span>
          </h3>
          <div className="w-full sm:w-64">
            <label className="block font-semibold text-slate-700 mb-1">Configurable Interface Language</label>
            <select
              value={settings.default_language}
              onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="en">English (Default)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <Button type="submit" loading={saving} icon={Save}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SchoolSettings;

