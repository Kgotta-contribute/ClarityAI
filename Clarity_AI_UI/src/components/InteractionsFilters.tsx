
import React, { useState } from "react";

import { Button, DatePicker, Select } from "design-language";

import {

    FormatNowUTC,

    OffsetDaysUTC

} from "design-language/utilities/DateFunctions";

import { useTheme } from '../hooks/useTheme';

import { DATE_RANGES, CONVERSATION_RANGES, OLDEST_CONVERSATION, DATE_RANGE_OFFSETS } from '../constants/ui';

import './styles/index.css';

 

const { CUSTOM_RANGE, YESTERDAY, LAST_90_DAYS } = DATE_RANGES;

 

interface FilterState {

    convoDateValue: string;

    convoStartDateValue: string;

    convoEndDateValue: string;

    isResetDisable: boolean;

}

 

interface InteractionsFiltersProps {

    onFilterChange?: (filters: FilterState) => void;

}

 

const DEFAULT_FILTERS: FilterState = {

    convoDateValue: LAST_90_DAYS,

    convoStartDateValue: OffsetDaysUTC(FormatNowUTC(), -90),

    convoEndDateValue: FormatNowUTC(),

    isResetDisable: true

};

 

const InteractionsFilters: React.FC<InteractionsFiltersProps> = ({ onFilterChange }) => {

    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

    const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

 

    const { currentTheme } = useTheme();

 

    const convertToMMDDYYYY = (dateStr: string): string => {

        if (!dateStr) return dateStr;

        const d = new Date(dateStr);

        if (isNaN(d.getTime())) return dateStr;

        const mm = String(d.getMonth() + 1).padStart(2, '0');

        const dd = String(d.getDate()).padStart(2, '0');

        const yyyy = d.getFullYear();

        return `${mm}-${dd}-${yyyy}`;

    };

 

    const convertToYYYYMMDD = (dateStr: string): string => {

        if (!dateStr) return dateStr;

        const d = new Date(dateStr);

        if (isNaN(d.getTime())) {

            // Fallback for dd-mm-yyyy

            const parts = dateStr.split(/[-/]/);

            if (parts.length === 3 && parts[2].length === 4) {

                return `${parts[2]}-${parts[1]}-${parts[0]}`;

            }

            return dateStr;

        }

        const yyyy = d.getFullYear();

        const mm = String(d.getMonth() + 1).padStart(2, '0');

        const dd = String(d.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;

    };

 

    const handleReset = () => {

        setFilters(DEFAULT_FILTERS);

        setAppliedFilters(DEFAULT_FILTERS);

        onFilterChange?.(DEFAULT_FILTERS);

    };

 

    const handleApplyFilters = () => {

        setAppliedFilters(filters);

        onFilterChange?.(filters);

    };

 

    const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

 

    const handleDateRangeChange = (value: string) => {

        const newFilters = { ...filters, isResetDisable: false };

 

        const offset = DATE_RANGE_OFFSETS[value];

        if (offset !== undefined) {

            if (value === YESTERDAY) {

                newFilters.convoEndDateValue = OffsetDaysUTC(FormatNowUTC(), offset);

                newFilters.convoStartDateValue = OffsetDaysUTC(FormatNowUTC(), offset);

            } else {

                newFilters.convoEndDateValue = FormatNowUTC();

                newFilters.convoStartDateValue = OffsetDaysUTC(FormatNowUTC(), offset);

            }

        }

       

        newFilters.convoDateValue = value;

        setFilters(newFilters);

    };

 

    const background = currentTheme === 'dark' ? '#2d3748' : '#e6fffa';

 

    return (

        <div className="clarityai-sidebar filter-sidebar" style={{ background }}>

            <div style={{ padding: "1rem" }}>




                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    margin: '8px 0'
                }}>
                    <label style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#a0aec0' : '#718096' }}>
                        Start Date
                    </label>
                    <DatePicker
                        value={filters.convoStartDateValue}
                        onChange={(date: string) => {
                            const newFilters = {
                                ...filters,
                                convoDateValue: CUSTOM_RANGE,
                                convoStartDateValue: date,
                                isResetDisable: false
                            };
                            setFilters(newFilters);
                        }}
                        placeholder="Select start date"
                        style={{
                            backgroundColor: currentTheme === 'dark' ? '#2d3748' : '#ffffff',
                            color: currentTheme === 'dark' ? '#cdcdcd' : '#1a202c',
                            border: `1px solid ${currentTheme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                            borderRadius: '4px',
                            width: '100%'
                        }}
                    />
                    <label style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#a0aec0' : '#718096' }}>
                        End Date
                    </label>
                    <DatePicker
                        value={filters.convoEndDateValue}
                        onChange={(date: string) => {
                            const newFilters = {
                                ...filters,
                                convoDateValue: CUSTOM_RANGE,
                                convoEndDateValue: date,
                                isResetDisable: false
                            };
                            setFilters(newFilters);
                        }}
                        placeholder="Select end date"
                        style={{
                            backgroundColor: currentTheme === 'dark' ? '#2d3748' : '#ffffff',
                            color: currentTheme === 'dark' ? '#cdcdcd' : '#1a202c',
                            border: `1px solid ${currentTheme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                            borderRadius: '4px',
                            width: '100%'
                        }}
                    />
                </div>

 

                <Button

                    onClick={handleApplyFilters}

                    style={{

                        boxSizing: "border-box",

                        marginTop: "1rem",

                        width: "100%",

                        marginBottom: "0.5rem",

                        backgroundColor: hasUnappliedChanges ? '#4299e1' : undefined,

                        fontWeight: hasUnappliedChanges ? 'bold' : 'normal',

                    }}

                >

                    Apply Filter {hasUnappliedChanges ? '●' : ''}

                </Button>

 

                <Button

                    disabled={filters.isResetDisable}

                    onClick={handleReset}

                    style={{

                        boxSizing: "border-box",

                        width: "100%",

                    }}

                >

                    Reset Filters

                </Button>

            </div>

        </div>

    );

};

 

export default InteractionsFilters;

 

 

 