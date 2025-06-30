import { IconButton, Typography, Tab, Tooltip, Stack, Tabs } from '@mui/material';
import React, { memo, useCallback, createContext, useContext, useMemo } from 'react';

import { cn } from '@lib/utils';

// import { Swiper, SwiperSlide } from 'swiper/react';
// import { EffectFade, Mousewheel } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/effect-fade';
import Iconify from '../../../../components/iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';
import useSATabs from '../external/hooks/useSATabs';
import { getTimestamp } from '../helpers/utils';

// const mousewheel = {
//   forceToAxis: true,
//   thresholdDelta: 5
// };

const MultiTabContext = createContext(null);

export const useMultiTab = () => useContext(MultiTabContext);

// const getDefaultValues = (allProperties, toolParameters) => {
//   const defaultValues = {};

//   Object.entries(allProperties).forEach(([key, schema]) => {
//     const defaultValue = (!!schema.default && !schema['x-extra']) ? schema.default : null;
//     defaultValues[key] = toolParameters[key] || defaultValue;
//   });

//   return defaultValues;
// };

const MultiTabProvider = ({ children }) => {
  // const theme = useTheme();
  // const [swiper, setSwiper] = useState(null);
  const {
    addTab,
    // selectedTab,
    selectedTabIndex,
    allTabs,
    setSelectedTab,
    removeTab,
    setTab,
  } = useSATabs();

  // Efficiently handle tab changes
  const handleChange = useCallback(
    (event, newValue) => {
      setSelectedTab(allTabs[newValue]);
    },
    [setSelectedTab, allTabs],
  );

  // const handleSwiperIndexChange = useCallback((sw) => {
  //   const newActiveIndex = sw.activeIndex;
  //   if (selectedTab?.index !== newActiveIndex) {
  //     setSelectedTab(allTabs[newActiveIndex]);
  //   }
  // }, [selectedTab, allTabs, setSelectedTab]);

  // useEffect(() => {
  //   if (!!swiper && !!selectedTab) {
  //     swiper.slideTo(allTabs.findIndex(t => t.id === selectedTab.id));
  //   }
  // }, [selectedTab]);

  const onClickAddTab = useCallback(
    () => addTab({ label: 'New Tab', id: getTimestamp() }),
    [addTab],
  );

  const memoized = useMemo(
    () => ({
      addTab,
      setTab,
    }),
    [addTab, setTab],
  );

  return (
    <MultiTabContext.Provider value={memoized}>
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* <AppBar
          position="relative"
          elevation={5}
          className="flex flex-row justify-left bg-transparent items-center"
          // sx={{
          //   display: 'flex',
          //   flexDirection: 'row',
          //   alignItems: 'center',
          //   justifyContent: 'left',
          //   backgroundColor: 'transparent',
          //   borderRadius: '20px 20px 0px 0px',
          //   paddingX: 2
          // }}
        > */}
        <div className="flex flex-row items-center justify-start bg-transparent rounded-t-lg px-2 shadow-md">
          <Tabs
            value={selectedTabIndex}
            onChange={handleChange}
            indicatorColor="none"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="external-sa-tabs"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: '35px',
              height: '35px',
              '& .MuiTabs-scrollButtons': {
                width: 25,
                height: 25,
              },
              '& .MuiTabs-root': {
                backgroundColor: 'transparent',
              },
              '& .MuiTab-root': {
                width: '100%',
                minHeight: '35px',
                height: '35px',
                minWidth: '150px',
                marginRight: 0,
                marginLeft: 0,
              },
              '& .MuiTab-root:not(:last-of-type)': {
                marginRight: 0,
                marginLeft: 0,
              },
            }}
          >
            {allTabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Tooltip title={!!tab.tooltip ? tab.tooltip : null}>
                    <Stack
                      direction="row"
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      className="px-2 py-1"
                    >
                      <div className="flex items-center space-x-2">
                        {tab.icon ? <IconRenderer icon={tab.icon} /> : null}
                        <Typography
                          variant="inherit"
                          noWrap
                          className="text-gray-800 dark:text-gray-200 text-sm max-w-[150px]"
                        >
                          {tab.label}
                        </Typography>
                      </div>
                      <Iconify
                        icon="mdi:close"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(index);
                        }}
                        className="w-4 h-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition"
                      />
                    </Stack>
                  </Tooltip>
                }
                sx={{
                  ...(selectedTabIndex === index && {
                    borderRadius: '20px 20px 0px 0px',
                  }),
                }}
                className={cn(
                  'relative flex-1 text-center px-2 min-w-fit',
                  selectedTabIndex === index && 'bg-gray-700 dark:bg-gray-800',
                  selectedTabIndex !== index &&
                    selectedTabIndex + 1 !== index &&
                    !!index &&
                    "before:content-[''] before:absolute before:border-l before:border-gray-300 dark:before:border-gray-600 before:h-1/2 before:left-0 before:top-1/4",
                )}
              />
            ))}
          </Tabs>
          <IconButton
            className="text-black dark:text-white"
            onClick={onClickAddTab}
          >
            <Iconify icon="mdi:plus" />
          </IconButton>
        </div>
        <div className="flex-1 w-full h-full overflow-hidden">
          {allTabs.map((_, index) => (
            <div
              key={index}
              className={`flex w-full h-full overflow-hidden bg-[#F5F5F5] dark:bg-[#121212] ${
                selectedTabIndex === index ? 'block' : 'hidden'
              }`}
            >
              {React.cloneElement(children, { index })}
            </div>
          ))}
        </div>
      </div>
      {/* {children} */}
    </MultiTabContext.Provider>
  );
};

export default memo(MultiTabProvider);

{
  /* <Swiper
key={`swiper-${theme.palette.mode}`}
direction='horizontal'
onSwiper={setSwiper}
onTransitionEnd={handleSwiperIndexChange}
// mousewheel={mousewheel}
// speed={1}
// modules={[EffectFade, Mousewheel]}
// effect="fade"
// simulateTouch={!isMobile()}
// className='absolute top-[40px] left-0 right-0 bottom-0 w-full overflow-x-hidden overflow-y-hidden'
className='flex w-full h-full overflow-x-hidden overflow-y-hidden'
>
{
  allTabs.map((_, index) => (
    <SwiperSlide
      key={index}
      className=''
    >
      {React.cloneElement(children, { index })}
    </SwiperSlide>
  ))
}
</Swiper> */
}
