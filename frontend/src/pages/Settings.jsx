import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false
    });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }
        setLoading(true);
        // Simulation d'appel API
        setTimeout(() => {
            setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès (simulation).' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-8 pb-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 relative overflow-hidden transition-all">
                     <div className="absolute top-0 right-0 p-4 opacity-5 dark:text-white">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Paramètres</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte et vos préférences</p>
                    </div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <Link to="/profile" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Voir le profil</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 space-y-4">
                        <nav className="flex flex-col space-y-1">
                            {['Sécurité', 'Notifications', 'Préférences', 'Compte'].map((item) => (
                                <button
                                    key={item}
                                    className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                                        item === 'Sécurité' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                        
                        <div className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Besoin d'aide ?</h3>
                            <p className="text-primary-100 text-sm mb-4">Notre équipe de support est là pour vous accompagner 24/7.</p>
                            <button className="w-full py-2 bg-white text-primary-600 rounded-lg font-bold text-sm hover:bg-primary-50 transition-colors">
                                Contacter le support
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Security Section */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mot de passe & Sécurité</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Mettez à jour votre mot de passe régulièrement pour plus de sécurité.</p>
                            </div>
                            <div className="p-8">
                                {message.text && (
                                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <form onSubmit={handleSubmitPassword} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="block w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="block w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Chargement...' : 'Mettre à jour le mot de passe'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choisissez comment vous souhaitez être informé.</p>
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    { id: 'email', label: 'Notifications par Email', desc: 'Recevoir les alertes de nouveaux messages par mail.' },
                                    { id: 'push', label: 'Notifications Push', desc: 'Recevoir des notifications directement sur votre navigateur.' },
                                    { id: 'marketing', label: 'Offres Commerciales', desc: 'Être informé des nouveautés et promotions.' }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="max-w-md">
                                            <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationToggle(item.id)}
                                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications[item.id] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Appearance / Preferences */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apparence</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Personnalisez votre interface utilisateur.</p>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-3 flex items-center justify-center text-yellow-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">Clair</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-900 dark:bg-gray-800 shadow-sm mb-3 flex items-center justify-center text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">Sombre</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/50 overflow-hidden">
                            <div className="p-6 border-b border-red-100 dark:border-red-900/50">
                                <h2 className="text-xl font-bold text-red-700 dark:text-red-500">Zone de danger</h2>
                                <p className="text-sm text-red-600 dark:text-red-400 opacity-80">Actions irréversibles concernant votre compte.</p>
                            </div>
                            <div className="p-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Supprimer mon compte</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Une fois supprimé, toutes vos données seront effacées.</p>
                                </div>
                                <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all">
                                    Supprimer le compte
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
