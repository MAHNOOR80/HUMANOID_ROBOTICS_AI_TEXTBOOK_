import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Complete Guide to Building Intelligent Machines that Live in the Real World',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://humanoid-robotics-ai-textbook.vercel.app/',
  baseUrl: '/',

  organizationName: 'facebook',
  projectName: 'docusaurus',

  // Ignore broken links temporarily (optional)
  onBrokenLinks: 'throw',

  customFields: {
    // Railway production backend - change to 'http://localhost:8000' for local development
    apiBaseUrl: process.env.API_BASE_URL || 'https://backend-production-e37e.up.railway.app',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/MAHNOOR80/HUMANOID_ROBOTICS_AI_TEXTBOOK_.git',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        // Removed blog section completely to avoid /blog broken links
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI Textbook',
      logo: {
        alt: 'Physical AI & Humanoid Robotics Logo',
        src: 'img/logo.svg',
      },
      hideOnScroll: false,
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Chapters',
          position: 'left',
          items: [
            {
              label: 'Chapter 1: Introduction to Physical AI',
              to: '/docs/chapter-1',
            },
            {
              label: 'Chapter 2: The Robotic Nervous System',
              to: '/docs/chapter-2',
            },
            {
              label: 'Chapter 3: The Digital Twin',
              to: '/docs/chapter-3',
            },
            {
              label: 'Chapter 4: The AI-Robot Brain',
              to: '/docs/chapter-4',
            },
            {
              label: 'Chapter 5: Vision-Language-Action',
              to: '/docs/chapter-5',
            },
            {
              label: 'Chapter 6: Humanoid Robot Development',
              to: '/docs/chapter-6',
            },
            {
              label: 'Chapter 7: Conversational Robotics',
              to: '/docs/chapter-7',
            },
            {
              label: 'Chapter 8: Capstone Project',
              to: '/docs/chapter-8',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          items: [
            {
              label: 'Ask AI Assistant',
              to: '/docs/chapter-1',
            },
            {
              label: 'Getting Started',
              to: '/docs/chapter-1',
            },
          ],
        },
        {
          href: 'https://github.com/MAHNOOR80/PHYSICAL_AI_HUMANOID_ROBOTICS_TEXTBOOK.git',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Introduction',
              to: '/docs/chapter-1',
            },
            {
              label: 'All Chapters',
              to: '/docs/chapter-1',
            },
            {
              label: 'Getting Started',
              to: '/docs/chapter-1',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'AI Assistant',
              to: '/docs/chapter-1',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/MAHNOOR80/PHYSICAL_AI_HUMANOID_ROBOTICS_TEXTBOOK.git',
            },
            {
              label: 'Report Issues',
              href: 'https://github.com/MAHNOOR80/PHYSICAL_AI_HUMANOID_ROBOTICS_TEXTBOOK.git/issues',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discussions',
              href: 'https://github.com/MAHNOOR80/HUMANOID_ROBOTICS_AI_TEXTBOOK_.git',
            },
            {
              label: 'Contributors',
              href: 'https://www.linkedin.com/in/mahnoor-naveed-4b1550367/',
            },
            {
              label: 'License',
              href: 'https://github.com/MAHNOOR80/HUMANOID_ROBOTICS_AI_TEXTBOOK_.git',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/MAHNOOR80/HUMANOID_ROBOTICS_AI_TEXTBOOK_.git',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/mahnoor-naveed-4b1550367/',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with ❤️ and Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
