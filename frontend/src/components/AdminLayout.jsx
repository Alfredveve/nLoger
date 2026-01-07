import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Home, ClipboardList, 
  BarChart3, Settings, LogOut, Menu, X, ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const sidebarOpen = true;
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/admin-dashboard' },
    { name: 'Utilisateurs', icon: Users, path: '/admin-dashboard/users' },
    { name: 'Propriétés', icon: Home, path: '/admin-dashboard/properties' },
    { name: 'Mandats', icon: ClipboardList, path: '/admin-dashboard/mandates' },
    { name: 'Transactions', icon: ArrowRightLeft, path: '/admin-dashboard/transactions' },
    { name: 'Analytics', icon: BarChart3, path: '/admin-dashboard/analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden pt-16">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="shrink-0" size={20} />
                  {sidebarOpen && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={logout}
            className={`flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
