// Google Analytics utility for event and pageview tracking
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export function gtag(){
  // @ts-ignore
  window.dataLayer = window.dataLayer || [];
  // @ts-ignore
  window.dataLayer.push(arguments);
}

export function trackPageView(url: string) {
  gtag('event', 'page_view', {
    page_path: url,
  });
}

export function trackEvent({ action, category, label, value }: { action: string; category: string; label?: string; value?: number }) {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}
