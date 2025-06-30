import { useState, useCallback, useMemo, useEffect } from 'react';

import { getTimestamp } from '../../helpers/utils';

const useSATabs = () => {
  const [allTabs, setAllTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);

  // Efficiently add a new tab
  const addTab = useCallback((newTab) => {
    setAllTabs((prevTabs) => [...prevTabs, newTab]);
    setSelectedTab(newTab);
  }, []);

  const setTab = useCallback((index, properties) => {
    setAllTabs((prevTabs) =>
      prevTabs.map((tab, i) => (i === index ? { ...tab, ...properties } : tab)),
    );
  }, []);

  const selectedTabIndex = useMemo(
    () => allTabs.findIndex((t) => t.id === selectedTab?.id),
    [allTabs, selectedTab?.id],
  );

  // Efficiently remove a tab by index
  const removeTab = useCallback(
    (tabIndex) => {
      setAllTabs((prevTabs) => {
        const filteredTabs = [...prevTabs.slice(0, tabIndex), ...prevTabs.slice(tabIndex + 1)];
        if (tabIndex === selectedTabIndex) {
          setSelectedTab((prevSelectedTab) => {
            const previousSelectedIndex = prevTabs.findIndex((t) => t.id === prevSelectedTab.id);
            let index = 0;
            if (previousSelectedIndex > 0) {
              index = previousSelectedIndex - 1;
            }
            return filteredTabs[index];
          });
        }
        return filteredTabs;
      });
    },
    [selectedTabIndex],
  );

  useEffect(() => {
    if (!allTabs.length) {
      const newTab = { label: 'New Tab', id: getTimestamp() };
      addTab(newTab);
      setSelectedTab(newTab);
    }
  }, [allTabs.length]);

  return useMemo(
    () => ({
      allTabs,
      selectedTab,
      addTab,
      removeTab,
      setSelectedTab,
      setTab,
      selectedTabIndex,
    }),
    [allTabs, selectedTab, addTab, removeTab, setTab, selectedTabIndex],
  );
};

export default useSATabs;
