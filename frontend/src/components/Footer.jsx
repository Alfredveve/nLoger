import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, Home, Search, PlusCircle, Settings as SettingsIcon } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-white/10 pt-12 pb-6 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              NLoger
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              La plateforme de référence pour la gestion et la recherche de logements en Guinée. Simplifiez vos démarches immobilières avec NLoger.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-300">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 text-sm">
                  <Home size={14} /> Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 text-sm">
                  <PlusCircle size={14} /> À propos
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 text-sm">
                  <Search size={14} /> Propriétés
                </Link>
              </li>
              <li>
                <Link to="/advanced-search" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 text-sm">
                  <Search size={14} /> Recherche Avancée
                </Link>
              </li>
              <li>
                <Link to="/add-property" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 text-sm">
                  <PlusCircle size={14} /> Ajouter un Bien
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={18} className="text-primary-600 shrink-0" />
                <span>Conakry, République de Guinée</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={18} className="text-primary-600 shrink-0" />
                <span>+224 000 00 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={18} className="text-primary-600 shrink-0" />
                <span>contact@nloger.gn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Inscrivez-vous pour recevoir les dernières offres.
            </p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary-600 outline-none transition-all text-sm"
              />
              <button 
                type="button" 
                className="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                aria-label="S'abonner"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {currentYear} NLoger. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-500">
            <Link to="/settings" className="hover:text-primary-600 transition-colors flex items-center gap-1">
              <SettingsIcon size={14} /> Paramètres
            </Link>
            <a href="#" className="hover:text-primary-600 transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-primary-600 transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
