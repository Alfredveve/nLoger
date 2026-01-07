import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'LOCATAIRE',
    bio_document: null,
    contract_document: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      await register(data);
      
      if (formData.role === 'DEMARCHEUR') {
        alert("Inscription réussie ! Votre compte est en attente de validation par un administrateur. Vous recevrez une notification une fois validé.");
        navigate('/login');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-xl w-full space-y-8 bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 transition-all duration-300 hover:shadow-primary-500/10 my-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg flex items-center justify-center transform -rotate-6 mb-4">
             <span className="text-white font-bold text-xl">+</span>
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez NLoger pour accéder à tous nos services
          </p>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="registration-form">
          <div className="space-y-5">
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Nom d'utilisateur</label>
              <div className="relative">
                 <input 
                  name="username" 
                  id="username"
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                  placeholder="Choisissez un nom d'utilisateur"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email"
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                placeholder="votre@email.com"
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Mot de passe</label>
              <input 
                type="password" 
                name="password" 
                id="password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="group">
                <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Prénom</label>
                <input 
                  name="first_name" 
                  id="first_name"
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>
              <div className="group">
                <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Nom</label>
                <input 
                  name="last_name" 
                  id="last_name"
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Téléphone</label>
              <input 
                name="phone" 
                id="phone"
                value={formData.phone} 
                onChange={handleChange} 
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                placeholder="+224 ..."
              />
            </div>

            <div className="group">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Type de compte</label>
              <div className="relative">
                <select 
                  name="role" 
                  id="role"
                  value={formData.role} 
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm appearance-none"
                >
                  <option value="LOCATAIRE">Locataire</option>
                  <option value="DEMARCHEUR">Démarcheur</option>
                  <option value="PROPRIETAIRE">Propriétaire</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {formData.role === 'DEMARCHEUR' && (
              <div className="space-y-4 bg-blue-50/50 backdrop-blur-sm p-5 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <h3 className="text-sm font-bold uppercase tracking-wider">Documents requis</h3>
                </div>
                
                <div className="group">
                  <label htmlFor="bio_document" className="block text-sm font-medium text-gray-700 mb-1">Pièce d'identité (PDF/Image)</label>
                  <input 
                    type="file" 
                    name="bio_document" 
                    id="bio_document"
                    onChange={handleChange} 
                    required 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer"
                  />
                </div>
                <div className="group">
                  <label htmlFor="contract_document" className="block text-sm font-medium text-gray-700 mb-1">Contrat signé (PDF/Image)</label>
                  <input 
                    type="file" 
                    name="contract_document" 
                    id="contract_document"
                    onChange={handleChange} 
                    required 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white ${
                  loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200`}
              >
                {loading ? (
                   <span className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Inscription en cours...
                   </span>
                ) : 'S\'inscrire'}
              </button>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/50 backdrop-blur-sm text-gray-500">
                  Déjà un compte ?
                </span>
              </div>
            </div>

            <div className="text-center">
               <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                 Se connecter
               </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
