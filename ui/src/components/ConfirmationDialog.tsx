
import React, { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faTrash, faExclamationTriangle, faInfoCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { ThemeContext } from '../contexts/createThemeContext';

import './styles/ConfirmationDialog.css';

 

interface ConfirmationDialogProps {

  isOpen: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm: () => void;

  onCancel: () => void;

  type?: 'danger' | 'warning' | 'info';

}

 

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({

  isOpen,

  title,

  message,

  confirmText = 'Confirm',

  cancelText = 'Cancel',

  onConfirm,

  onCancel,

  type = 'danger',

}) => {

  const themeContext = useContext(ThemeContext);

  const currentTheme = themeContext?.currentTheme ?? 'dark';

 

  if (!isOpen) return null;

 

  const getIconForType = () => {

    switch (type) {

      case 'danger':

        return faTrash;

      case 'warning':

        return faExclamationTriangle;

      case 'info':

        return faInfoCircle;

      default:

        return faQuestionCircle;

    }

  };

 

  const getColorForType = () => {

    switch (type) {

      case 'danger':

        return '#dc3545';

      case 'warning':

        return '#ff9800';

      case 'info':

        return '#2196f3';

      default:

        return '#6c757d';

    }

  };

 

  return (

    <div className="confirmation-dialog-overlay" onClick={onCancel}>

      <div

        className={`confirmation-dialog ${currentTheme}`}

        onClick={(e) => e.stopPropagation()}

        style={{

          backgroundColor: currentTheme === 'light' ? '#ffffff' : '#2d3748',

          color: currentTheme === 'light' ? '#1a202c' : '#e2e8f0',

        }}

      >

        <div className="confirmation-dialog-header">

          <FontAwesomeIcon

            icon={getIconForType()}

            className="confirmation-dialog-icon"

            style={{ fontSize: '32px', color: getColorForType() }}

          />

          <h2 className="confirmation-dialog-title">{title}</h2>

        </div>

 

        <div className="confirmation-dialog-body">

          <p className="confirmation-dialog-message">{message}</p>

        </div>

 

        <div className="confirmation-dialog-footer">

          <button

            className="confirmation-dialog-button cancel-button"

            onClick={onCancel}

            style={{

              backgroundColor: currentTheme === 'light' ? '#e2e8f0' : '#4a5568',

              color: currentTheme === 'light' ? '#1a202c' : '#e2e8f0',

            }}

          >

            {cancelText}

          </button>

          <button

            className="confirmation-dialog-button confirm-button"

            onClick={onConfirm}

            style={{

              backgroundColor: getColorForType(),

              color: '#ffffff',

            }}

          >

            {confirmText}

          </button>

        </div>

      </div>

    </div>

  );

};

 

export default ConfirmationDialog;

 

 

 

 