/**
 * Creating a sidebar enables you to:
 * - create an ordered group of docs
 * - render a sidebar for each doc of that group
 * - provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 *
 * Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Primary textbook sidebar for Physical AI & Humanoid Robotics
  textbookSidebar: [
    {
      type: 'category',
      label: 'Physical AI & Humanoid Robotics',
      collapsed: false,
      items: [
        'chapter-1',
        'chapter-2',
        'chapter-3',
        'chapter-4',
        'chapter-5',
        'chapter-6',
        'chapter-7',
        'chapter-8',
      ],
    },
  ],
};

module.exports = sidebars;
