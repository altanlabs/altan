import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * Component to automatically track page views
 * Place this component in your router to track all page changes
 */
export const PageTracker = () => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Extract page name from pathname
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.replace(/^\//, '').replace(/\//g, ' > ');
    
    // Track page view with additional context
    trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      full_url: window.location.href,
    });
  }, [location, trackPageView]);

  return null; // This component doesn't render anything
};

export default PageTracker;
