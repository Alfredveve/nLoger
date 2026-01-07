import React from 'react';

const DataTable = ({ columns, data, loading, pagination, onPageChange }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                  Aucune donnée trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} sur {pagination.totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
