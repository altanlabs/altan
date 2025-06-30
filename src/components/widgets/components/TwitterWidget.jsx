import { Card, useTheme, Skeleton } from '@mui/material';
import React, { useEffect, useState, memo } from 'react';

const TwitterWidget = ({ tweetId }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const theme = useTheme();
  const themeMode = theme.palette.mode || 'dark';

  /**
   * TODO: fix the height of the tweet widget, the difference
   * bewtween the skeleton height and the actual height
   * messes up the virtualized list scroll
   */

  useEffect(() => {
    const scriptId = 'twitter-wjs';
    let script = document.getElementById(scriptId);

    const maybeLoadWidget = () => {
      // Check if the Twitter object and widgets are available before attempting to create a tweet
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.createTweet(
          tweetId,
          document.getElementById(`tweet-container-${tweetId}`),
          {
            conversation: 'none',
            cards: 'hidden',
            theme: themeMode,
          },
        ).then((el) => {
          if (el) {
            setIsReady(true);
          } else {
            setHasError(true); // The tweet could not be loaded (might not exist, etc.)
          }
        }).catch((error) => {
          console.error('Error creating tweet widget:', error);
          setHasError(true);
        });
      } else {
        // Retry loading the widget script
        loadTwitterWidgetScript();
      }
    };

    const loadTwitterWidgetScript = () => {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
      }

      script.onload = maybeLoadWidget;
      script.onerror = (error) => {
        console.error('Error loading Twitter script:', error);
        setHasError(true);
      };
    };

    maybeLoadWidget();

    return () => {
      if (script) {
        script.onload = null;
        script.onerror = null;
      }
    };
  }, [tweetId, themeMode]);

  if (hasError) {
    return (
      <Card sx={{ position: 'relative', height: '240px', minWidth: '300px' }}>
        <div>Error loading tweet. Please try again later.</div>
      </Card>
    );
  }

  return (
    <Card sx={{ position: 'relative', height: 'auto', height: '240px', minWidth: '300px', background: 'transparent' }}>
      {!isReady && <Skeleton variant="rectangular" width={300} height={240} />}
      <div id={`tweet-container-${tweetId}`} style={{ visibility: isReady ? 'visible' : 'hidden', maxHeight: '240px' }} />
    </Card>
  );
};

export default memo(TwitterWidget);
