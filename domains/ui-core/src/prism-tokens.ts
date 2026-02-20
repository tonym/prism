import type { PrismTheme, ThemeOverride } from './theme/types.js';

export const prismCoreThemeTokens: PrismTheme = {
  color: {
    primary: '#3A6FD8',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D7E3FF',
    onPrimaryContainer: '#001B4E',
    secondary: '#4E5E7C',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D6E3FF',
    onSecondaryContainer: '#091B36',
    tertiary: '#645B8E',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E8DEFF',
    onTertiaryContainer: '#1F173C',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: '#FBF8FF',
    onBackground: '#1A1B1F',
    surface: '#FBF8FF',
    onSurface: '#1A1B1F',
    surfaceVariant: '#E1E2EC',
    onSurfaceVariant: '#44474F',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F5F3FA',
    surfaceContainer: '#EFEDF4',
    surfaceContainerHigh: '#EAE7EF',
    surfaceContainerHighest: '#E4E1E9',
    surfaceBright: '#FBF8FF',
    surfaceDim: '#DCD9E1',
    outline: '#74777F',
    outlineVariant: '#C4C6D0',
    inverseSurface: '#2F3035',
    inverseOnSurface: '#F1EFF6',
    inversePrimary: '#AEC6FF',
    shadow: '#000000',
    scrim: '#000000'
  },
  typography: {
    display: {
      large: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '3.5625rem',
        fontWeight: 400,
        lineHeight: '4rem',
        letterSpacing: '-0.015625rem'
      },
      medium: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '2.8125rem',
        fontWeight: 400,
        lineHeight: '3.25rem',
        letterSpacing: '0rem'
      },
      small: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '2.25rem',
        fontWeight: 400,
        lineHeight: '2.75rem',
        letterSpacing: '0rem'
      }
    },
    headline: {
      large: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '2rem',
        fontWeight: 400,
        lineHeight: '2.5rem',
        letterSpacing: '0rem'
      },
      medium: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '1.75rem',
        fontWeight: 400,
        lineHeight: '2.25rem',
        letterSpacing: '0rem'
      },
      small: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '1.5rem',
        fontWeight: 400,
        lineHeight: '2rem',
        letterSpacing: '0rem'
      }
    },
    title: {
      large: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '1.375rem',
        fontWeight: 400,
        lineHeight: '1.75rem',
        letterSpacing: '0rem'
      },
      medium: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: '1.5rem',
        letterSpacing: '0.009375rem'
      },
      small: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: '1.25rem',
        letterSpacing: '0.00625rem'
      }
    },
    body: {
      large: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: '1.5rem',
        letterSpacing: '0.03125rem'
      },
      medium: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.25rem',
        letterSpacing: '0.015625rem'
      },
      small: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1rem',
        letterSpacing: '0.025rem'
      }
    },
    label: {
      large: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: '1.25rem',
        letterSpacing: '0.00625rem'
      },
      medium: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '1rem',
        letterSpacing: '0.03125rem'
      },
      small: {
        fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
        fontSize: '0.6875rem',
        fontWeight: 500,
        lineHeight: '1rem',
        letterSpacing: '0.03125rem'
      }
    }
  },
  shape: {
    none: '0px',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '28px',
    full: '9999px'
  },
  elevation: {
    level0: '0',
    level1: '1',
    level2: '2',
    level3: '3',
    level4: '4',
    level5: '5'
  }
};

export const prismDefaultThemeTokens: ThemeOverride = {
  color: {
    primary: '#0057D9',
    secondary: '#196A62',
    tertiary: '#705C9B',
    surfaceContainer: '#ECE8F3'
  },
  typography: {
    display: {
      large: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      medium: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      small: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      }
    },
    headline: {
      large: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      medium: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      small: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      }
    },
    title: {
      large: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      medium: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      small: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      }
    },
    body: {
      large: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      medium: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      small: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      }
    },
    label: {
      large: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      medium: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      },
      small: {
        fontFamily: '"Public Sans", "Segoe UI", sans-serif'
      }
    }
  }
};

export const prismOverlayThemeTokens: ThemeOverride = {};

export const prismTokens = {
  coreTheme: prismCoreThemeTokens,
  defaultTheme: prismDefaultThemeTokens,
  overlayTheme: prismOverlayThemeTokens
} as const;
