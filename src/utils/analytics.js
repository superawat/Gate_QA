export const GA_MEASUREMENT_ID = 'G-L9J7GVZ63S';

// Log a page view with a specific title, but keeping the path to just the pathname 
// (avoiding ?question= / filters exploding the URL)
export const pageview = (title) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
            page_title: title,
            page_location: window.location.origin + window.location.pathname,
            page_path: window.location.pathname
        });
    }
};

// Log a specific custom event
export const trackEvent = (eventName, params = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};
