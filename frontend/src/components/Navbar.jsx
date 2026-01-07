import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Scroll handler for glass effect intensity
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-white/20' 
        : 'bg-white/50 backdrop-blur-sm border-b border-white/5'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/pwa-192x192.png" 
              alt="NLoger Logo" 
              className="w-10 h-10 rounded-lg shadow-sm"
            />
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              NLoger
            </span>
          </Link>

          {/* Desktop Menu - Split into Nav and Actions */}
          <div className="hidden md:flex items-center flex-1 ml-10">
            {/* Main Navigation - Left aligned */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Accueil
              </Link>
              <Link to="/properties" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Logements
              </Link>
              <Link to="/advanced-search" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Recherche Avancée
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                À propos
              </Link>
            </div>

            <div className="flex-1"></div>

            {/* User Actions - Right aligned */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors group p-1 rounded-full hover:bg-gray-50/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-md group-hover:shadow-lg transition-all overflow-hidden ring-2 ring-transparent group-hover:ring-primary-100">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg">{user.first_name ? user.first_name[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                       <span className="font-semibold text-sm text-gray-800">{user.first_name || 'Utilisateur'}</span>
                       <span className="text-xs text-gray-500 font-medium">
                         {user.is_superuser ? 'Admin' : (user.is_proprietaire ? 'Propriétaire' : (user.is_demarcheur ? 'Démarcheur' : 'Membre'))}
                       </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.first_name || 'Utilisateur'} {user.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || 'email@example.com'}</p>
                      </div>
                      
                      <div className="py-2">
                          <Link 
                            to="/profile" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Mon Profil
                          </Link>

                          <Link 
                            to="/settings" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Paramètres
                          </Link>
                        
                        {(user.is_proprietaire || user.is_superuser) && (
                          <Link 
                            to="/delegate-management" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Confier mon bien
                          </Link>
                        )}
                        
                        {(user.is_demarcheur || user.is_superuser) && (
                          <Link 
                            to="/mandate-dashboard" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                             <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Tableau de bord
                          </Link>
                        )}

                        <div className="h-px bg-gray-100 my-2 mx-4"></div>
                        
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Connexion
                  </Link>
                  <Link to="/register" className="px-6 py-2 bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    S'inscrire
                  </Link>
                </div>
              )}
              
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden md:flex p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                  title="Installer l'application"
                >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}

              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

              <Link to="/add-property" className="hidden md:flex btn-primary items-center space-x-2 shadow-lg hover:shadow-primary-500/30 whitespace-nowrap rounded-full px-6">
                <span>+</span>
                <span>Publier</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" className="origin-center" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" className="origin-center" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-16 left-0 w-full overflow-hidden transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'max-h-[90vh] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'}`}>
          <div className="py-4 px-2 space-y-2 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl rounded-b-3xl mx-2 mb-4 ring-1 ring-black/5">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
              Accueil
            </Link>
            <Link to="/properties" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
              Logements
            </Link>
            <Link to="/advanced-search" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
              Recherche Avancée
            </Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
              À propos
            </Link>
            
            {user ? (
              <>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <div className="px-4 py-2 flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                       {user.avatar ? (
                          <img src={user.avatar} alt="Profile" className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <span>{user.first_name ? user.first_name[0].toUpperCase() : 'U'}</span>
                        )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.first_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
                    Mon Profil
                  </Link>
                  <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
                    Paramètres
                  </Link>
                  {(user.is_proprietaire || user.is_superuser) && (
                    <Link to="/delegate-management" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
                      Confier mon bien
                    </Link>
                  )}
                  {(user.is_demarcheur || user.is_superuser) && (
                    <Link to="/mandate-dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all">
                      Tableau de bord
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 px-2 mt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 font-medium transition-all">
                  Connexion
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl text-white bg-primary-600 hover:bg-primary-700 font-medium transition-all shadow-lg shadow-primary-500/20">
                  Inscription
                </Link>
              </div>
            )}
            
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center space-x-2 text-primary-600 font-medium py-3 border border-primary-200 bg-primary-50/50 rounded-xl mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Installer l'app</span>
              </button>
            )}
            
            <Link to="/add-property" onClick={() => setIsMenuOpen(false)} className="block w-full text-center btn-primary py-3 mt-4 shadow-xl shadow-primary-500/20 rounded-xl">
              Publier un logement
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
