import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
