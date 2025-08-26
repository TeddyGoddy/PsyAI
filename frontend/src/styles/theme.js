export const theme = {
  colors: {
    primary: '#1a365d',
    secondary: '#f7fafc',
    accent: '#4fd1c7',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    background: '#ffffff',
    surface: '#ffffff',
    sidebar: '#1a365d',
    text: {
      primary: '#2d3748',
      secondary: '#718096',
      light: '#a0aec0',
      inverse: '#ffffff'
    },
    medical: {
      primary: '#1a365d',
      secondary: '#2c5282',
      accent: '#4fd1c7',
      background: '#f7fafc',
      surface: '#ffffff'
    },
    neutral: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923'
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#a0aec0'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
    lg: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
    xl: '0 8px 32px 0 rgba(0, 0, 0, 0.16)',
    inner: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    sidebar: '2px 0 8px 0 rgba(0, 0, 0, 0.05)'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em'
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.025em'
    }
  },
  animations: {
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px'
  }
};

export default theme;
