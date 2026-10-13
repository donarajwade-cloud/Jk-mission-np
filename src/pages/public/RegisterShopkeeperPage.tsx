import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Store, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterShopkeeperPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterShopkeeperPage: React.FC<RegisterShopkeeperPageProps> = ({
  onSuccess,
  onNavigateLogin
}) => {
  const { registerShopkeeper } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [district, setDistrict] = useState('Kathmandu');
  const [municipality, setMunicipality] = useState('');
  const [panOrVatNumber, setPanOrVatNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Chitwan', 'Morang', 'Ilam', 'Mustang', 'Jhapa', 'Rupandehi'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('You must accept the terms and merchant policies.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerShopkeeper({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        password,
        shopName: shopName.trim(),
        shopAddress: shopAddress.trim(),
        district,
        municipality: municipality.trim(),
        panOrVatNumber: panOrVatNumber.trim() || undefined
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Shopkeeper application failed');
      }
    } catch (err: any) {
      setError(err.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-300 font-black text-xl flex items-center justify-center mx-auto shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 pt-2">Shopkeeper Registration</h1>
          <p className="text-xs text-slate-500">
            Join the JK Mission Nepal retail network to sell products and reach thousands of customers
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-snug">
          <ShieldCheck className="w-4 h-4 text-amber-600 inline mr-1" />
          <strong>Admin Approval Policy: </strong>
          Submitted shopkeeper accounts and products require administrator verification before going live. Shopkeepers can submit products, but commissions and cashbacks are strictly controlled and authorized by the Admin.
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Proprietor / Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Suman Tamang"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number (+977)</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+97798XXXXXXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Shop / Business Name</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Himalayan Herbal & Handicraft Center"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400 bg-white"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Municipality / Rural Municipality</label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="e.g. Kathmandu Metropolitan"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Shop Street Address</label>
            <input
              type="text"
              required
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="e.g. New Road, Ward No. 22"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PAN / VAT Registration Number</label>
              <input
                type="text"
                value={panOrVatNumber}
                onChange={(e) => setPanOrVatNumber(e.target.value)}
                placeholder="e.g. 601234987"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs">
                I agree to the Merchant Agreement. I understand that my proposed products must be approved by the Admin and that commissions are determined by platform policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Submitting Application...' : 'Submit Shopkeeper Application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-amber-800 font-bold hover:underline"
          >
            Log In here
          </button>
        </div>
      </div>
    </div>
  );
};
