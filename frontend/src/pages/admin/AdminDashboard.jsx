import React, { useState, useEffect } from 'react';
import { 
  Users, Home, ClipboardList, CheckCircle2, 
  Clock, AlertCircle, TrendingUp 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('admin/stats/'),
          api.get('admin/analytics/')
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const userRoleData = analytics ? [
    { name: 'Démarcheurs', value: analytics.users_by_role.demarcheurs },
    { name: 'Propriétaires', value: analytics.users_by_role.proprietaires },
    { name: 'Locataires', value: analytics.users_by_role.locataires },
  ] : [];

  const propertyTypeData = analytics ? analytics.properties_by_type.map(item => ({
    name: item.property_type.replace('_', ' '),
    count: item.count
  })) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tableau de bord</h1>
        <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble de la plateforme NLoger</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Utilisateurs" 
          value={stats?.total_users || 0} 
          icon={Users} 
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <StatsCard 
          title="Propriétés" 
          value={stats?.total_properties || 0} 
          icon={Home} 
          color="green"
        />
        <StatsCard 
          title="Mandats Actifs" 
          value={stats?.total_mandates || 0} 
          icon={ClipboardList} 
          color="purple"
        />
        <StatsCard 
          title="Demandes KYC" 
          value={stats?.pending_kyc || 0} 
          icon={Clock} 
          color="orange"
          trend="up"
          trendValue="5"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties by Type Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Propriétés par Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Répartition des Utilisateurs</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {userRoleData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
