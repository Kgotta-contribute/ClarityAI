
declare module 'design-language' {

  import { ReactNode, MouseEventHandler, CSSProperties } from 'react';

  export interface ElevanceLogoProps {

    className?: string;

    style?: CSSProperties;

  }

 

  export interface ElevanceHeaderProps {

    children?: ReactNode;

    title?: ReactNode;

    userSpace?: ReactNode;

    onThemeChange?: (theme: string) => void;

    className?: string;

  }

 

  export interface IconButtonProps {

    icon: any; // FontAwesome icon

    onClick?: MouseEventHandler<HTMLButtonElement>;

    title?: string;

    style?: CSSProperties;

    className?: string;

  }

  export const ElevanceLogo: React.FC<ElevanceLogoProps>;

  export const ElevanceHeader: React.FC<ElevanceHeaderProps>;

  export const IconButton: React.FC<IconButtonProps>;

  export interface TileProps {

    children?: ReactNode;

    hover?: boolean;

    cover?: boolean;

    mode?: 'metric' | string;

    className?: string;

    onClick?: MouseEventHandler<HTMLDivElement>;

    style?: CSSProperties;

  }

 

  export interface ButtonProps {

    children?: ReactNode;

    onClick?: MouseEventHandler<HTMLButtonElement>;

    disabled?: boolean;

    className?: string;

    type?: 'button' | 'submit' | 'reset';

    variant?: string;

    icon?: any; // FontAwesome icon

    style?: CSSProperties;

  }

 

  export interface SelectProps {

    value?: string;

    onChange?: ((value: string) => void) | ((index: number) => void);

    options?: Array<{ label: string; value: string }> | string[];

    placeholder?: string;

    className?: string;

    defaultSelectedIndexes?: number[];

    label?: string;

    noFooter?: boolean;

    onClear?: () => void;

    reset?: boolean;

    style?: CSSProperties;

    inputProps?: { style?: CSSProperties };

    bare?: boolean;

    filter?: boolean;

  }

 

  export interface DatePickerProps {

   

    value?: string;

    onChange?: ((date: string) => void) | ((dates: string[]) => void);

    onDateClick?: (selectedDate: string, dateRange?: string[]) => void;

    placeholder?: string;

    className?: string;

    style?: CSSProperties;

    type?: string;

    compact?: boolean;

    dateRange?: string[];

    disabled?: boolean;

    disabledBeforeAfter?: string[];

    format?: 'mm-dd-yyyy' | 'yyyy-mm-dd';

    utc?: boolean;

    startDateInputProps?: {label?: string, style?: CSSProperties; noFooter?: boolean };

    endDateInputProps?: {label?: string, style?: CSSProperties; noFooter?: boolean };

    containerProps?: { style?: CSSProperties };

  }

 

  export interface TableBoxProps {

    children?: ReactNode;

    className?: string;

    header?: any[];

    data?: any[][];

    pageSize?: number;

    onClick?: (clickData: { cellIndex: number; rowIndex: number; row: any[]; headers: string[] }) => void;

    onSort?: (sortData: { index: number; direction: 'asc' | 'desc' }) => void;

    loading?: boolean;

    downloadFileName?: string;

    sortIndex?: number | null;

  }

 

  export interface InputProps {

    type?: string;

    value?: string;

    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    placeholder?: string;

    className?: string;

    disabled?: boolean;

  }

 

  export interface HeaderProps {

    children?: ReactNode;

    className?: string;

    style?: CSSProperties;

    icon?: any;

    title?: string;

  }

 

  export interface IconBoxProps {

    children?: ReactNode;

    className?: string;

    style?: CSSProperties;

  }

 

  export interface WaveFormPlayerProps {

    audioUrl?: string;

    className?: string;

    onPlay?: () => void;

    onPause?: () => void;

    waveActive?: boolean;

    ref?: any;

    zoom?: boolean;

    controls?: boolean;

    src?: string;

    containerStyles?: { width?: number };

    onTimeUpdate?: (e: any, time: number) => void;

    onLoadedMetadata?: (e: any) => void;

    playerOptions?: {

      zoomLevels?: number[];

      overview?: any;

      zoomview?: any;

      webAudio?: any;

    };

  }

 

  export interface ProgressBarProps {

    darkColor1?: string;

    darkColor2?: string;

    label?: string | React.ReactNode;

    lightColor1?: string;

    lightColor2?: string;

    percent?: number;

    style?: CSSProperties;

    width?: string;

  }

 

  export const ElevanceLogo: React.FC<ElevanceLogoProps>;

  export const ElevanceHeader: React.FC<ElevanceHeaderProps>;

  export const IconButton: React.FC<IconButtonProps>;

  export const Tile: React.FC<TileProps>;

  export const Button: React.FC<ButtonProps>;

  export const Select: React.FC<SelectProps>;

  export const DatePicker: React.FC<DatePickerProps>;

  export const TableBox: React.FC<TableBoxProps>;

  export const Input: React.FC<InputProps>;

  export const Header: React.FC<HeaderProps>;

  export const IconBox: React.FC<IconBoxProps>;

  export const WaveFormPlayer: React.FC<WaveFormPlayerProps>;

  export const ProgressBar: React.FC<ProgressBarProps>;

}

 

declare module 'design-language/colors' {

  export const COLOR: {

    [key: string]: string;

  };

}

 

declare module 'design-language/utilities/DateFunctions' {

  export function FormatNowUTC(): string;

  export function OffsetDaysUTC(date: string, days: number): string;

  export function FormatDateUTC(date: string): string;

  export function FormattedDateToNativeDate(date: string): Date;

}

 

 

 