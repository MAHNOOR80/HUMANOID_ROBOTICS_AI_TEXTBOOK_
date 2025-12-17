/**
 * Configuration utility to access environment-specific settings
 * Accesses Docusaurus customFields from the site config
 */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

interface SiteConfig {
  customFields?: {
    apiBaseUrl?: string;
  };
}

declare global {
  interface Window {
    docusaurus?: {
      siteConfig?: SiteConfig;
    };
  }
}

/**
 * Get the API base URL from Docusaurus config
 * Falls back to Railway production URL if not configured
 */
export const getApiBaseUrl = (): string => {
  if (ExecutionEnvironment.canUseDOM) {
    // Try multiple ways to access the config for robustness
    let apiUrl: string | undefined;

    // Method 1: Access via window.docusaurus
    try {
      apiUrl = window.docusaurus?.siteConfig?.customFields?.apiBaseUrl as string;
    } catch (e) {
      console.warn('Could not access window.docusaurus.siteConfig.customFields:', e);
    }

    // Method 2: Check if customFields is directly on siteConfig
    if (!apiUrl) {
      try {
        const siteConfig = window.docusaurus?.siteConfig;
        if (siteConfig && 'customFields' in siteConfig) {
          apiUrl = (siteConfig.customFields as any)?.apiBaseUrl;
        }
      } catch (e) {
        console.warn('Could not access customFields:', e);
      }
    }

    // Use Railway production URL as fallback instead of localhost
    const finalUrl = apiUrl || 'https://backend-production-e37e.up.railway.app';

    console.log('🔗 API Base URL:', finalUrl);
    console.log('🔍 Config source:', apiUrl ? 'siteConfig.customFields' : 'fallback');

    return finalUrl;
  }

  // SSR environment - use Railway production URL
  return 'https://backend-production-e37e.up.railway.app';
};
