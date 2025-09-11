// Lightweight analytics helpers for GA4 and Meta Pixel with safe no-ops in dev
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
		fbq?: (...args: any[]) => void;
	}
}

type AnalyticsInit = {
	gaId?: string;
	fbPixelId?: string;
	debug?: boolean;
};

function ensureGaLoaded(gaId: string) {
	if (!window.dataLayer) {
		window.dataLayer = [];
	}
	if (!window.gtag) {
		// Inject GA script only once
		const existing = document.querySelector(
			'script[src^="https://www.googletagmanager.com/gtag/js"]',
		) as HTMLScriptElement | null;
		if (!existing) {
			const s = document.createElement('script');
			s.async = true;
			s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
				gaId,
			)}`;
			document.head.appendChild(s);
		}
		// Define gtag shim
		window.gtag = function gtag() {
			window.dataLayer!.push(arguments as unknown as any);
		} as any;
	}
	window.gtag('js', new Date());
	window.gtag('config', gaId);
}

function ensureFbqLoaded(pixelId: string) {
	if (!window.fbq) {
		(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
			if (f.fbq) return;
			n = f.fbq = function () {
				n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
			};
			if (!f._fbq) f._fbq = n;
			n.push = n;
			n.loaded = true;
			n.version = '2.0';
			n.queue = [];
			t = b.createElement(e);
			t.async = true;
			t.src = 'https://connect.facebook.net/en_US/fbevents.js';
			s = b.getElementsByTagName(e)[0];
			s.parentNode?.insertBefore(t, s);
		})(window, document, 'script', 0);
	}
	window.fbq('init', pixelId);
	window.fbq('track', 'PageView');
}

export function initAnalytics({ gaId, fbPixelId, debug }: AnalyticsInit) {
	try {
		if (gaId) ensureGaLoaded(gaId);
		if (fbPixelId) ensureFbqLoaded(fbPixelId);
		if (debug) {
			// eslint-disable-next-line no-console
			console.log('[analytics] init', { gaId: !!gaId, fbPixelId: !!fbPixelId });
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('[analytics] init error', e);
	}
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
	try {
		if (window.gtag) {
			window.gtag('event', eventName, params || {});
		}
		if (window.fbq) {
			// Map common GA4 events to Pixel
			switch (eventName) {
				case 'generate_lead':
					window.fbq('track', 'Lead', params || {});
					break;
				case 'begin_checkout':
					window.fbq('track', 'InitiateCheckout', params || {});
					break;
				case 'purchase':
					window.fbq('track', 'Purchase', params || {});
					break;
				default:
					window.fbq('trackCustom', eventName, params || {});
			}
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('[analytics] track error', e);
	}
}

export function trackLead(params?: Record<string, any>) {
	trackEvent('generate_lead', params);
}

export function trackBeginCheckout(params?: { value?: number; currency?: string; cta_variant?: string }) {
	trackEvent('begin_checkout', params);
}

export function trackPurchase(params?: { value?: number; currency?: string; transaction_id?: string }) {
	trackEvent('purchase', params);
}


