import { useContext } from 'react';

import { ThemeContext } from '../contexts/createThemeContext';

import type { ThemeContextType } from '../constants/themes';

 

export const useTheme = (): ThemeContextType => {

  const context = useContext(ThemeContext);

  if (!context) {

    throw new Error('useTheme must be used within a ThemeProvider');

  }

  return context;

}

 

 

 