/**
 * React hook to access API configuration from Docusaurus context
 * This is the recommended way to access customFields in React components
 */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface CustomFields {
  apiBaseUrl?: string;
}

export const useApiConfig = () => {
  const { siteConfig } = useDocusaurusContext();
  const customFields = siteConfig.customFields as CustomFields;

  // Use Railway production URL as default fallback
  const apiBaseUrl = customFields?.apiBaseUrl || 'https://backend-production-e37e.up.railway.app';

  return {
    apiBaseUrl,
  };
};
