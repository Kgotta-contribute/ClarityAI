export interface ThemeColors {

  primary: string;

  secondary: string;

  tertiary: string;

  accent: string;

  text: string;

  textSecondary: string;

  textMuted: string;

  border: string;

  success: string;

  warning: string;

  error: string;

  background: string;

  surface: string;

  surfaceHover: string;

}

 

export interface Theme {

  name: string;

  colors: ThemeColors;

}

 

export interface Themes {

  dark: Theme;

  light: Theme;

}

 

export interface ThemeContextType {

  currentTheme: string;

  theme: Theme;

  themes: Themes;

  toggleTheme: () => void;

  setTheme: (themeName: string) => void;

  isDark: boolean;

  isLight: boolean;

}

 

export const themes: Themes = {

  dark: {

    name: 'dark',

    colors: {

      primary: '#1a202c',

      secondary: '#2d3748',

      tertiary: '#4a5568',

      accent: '#4299e1',

      text: '#ffffff',

      textSecondary: '#a0aec0',

      textMuted: '#718096',

      border: '#4a5568',

      success: '#38a169',

      warning: '#d69e2e',

      error: '#e53e3e',

      background: '#1a202c',

      surface: '#2d3748',

      surfaceHover: '#4a5568'

    }

  },

  light: {

    name: 'light',

    colors: {

      primary: '#ffffff',

      secondary: '#f7fafc',

      tertiary: '#edf2f7',

      accent: '#3182ce',

      text: '#1a202c',

      textSecondary: '#4a5568',

      textMuted: '#718096',

      border: '#e2e8f0',

      success: '#38a169',

      warning: '#d69e2e',

      error: '#e53e3e',

      background: '#ffffff',

      surface: '#f7fafc',

      surfaceHover: '#edf2f7'

    }

  }

};

 

 