export const COLORS = {

  PRIMARY_BLUE: '#4299e1',

  LIGHT_BLUE: '#63b3ed',

  CYAN: '#73caf6',

  SUCCESS: '#4caf50',

  SUCCESS_GREEN: '#90EE90',

  ERROR: '#e53e3e',

  WARNING: '#d69e2e',

  TEXT_PRIMARY: '#cdcdcd',

  TEXT_SECONDARY: '#a0aec0',

  TEXT_MUTED: '#718096',

  TEXT_DARK: '#1a202c',

  BG_DARK: '#1a202c',

  BG_SURFACE: '#2d3748',

  BG_SECONDARY: '#1a1f3a',

  BG_LIGHT: '#e0f2fe',

  BORDER_DARK: '#4a5568',

  BORDER_LIGHT: '#e2e8f0',

  CHAT_SELF: '#4299e1',

  CHAT_SPECIAL: '#805ad5',

  CHAT_DEFAULT: '#2d3748',

  UPLOADING: '#4a90d9',

  COMPLETED: '#4caf50',

  FAILED: '#f44336',

  PENDING: '#666',

} as const;

 

export type ColorKey = keyof typeof COLORS;

 

 

 

 