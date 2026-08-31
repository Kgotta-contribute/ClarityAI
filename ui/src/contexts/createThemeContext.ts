
import { createContext } from 'react';

import type { ThemeContextType } from '../constants/themes';

 

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

 

 

 