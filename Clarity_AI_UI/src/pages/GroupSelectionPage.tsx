
import React, { useState } from 'react';

import { Tile } from 'design-language';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faArrowRight, faCog } from '@fortawesome/free-solid-svg-icons';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import authService from './../services/authService';

import MainContent from './../components/MainContent';

import { BUSINESS_GROUP_ICONS } from '../constants/icons';

import type { User, BusinessGroup } from '../types';

import '../components/styles/index.css';

 

interface GroupSelectionPageProps {

  user: User;

  onGroupSelected: (groupId: string) => void;

}

 

const GroupSelectionPage: React.FC<GroupSelectionPageProps> = ({ user, onGroupSelected }) => {

  const [availableGroups] = useState<BusinessGroup[]>(() => authService.getAvailableGroups());

 

  const handleGroupSelection = (groupId: string): void => {

    try {

      const result = authService.selectGroup(groupId);

      if (result.success) {

        onGroupSelected(groupId);

      }

    } catch (error) {

      console.error('Group selection failed:', error);

    }

  };

 

  const getIconForGroup = (iconName: string): IconDefinition => {

    return BUSINESS_GROUP_ICONS[iconName] || faCog;

  };

 

  return (

    <div className="group-selection-page">

      <MainContent

        user={user}

        accessibleLinks={[]}

      />

 

      <div className="group-selection-content">

        <div className="selection-container">

          <div className="selection-header">

            <h1>Select Your Business Group</h1>

            <p>Please select your business group to access Clarity AI:</p>

          </div>

 

          <div className="groups-grid">

            {availableGroups.map((group) => (

              <Tile

                key={group.id}

                hover

                className="group-selection-tile"

                onClick={() => handleGroupSelection(group.id)}

              >

                <div className="group-tile-content">

                  <div className="group-icon" style={{ color: group.color }}>

                    <FontAwesomeIcon icon={getIconForGroup(group.icon)} />

                  </div>

                  <div className="group-info">

                    <h3>{group.name}</h3>

                    <p>{group.description}</p>

                  </div>

                  <div className="group-arrow">

                    <FontAwesomeIcon icon={faArrowRight} />

                  </div>

                </div>

              </Tile>

            ))}

          </div>

 

          <div className="selection-footer">

            <p>Select your business group to access the appropriate Clarity AI features.</p>

            <button

              className="logout-btn"

              onClick={() => {

                authService.logout();

                window.location.reload();

              }}

            >

              Sign Out

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

 

export default GroupSelectionPage;

 

 