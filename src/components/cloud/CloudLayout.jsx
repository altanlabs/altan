import React, { memo } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import CloudSidebar from './CloudSidebar.jsx';
import CloudTable from './CloudTable.jsx';
import CloudAuth from './sections/CloudAuth.jsx';
import CloudFunctions from './sections/CloudFunctions.jsx';
import CloudLogs from './sections/CloudLogs.jsx';
import CloudOverview from './sections/CloudOverview.jsx';
import CloudPlaceholder from './sections/CloudPlaceholder.jsx';
import CloudStorage from './sections/CloudStorage.jsx';
import CloudUsers from './sections/CloudUsers.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import SQLTerminal from '../databases/sql/SQLTerminal.jsx';

function CloudLayout({
  tableId,
  activeSection,
}) {
  const { cloudId, altanerId, componentId } = useParams();
  const history = useHistory();
  const isMobile = useResponsive('down', 'md');

  // Handle section navigation
  const handleSectionChange = (section) => {
    if (section === 'overview') {
      history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}`);
    } else if (section === 'tables') {
      // Keep current tableId if navigating to tables section
      if (tableId) {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${tableId}`);
      } else {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables`);
      }
    } else {
      history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/${section}`);
    }
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <CloudOverview onNavigate={handleSectionChange} />;
      case 'tables':
        return tableId ? (
          <CloudTable tableId={tableId} />
        ) : (
          <CloudPlaceholder
            title="No Table Selected"
            description="Select a table from the sidebar to view its data."
          />
        );
      case 'sql-editor':
        return <SQLTerminal baseId={cloudId} />;
      case 'users':
        return <CloudUsers onNavigate={handleSectionChange} />;
      case 'auth':
        return <CloudAuth onNavigate={handleSectionChange} />;
      case 'storage':
        return <CloudStorage onNavigate={handleSectionChange} />;
      case 'services':
        return <CloudFunctions />;
      case 'realtime':
        return <CloudPlaceholder title="Realtime" description="Subscribe to database changes in real-time with WebSocket connections." />;
      case 'logs':
        return <CloudLogs />;
      default:
        return <CloudOverview onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className={`w-full h-full relative overflow-hidden ${isMobile ? '' : 'pb-2 px-2'}`}>
      <div className={`flex flex-row h-full overflow-hidden ${isMobile ? '' : 'border border-border rounded-xl'}`}>
        <CloudSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          open={!isMobile}
        />
        <div className="flex-1 flex flex-col overflow-auto min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default memo(CloudLayout);
