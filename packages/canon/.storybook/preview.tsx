import React from 'react';
import type { Preview, ReactRenderer } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// Storybook specific styles
import '../docs/components/styles.css';

// Canon specific styles
import '../src/css/core.css';
import '../src/css/components.css';

// Custom themes
import './themes/backstage.css';
import { ThemeProvider } from '../src/theme/context';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Core Concepts', 'Components'],
      },
    },
    viewport: {
      viewports: {
        small: {
          name: 'Small',
          styles: {
            width: '640px',
            height: '100%',
          },
        },
        medium: {
          name: 'Medium',
          styles: {
            width: '768px',
            height: '100%',
          },
        },
        large: {
          name: 'Large',
          styles: {
            width: '1024px',
            height: '100%',
          },
        },
        xlarge: {
          name: 'XLarge',
          styles: {
            width: '1280px',
            height: '100%',
          },
        },
        '2xl': {
          name: '2XL',
          styles: {
            width: '1536px',
            height: '100%',
          },
        },
      },
      defaultViewport: 'small',
    },
  },
  decorators: [
    withThemeByDataAttribute<ReactRenderer>({
      themes: {
        Light: 'light',
        Dark: 'dark',
        'Backstage Light': 'backstage-light',
        'Backstage Dark': 'backstage-dark',
      },
      defaultTheme: 'Light',
    }),
    Story => {
      document.body.style.backgroundColor = 'var(--canon-background)';

      const docsStoryElements = document.getElementsByClassName('docs-story');
      Array.from(docsStoryElements).forEach(element => {
        (element as HTMLElement).style.backgroundColor =
          'var(--canon-background)';
      });

      return (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
