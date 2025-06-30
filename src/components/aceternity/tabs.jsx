import { m } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@lib/utils.ts';

export const FadeInDiv = ({ className, tabs, hovering }) => {
  const isActive = (tab) => {
    return tab.value === tabs[0].value;
  };
  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <m.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering === tab.title ? idx * -50 : idx * -30,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn('w-full h-full absolute top-0 left-0', className)}
        >
          {tab.content}
        </m.div>
      ))}
    </div>
  );
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  // activeTabClassName,
  // tabClassName,
  contentClassName,
}) => {
  const [active, setActive] = useState(propTabs[0]);
  const [tabs, setTabs] = useState(propTabs);

  const moveSelectedTabToTop = (idx) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:400px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full gap-2',
          containerClassName,
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(tab.title)}
            onMouseLeave={() => setHovering(null)}
            className={cn(
              'relative px-4 py-2 rounded-full transition-all duration-300',
              'bg-gray-900/[.7] dark:bg-gray-100/[.7] text-gray-100 dark:text-gray-900 hover:opacity-90 hover:dark:opacity-80 shadow-md',
            )}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active?.value === tab.value && (
              <m.div
                layoutId="clickedbutton"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className={cn(
                  'absolute inset-0 bg-gray-800/[.7] dark:bg-gray-300/[.7] rounded-full backdrop-blur-md',
                )}
              />
            )}

            <span className="relative block w-fit text-sm">{tab.title}</span>
          </button>
        ))}
      </div>

      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active?.value}
        hovering={hovering}
        className={cn('mt-10', contentClassName)}
      />
    </>
  );
};
