import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { useState, useMemo, useEffect, memo } from 'react';

import { cn } from '@lib/utils';

// import { Command, CommandInput, CommandList, CommandItem } from 'cmdk';
import IframeControls from './IframeControls';

const routes = ['/', '/dashboard', '/settings', '/analytics', '/editor'];

function InterfaceToolbar({
  interfaceId,
  iframeRef,
  chatIframeRef,
  repoName,
  deploymentUrl,
  isLoading,
  devMode,
  viewType,
  viewMode,
  setViewType,
  setViewMode,
  handleReload,
  setIsPublishDialogOpen,
  toggleDrawer,
  handleSettingsOpen,
  fatalError,
  setFatalError,
}) {
  // State for the selected route and input validity.
  const [selectedRoute, setSelectedRoute] = useState('/');
  const [inputValue, setInputValue] = useState('/');
  const [inputFocused, setInputFocused] = useState(false);

  // Base preview URL using the repository name.
  const basePreviewUrl = useMemo(() => `${repoName}.preview.altan.ai`, [repoName]);

  const isPreview = viewType === 'preview';

  // Build full preview URL with the selected route.
  const previewUrl = useMemo(
    () => `${basePreviewUrl}${selectedRoute?.length ? selectedRoute : '/'}`,
    [basePreviewUrl, selectedRoute],
  );

  // When the input loses focus, validate the route.
  useEffect(() => {
    if (!inputFocused) {
      if (!routes.includes(inputValue)) {
        setSelectedRoute('/');
        setInputValue('/');
      } else {
        setSelectedRoute(inputValue);
      }
    }
  }, [inputFocused, inputValue]);

  // Render the view mode toggle button (only icons on small screens).
  const renderViewToggle = (mode, icon, label) => (
    <button
      onClick={() => setViewType(mode)}
      title={label}
      className={cn(
        'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors focus:outline-none',
        viewType === mode
          ? 'bg-white dark:bg-black/20 text-black dark:text-white shadow-md dark:shadow-white/20'
          : 'hover:bg-white/20 dark:hover:bg-white/10 text-gray-600 dark:text-white',
      )}
    >
      <Icon
        icon={icon}
        className="w-5 h-5"
      />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <m.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
      className={cn(
        // Overall container with glassmorphism.
        'z-50 p-1 rounded-t-xl backdrop-blur-lg',
        'bg-white/80 dark:bg-[#070707]/40',
        'text-gray-800 dark:text-gray-100',
        // Responsive layout: on mobile stack sections, on desktop place them in one row.
        // "flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
        // Use CSS Grid to achieve the desired layout:
        // For mobile: two columns and arrange left and right on the top row, middle spanning both columns on second row.
        // For desktop (lg): three columns so all sections are in one row.
        'grid gap-2 grid-cols-2 lg:grid-cols-3',
      )}
    >
      {/* Left Section: Refresh button and, if in dev mode, preview/code toggles */}
      <div className="flex order-1 items-center gap-2 w-full md:w-auto">
        {devMode && (
          <div className="flex items-center gap-1">
            {renderViewToggle('preview', 'mdi:eye-outline', 'Preview')}
            {renderViewToggle('code', 'mdi:code-braces', 'Code')}
          </div>
        )}
      </div>
      {/* Middle Section: URL preview and change path input */}
      <div className="flex-1 order-3 col-span-2 lg:order-2 lg:col-span-1 flex items-center gap-1">
        {isPreview && (
          <>
            <IframeControls
              interfaceId={interfaceId}
              previewIframeRef={iframeRef}
              chatIframeRef={chatIframeRef}
              fatalError={fatalError}
              setFatalError={setFatalError}
            />
            <m.button
              onClick={handleReload}
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ repeat: isLoading ? Infinity : 0, duration: 1, ease: 'linear' }}
              className="p-2 rounded-full focus:outline-none hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300"
              title="Refresh"
            >
              <Icon
                icon="mdi:refresh"
                width="20"
                height="20"
              />
            </m.button>
            <a
              href={`https://${previewUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium whitespace-nowrap underline transition-colors hover:text-blue-500 dark:hover:text-blue-300 text-blue-600 dark:text-blue-400"
            >
              {basePreviewUrl}
            </a>
            {/* TODO: implement with real routes */}
            {/* <div className="relative flex-1">
                <Command className="w-full">
                  <CommandInput
                    placeholder="Change path..."
                    value={inputValue}
                    onValueChange={(val) => {
                      setInputFocused(true);
                      setInputValue(val);
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    className={cn(
                      "w-full px-3 py-1 rounded-full text-sm focus:outline-none",
                      "bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-gray-700",
                      "placeholder:text-gray-500 dark:placeholder:text-gray-500"
                    )}
                  />
                  {inputFocused && (
                    <CommandList
                      className={cn(
                        "absolute mt-1 w-full rounded-xl shadow-lg z-10 overflow-hidden",
                        "bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {routes.map((route) => (
                        <CommandItem
                          key={route}
                          // Use onMouseDown to prevent the blur event from clearing the value.
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setInputValue(route);
                            setSelectedRoute(route);
                            setInputFocused(false);
                          }}
                          className={cn(
                            "px-3 py-2 text-sm cursor-pointer transition-colors",
                            "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          {route}
                        </CommandItem>
                      ))}
                    </CommandList>
                  )}
                </Command>
              </div> */}
          </>
        )}
      </div>

      {/* Right Section: Other control buttons */}
      <div className="order-2 lg:order-3 flex items-center gap-2 w-full md:w-auto justify-end">
        {!!isPreview && (
          <button
            onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
            title="Toggle View Mode"
            className="p-2 rounded-full focus:outline-none hover:text-black text-gray-600 dark:text-gray-300 dark:hover:text-white"
          >
            <Icon
              icon={viewMode === 'desktop' ? 'material-symbols:smartphone' : 'mdi:desktop-mac'}
              width="20"
              height="20"
            />
          </button>
        )}

        {deploymentUrl && (
          <a
            href={deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
              'bg-white/30 dark:bg-[#1c1c1c]/60 hover:bg-white/20 dark:hover:bg-white/10',
            )}
          >
            <Icon
              icon="mdi:earth"
              className="w-5 h-5"
            />
            <span className="hidden md:inline">Domains</span>
          </a>
        )}

        <button
          onClick={toggleDrawer}
          title="History"
          className="p-2 rounded-full focus:outline-none hover:text-black text-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <Icon
            icon="mdi:history"
            width="20"
            height="20"
          />
        </button>

        <button
          onClick={handleSettingsOpen}
          title="Settings"
          className="p-2 rounded-full focus:outline-none hover:text-black text-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <Icon
            icon="mdi:cog"
            width="20"
            height="20"
          />
        </button>
      </div>
    </m.div>
  );
}

export default memo(InterfaceToolbar);
