import { useEffect } from 'react';
import { OnBrowserLocationTracker, OnBrowserLocationTrackerConfig } from './OnBrowserLocationTracker';
import React from 'react';

const withLocationTracking = (
  WrappedComponent: React.ComponentType,
  config: OnBrowserLocationTrackerConfig,
): React.FC => {
  const LocationTrackingHOC: React.FC = (props) => {
    const tracker = new OnBrowserLocationTracker(config);

    useEffect(() => {
      // Make sure we're in the browser context
      if (typeof window !== 'undefined') {
        // Track the initial page load
        const initialLocation = tracker.getCurrentLocation();
        if (initialLocation) {
          tracker.trackVisit(initialLocation);
        }

        // Event listeners for browser navigation changes
        const handlePopState = () => {
          const location = tracker.getCurrentLocation();
          if (location) {
            tracker.trackVisit(location);
          }
        };

        const handleHashChange = () => {
          const location = tracker.getCurrentLocation();
          if (location) {
            tracker.trackVisit(location);
          }
        };

        // Add event listeners for navigation changes
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup listeners on component unmount
        return () => {
          window.removeEventListener('popstate', handlePopState);
          window.removeEventListener('hashchange', handleHashChange);
        };
      }
      return () => {}; // Return an empty cleanup function for server-side rendering
    }, []);

    return <WrappedComponent {...props} />;
  };

  LocationTrackingHOC.displayName = `withLocationTracking(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return LocationTrackingHOC;
};

export default withLocationTracking;
