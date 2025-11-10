import { m } from 'framer-motion';
import { memo, type ReactElement, useCallback, useState, useEffect } from 'react';

import { optimai_pods } from '@utils/axios';
import { fToNow } from '@utils/formatTime';

// Declare global variables for TypeScript
declare const console: Console;

interface PublicAppCardProps {
  id: string;
  name: string;
  icon_url?: string;
  last_modified?: string;
  components?:
    | {
        items: Array<{
          name: string;
          type: string;
          icon?: string;
          params?: {
            id?: string;
          };
        }>;
      }
    | Array<{
        name: string;
        type: string;
        icon?: string;
        params?: {
          id?: string;
        };
      }>;
}

interface PreviewResponse {
  url: string;
}

function PublicAppCard({
  id,
  name,
  icon_url,
  components,
  last_modified,
}: PublicAppCardProps): ReactElement {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line no-undef
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Support both old (components.items) and new (components as array) backend structure
  const componentsArray = Array.isArray(components) ? components : components?.items || [];
  const interfaceComponent = componentsArray.find((item) => item.type === 'interface');

  useEffect(() => {
    const fetchPreview = async (): Promise<void> => {
      if (interfaceComponent?.params?.id) {
        try {
          const response = await optimai_pods.get<PreviewResponse>(
            `/interfaces/${interfaceComponent.params.id}/preview`,
          );
          setPreviewUrl(response.data.url === 'None' ? null : response.data.url);
        } catch (error) {
          // Silently handle error in production
          if (import.meta.env.MODE !== 'production') {
            console.error('Error fetching preview:', error);
          }
        }
      }
      setIsLoading(false);
    };

    void fetchPreview();
  }, [interfaceComponent?.params?.id]);

  // Open in a new tab instead of using history.push
  const onClickApp = useCallback((): void => {
    window.open(`/remix/${id}`, '_blank', 'noopener,noreferrer');
  }, [id]);

  const finalImageUrl = previewUrl || icon_url || '/placeholder-image.png';

  const motionProps = isSafari
    ? { initial: { y: 20, scale: 0.95 }, animate: { scale: 1, y: 0 } }
    : { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 } };

  return (
    <>
      <m.button
        onClick={onClickApp}
        {...motionProps}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          willChange: 'opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)',
        }}
        className="block w-full text-left group relative rounded-xl overflow-hidden bg-white dark:bg-[#111113] border border-grey-400/40 dark:border-[#1e1f22] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_30px_-5px] hover:shadow-purple-500/30 hover:border-purple-500/50"
      >
        <div
          className="w-full h-48 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          style={!isLoading ? { backgroundImage: `url(${finalImageUrl})` } : undefined}
        />
        <div className="p-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-medium text-black/60 dark:text-white/80 group-hover:text-black dark:group-hover:text-white truncate transition-colors duration-300">
              {name}
            </h3>
            {last_modified && (
              <span className="text-xs text-black/50 dark:text-white/30 whitespace-nowrap">
                {fToNow(last_modified)}
              </span>
            )}
          </div>
        </div>
      </m.button>
    </>
  );
}

export default memo(PublicAppCard);