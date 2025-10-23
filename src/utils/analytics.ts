/**
 * Analytics utility for tracking user interactions
 * Can be extended to integrate with Google Analytics, Mixpanel, etc.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Track a user event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event);
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Send to other analytics services
  // TODO: Add integration with other analytics providers
}

/**
 * Track activity view
 */
export function trackActivityView(activityId: string, activityName: string): void {
  trackEvent('activity_view', {
    activity_id: activityId,
    activity_name: activityName,
  });
}

/**
 * Track activity favorite toggle
 */
export function trackActivityFavorite(activityId: string, isFavorite: boolean): void {
  trackEvent('activity_favorite', {
    activity_id: activityId,
    is_favorite: isFavorite,
  });
}

/**
 * Track filter usage
 */
export function trackFilterUsage(filterType: string, filterValue: string): void {
  trackEvent('filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultCount: number): void {
  trackEvent('search', {
    query,
    result_count: resultCount,
  });
}

/**
 * Track view mode change
 */
export function trackViewModeChange(viewMode: 'grid' | 'map'): void {
  trackEvent('view_mode_changed', {
    view_mode: viewMode,
  });
}

/**
 * Initialize analytics
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(..._args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
}

