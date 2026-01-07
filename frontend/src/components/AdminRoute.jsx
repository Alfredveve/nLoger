import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté et est un staff/admin
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.is_staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Accès Refusé</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retourner en arrière
        </button>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
