import { AnimatePresence, m } from "framer-motion";
import React, { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@lib/utils.ts";

interface Item {
  title: string | ReactNode;
  description: string | ReactNode;
  link: string;
}

interface HoverEffectProps {
  items: Item[];
  className?: string;
  layoutType?: 'row' | 'column' | 'grid';
  columns?: number | { [key: string]: number }; // For responsive grid columns
}

export const HoverEffect = ({
  items,
  className,
  layoutType = 'grid',
  columns = 3,
}: HoverEffectProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  let layoutClassName = '';

  if (layoutType === 'grid') {
    layoutClassName = 'grid';
    const columnsClassNames: string[] = [];

    if (typeof columns === 'number') {
      columnsClassNames.push(`grid-cols-${columns}`);
    } else if (typeof columns === 'object') {
      for (const breakpoint in columns) {
        const cols = columns[breakpoint];
        columnsClassNames.push(
          breakpoint === 'base'
            ? `grid-cols-${cols}`
            : `${breakpoint}:grid-cols-${cols}`
        );
      }
    }
    layoutClassName = cn(layoutClassName, ...columnsClassNames);
  } else if (layoutType === 'row') {
    layoutClassName = 'flex flex-row';
  } else if (layoutType === 'column') {
    layoutClassName = 'flex flex-col';
  }

  return (
    <div className={cn(layoutClassName, 'py-10', className)}>
      {items.map((item, idx) => (
        <Link
          to={item.link}
          key={item.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <m.span
                className="absolute inset-0 h-full w-full bg-neutral-200 block rounded-3xl dark:bg-slate-800/[0.8]"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent group-hover:border-slate-700 relative z-20 dark:border-white/[0.2] dark:bg-white",
        className
      )}
    >
      <div className="relative z-50 p-4">{children}</div>
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ className, children }: CardTitleProps) => {
  return (
    <h4 className={cn("font-bold tracking-wide", className)}>
      {children}
    </h4>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const CardDescription = ({
  className,
  children,
}: CardDescriptionProps) => {
  return (
    <p
      className={cn(
        "tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
