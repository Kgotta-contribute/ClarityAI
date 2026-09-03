import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const renderIcon = (icon) => {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === 'object' && (icon.prefix || icon.iconName || icon.icon)) {
    return <FontAwesomeIcon icon={icon} />;
  }
  if (typeof icon === 'string') {
    return <i className={icon} />;
  }
  return null;
};

export const Tile = ({ children, hover, className = '', onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    className={`dl-tile ${hover ? 'dl-tile-hover' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Header = ({ icon, title, className = '', children }) => (
  <div className={`dl-header ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
    {icon && <span style={{ fontSize: '1.5rem', color: '#3182ce' }}>{renderIcon(icon)}</span>}
    {title && <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{title}</h1>}
    {children}
  </div>
);

export const Button = ({ children, onClick, disabled, className = '', variant = 'primary', size = 'medium', type = 'button', style }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
      borderRadius: '6px',
      border: variant === 'outline' ? '1px solid #3182ce' : 'none',
      background: variant === 'secondary' ? '#4a5568' : variant === 'outline' ? 'transparent' : variant === 'danger' ? '#e53e3e' : '#3182ce',
      color: '#ffffff',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'background 0.2s ease',
      ...style,
    }}
    className={`dl-button dl-button-${variant} ${className}`}
  >
    {children}
  </button>
);

export const IconButton = ({ icon, onClick, title, disabled, className = '', style }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    style={{
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.05)',
      color: '#e2e8f0',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
    className={`dl-icon-button ${className}`}
  >
    {renderIcon(icon)}
  </button>
);

export const TableBox = ({ header = [], data = [], pageSize = 10, onClick, className = '', children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={`dl-tablebox ${className}`} style={{ width: '100%', overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            {header.map((col, idx) => (
              <th key={idx} style={{ padding: '12px 16px', fontWeight: 600, color: '#94a3b8' }}>
                {typeof col === 'string' ? col : col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={header.length || 1} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                No records found
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: onClick ? 'pointer' : 'default' }}>
                {Array.isArray(row) ? row.map((cell, cIdx) => (
                  <td key={cIdx} onClick={() => onClick && onClick({ cellIndex: cIdx, rowIndex: (currentPage - 1) * pageSize + rIdx, row, headers: header.map(h => typeof h === 'string' ? h : h.name) })} style={{ padding: '12px 16px' }}>
                    {cell}
                  </td>
                )) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px', color: '#94a3b8' }}>
          <span>Page {currentPage} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="small" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
            <Button size="small" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export const ProgressBar = ({ value = 0, max = 100, className = '', style }) => (
  <div className={`dl-progressbar ${className}`} style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', ...style }}>
    <div style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%`, height: '100%', background: '#3182ce', transition: 'width 0.3s ease' }} />
  </div>
);

export const DatePicker = ({ value, onChange, placeholder = 'Select date', className = '', style }) => (
  <input
    type="date"
    value={value || ''}
    onChange={(e) => onChange && onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(15, 23, 42, 0.8)',
      color: '#e2e8f0',
      outline: 'none',
      ...style,
    }}
    className={`dl-datepicker ${className}`}
  />
);

export const Select = ({ value, onChange, options = [], placeholder = 'Select option', className = '', style }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange && onChange(e.target.value)}
    style={{
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(15, 23, 42, 0.8)',
      color: '#e2e8f0',
      outline: 'none',
      ...style,
    }}
    className={`dl-select ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((opt, idx) => (
      <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
        {typeof opt === 'object' ? opt.label : opt}
      </option>
    ))}
  </select>
);

export const FormatNowUTC = () => new Date().toISOString();

export const OffsetDaysUTC = (dateOrDays = 0, daysOffset = 0) => {
  let baseDate = new Date();
  let offset = 0;

  if (typeof dateOrDays === 'number') {
    offset = dateOrDays;
  } else if (typeof dateOrDays === 'string') {
    const parsed = new Date(dateOrDays);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  } else if (dateOrDays instanceof Date && !isNaN(dateOrDays.getTime())) {
    baseDate = new Date(dateOrDays.getTime());
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  } else {
    offset = typeof daysOffset === 'number' ? daysOffset : 0;
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  baseDate.setDate(baseDate.getDate() + offset);
  return isNaN(baseDate.getTime()) ? new Date().toISOString() : baseDate.toISOString();
};
