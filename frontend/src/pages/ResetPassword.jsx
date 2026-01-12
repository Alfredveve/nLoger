import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneFromState = location.state?.phone || '';
  const emailFromState = location.state?.email || '';
  const method = location.state?.method || (phoneFromState ? 'phone' : emailFromState ? 'email' : 'phone');

  const [formData, setFormData] = useState({
    phone: phoneFromState,
    email: emailFromState,
    otp: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Nettoyer les données pour n'envoyer que ce qui est nécessaire
      const submitData = {
        otp: formData.otp,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      };
      if (method === 'phone') submitData.phone = formData.phone;
      else submitData.email = formData.email;

      const response = await api.post('auth/password/reset/verify/', submitData);
      toast.success(response.data.message || 'Mot de passe réinitialisé !');
      navigate('/login');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : (errorData.error || "Erreur de validation"));
        } else {
          toast.error("Une erreur est survenue");
        }
      } else {
        toast.error("Impossible de contacter le serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-primary-200/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg flex items-center justify-center transform rotate-12 mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">Réinitialisation</h2>
          <p className="mt-2 text-sm text-gray-600">Saisissez le code reçu et votre nouveau mot de passe</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Identifier (Phone or Email) */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
              {method === 'phone' ? 'Numéro de téléphone' : 'Adresse Email'}
            </label>
            <input
              name={method}
              type={method === 'phone' ? 'text' : 'email'}
              required
              value={method === 'phone' ? formData.phone : formData.email}
              onChange={handleChange}
              readOnly={Boolean(phoneFromState || emailFromState)}
              className={`block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 text-gray-900 ${(phoneFromState || emailFromState) ? 'bg-gray-100 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'} transition-all shadow-sm`}
            />
          </div>

          {/* OTP Code */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Code de vérification (OTP)</label>
            <input
              name="otp"
              type="text"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              placeholder="000000"
            />
          </div>

          {/* New Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Nouveau mot de passe</label>
            <input
              name="new_password"
              type="password"
              required
              value={formData.new_password}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Confirmer le mot de passe</label>
            <input
              name="confirm_password"
              type="password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
                loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Réinitialiser le mot de passe'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/forgot-password" title="Changer la méthode" className="text-sm font-medium text-gray-500 hover:text-primary-600">
              Renvoyer un nouveau code
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
