import React, {useState, useEffect, useRef} from 'react';
import {useAuth} from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
    const {user, setUser} = useAuth();
    const [formData, setFormData] = useState({first_name: '', last_name: '', email: '', phone: ''});
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [message, setMessage] = useState({type: '', text: ''});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio_document: null,
                contract_document: null
            });
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({type: '', text: ''});

        const data = new FormData();
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }
        if (formData.bio_document) {
            data.append('bio_document', formData.bio_document);
        }
        if (formData.contract_document) {
            data.append('contract_document', formData.contract_document);
        }

        try {
            const response = await api.patch('auth/profile/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(response.data);
            setMessage({type: 'success', text: 'Profil mis à jour avec succès !'});
            // Reset avatar file state after successful upload
            setAvatarFile(null);
        } catch (error) {
            console.error(error);
            setMessage({type: 'error', text: 'Erreur lors de la mise à jour du profil.'});
        } finally {
            setLoading(false);
        }
    };

    if (!user) 
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Header Section with Gradient */}
                    <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-6 py-8 sm:px-8 sm:py-10 text-center relative">
                        <div className="absolute inset-0 bg-black opacity-5 pattern-grid-lg"></div>
                        {/* Subtle texture overlay if available, else ignored */}

                        <div className="relative z-10">
                            <div className="mx-auto h-32 w-32 relative group">
                                <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                                    {
                                    avatarPreview ? (
                                        <img src={avatarPreview}
                                            alt="Profile"
                                            className="h-full w-full object-cover"/>
                                    ) : (
                                        <span className="text-4xl font-bold text-primary-600">
                                            {
                                            formData.first_name ? formData.first_name[0].toUpperCase() : 'U'
                                        } </span>
                                    )
                                } </div>

                                {/* Edit Avatar Button */}
                                <button onClick={
                                        () => fileInputRef.current.click()
                                    }
                                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    title="Changer la photo">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                    </svg>
                                </button>
                                <input type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"/>
                            </div>

                            <h1 className="mt-4 text-3xl font-bold text-white tracking-tight">
                                {
                                formData.first_name
                            } {
                                formData.last_name
                            } </h1>
                            <p className="text-primary-100 font-medium">
                                {
                                user.email
                            }</p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        {
                        message.text && (
                            <div className={
                                `mb-8 p-4 rounded-xl flex items-center shadow-sm ${
                                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`
                            }>
                                {
                                message.type === 'success' ? (
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"/></svg>
                                ) : (
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                )
                            }
                                <span className="font-medium">
                                    {
                                    message.text
                                }</span>
                            </div>
                        )
                    }

                        <form onSubmit={handleSubmit}
                            className="space-y-8">
                            <div className="grid grid-cols-1 gap-y-8 gap-x-8 sm:grid-cols-2">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-primary-600">Prénom</label>
                                    <input name="first_name"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm hover:border-primary-300 hover:shadow-md"
                                        placeholder="Votre prénom"/>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-primary-600">Nom</label>
                                    <input name="last_name"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm hover:border-primary-300 hover:shadow-md"
                                        placeholder="Votre nom"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-8 gap-x-8 sm:grid-cols-2">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-primary-600">Email</label>
                                    <input type="email" name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm hover:border-primary-300 hover:shadow-md"
                                        placeholder="votre@email.com"/>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-primary-600">Téléphone</label>
                                    <input name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm hover:border-primary-300 hover:shadow-md"
                                        placeholder="+224 ..."/>
                                </div>
                            </div>

                            {/* Account Info Card */}
                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    </div>
                                    <div>
                                        <span className="text-sm text-indigo-500 font-semibold uppercase tracking-wider block">Rôle</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {
                                            user.is_demarcheur ? 'Démarcheur' : user.is_proprietaire ? 'Propriétaire' : 'Locataire'
                                        } </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 border-t sm:border-t-0 sm:border-l border-indigo-200 pt-4 sm:pt-0 sm:pl-6">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div>
                                        <span className="text-sm text-indigo-500 font-semibold uppercase tracking-wider block">Statut KYC</span>
                                        <span className={
                                            `inline-flex items-center mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                user.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : user.kyc_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                                            }`
                                        }>
                                            {
                                            user.kyc_status === 'VERIFIED' ? 'Vérifié' : user.kyc_status === 'PENDING' ? 'En Attente' : 'Non Vérifié'
                                        } </span>
                                    </div>
                                </div>
                            </div>

                            {/* KYC Documents Section */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Documents de Vérification (KYC)
                                </h3>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Pièce d'identité (PDF/Image)</label>
                                        <input 
                                            type="file" 
                                            name="bio_document"
                                            onChange={(e) => setFormData({...formData, bio_document: e.target.files[0]})}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
                                        />
                                        {user.bio_document && (
                                            <p className="text-xs text-green-600 flex items-center mt-1">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Document déjà envoyé
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Contrat signé (PDF/Image)</label>
                                        <input 
                                            type="file" 
                                            name="contract_document"
                                            onChange={(e) => setFormData({...formData, contract_document: e.target.files[0]})}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
                                        />
                                        {user.contract_document && (
                                            <p className="text-xs text-green-600 flex items-center mt-1">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Document déjà envoyé
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                    {
                                    loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mise à jour...
                                        </span>
                                    ) : 'Enregistrer les modifications'
                                } </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
