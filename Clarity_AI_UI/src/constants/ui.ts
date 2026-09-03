export const PAGINATION = {

  DEFAULT_PAGE_SIZE: 15,

  DEFAULT_LIMIT: 100,

} as const;

 

export const POLLING_INTERVALS = {

  USER_INFO_UPDATE: 5000,

  STATUS_CHECK: 3000,

} as const;

 

export const DATE_RANGES = {

  CUSTOM_RANGE: 'Custom Range',

  YESTERDAY: 'Yesterday',

  LAST_7_DAYS: 'Last 7 Days',

  LAST_30_DAYS: 'Last 30 Days',

  LAST_60_DAYS: 'Last 60 Days',

  LAST_90_DAYS: 'Last 90 Days',

} as const;

 

export const DATE_RANGE_OFFSETS: Record<string, number> = {

  [DATE_RANGES.YESTERDAY]: -1,

  [DATE_RANGES.LAST_7_DAYS]: -7,

  [DATE_RANGES.LAST_30_DAYS]: -30,

  [DATE_RANGES.LAST_60_DAYS]: -60,

  [DATE_RANGES.LAST_90_DAYS]: -90,

};

 

export const CONVERSATION_RANGES: string[] = [

  DATE_RANGES.CUSTOM_RANGE,

  DATE_RANGES.YESTERDAY,

  DATE_RANGES.LAST_7_DAYS,

  DATE_RANGES.LAST_30_DAYS,

  DATE_RANGES.LAST_60_DAYS,

  DATE_RANGES.LAST_90_DAYS,

];

 

export const OLDEST_CONVERSATION = '2024-08-01';

 

export const NAV_ITEMS = ['Home', 'Audio Files', 'Transcription', 'Chat', 'Settings'] as const;

 

 

 

 