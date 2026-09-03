
import React, { useState, useEffect, type ReactNode } from 'react';

import { themes, type ThemeContextType, type Themes } from '../constants/themes';

import { ThemeContext } from './createThemeContext';

 

interface ThemeProviderProps {

  children: ReactNode;

}

 

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {

  const [currentTheme, setCurrentTheme] = useState<string>(() => {

    const savedTheme = localStorage.getItem('clarity_theme');

    return savedTheme && themes[savedTheme as keyof Themes] ? savedTheme : 'dark';

  });

 

  useEffect(() => {

    const theme = themes[currentTheme as keyof Themes];

    const root = document.documentElement;

    const body = document.body;

 

    Object.entries(theme.colors).forEach(([key, value]) => {

      root.style.setProperty(`--color-${key}`, value);

    });

 

    body.style.backgroundColor = theme.colors.background;

    body.style.color = theme.colors.text;

    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

 

    // Remove existing theme classes

    body.className = body.className.replace(/theme-\w+/g, '').replace(/DarkMode|LightMode/g, '');

   

    // Add both custom theme class and design-language theme class

    body.classList.add(`theme-${currentTheme}`);

    body.classList.add(currentTheme === 'dark' ? 'DarkMode' : 'LightMode');

 

    root.style.backgroundColor = theme.colors.background;

    root.style.color = theme.colors.text;

 

    localStorage.setItem('clarity_theme', currentTheme);

  }, [currentTheme]);

 

  const toggleTheme = (): void => {

    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');

  };

 

  const setTheme = (themeName: string): void => {

    if (themes[themeName as keyof Themes]) {

      setCurrentTheme(themeName);

    }

  };

 

  const value: ThemeContextType = {

    currentTheme,

    theme: themes[currentTheme as keyof Themes],

    themes,

    toggleTheme,

    setTheme,

    isDark: currentTheme === 'dark',

    isLight: currentTheme === 'light'

  };

 

  return (

    <ThemeContext.Provider value={value}>

      {children}

    </ThemeContext.Provider>

  );

};

 

export default ThemeContext;

 

 

 