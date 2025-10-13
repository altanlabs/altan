import { m } from 'framer-motion';
import React from 'react';

export const ProductShortcuts = ({ products, base, getProductStats, onNavigate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {products.map((product, index) => {
        const Icon = product.icon;
        return (
          <m.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={base ? { y: -4 } : {}}
            onClick={() => base && onNavigate?.(product.id === 'database' ? 'tables' : product.id)}
            className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 backdrop-blur-sm transition-all ${
              base ? 'cursor-pointer hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600' : 'opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={20} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {getProductStats(product.id)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
              </div>
            </div>
          </m.div>
        );
      })}
    </div>
  );
};
