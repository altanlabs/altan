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
            className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 p-5 backdrop-blur-sm transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ${
              base ? 'cursor-pointer hover:shadow-2xl hover:border-border' : 'opacity-60 cursor-not-allowed'
            } ring-1 ring-white/5`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-background/60 to-muted/50 border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Icon size={20} className="text-foreground/80" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {getProductStats(product.id)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
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


