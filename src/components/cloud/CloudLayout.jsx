import React, { memo, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import CloudSidebar from './CloudSidebar.jsx';
import CloudTable from './CloudTable.jsx';
import CloudTableTabs from './CloudTableTabs.jsx';
import CloudLogs from './sections/CloudLogs.jsx';
import CloudOverview from './sections/CloudOverview.jsx';
import CloudPlaceholder from './sections/CloudPlaceholder.jsx';
import CloudServices from './sections/CloudServices.jsx';
import CloudStorage from './sections/CloudStorage.jsx';
import CloudUsers from './sections/CloudUsers.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import { selectCloudById, deleteTable } from '../../redux/slices/cloud';
import { useSelector, dispatch } from '../../redux/store.ts';
import SQLTerminal from './sections/overview/components/SQLTerminal.jsx';

function CloudLayout({
  tableId,
  activeSection,
}) {
  const { cloudId, altanerId, componentId } = useParams();
  const history = useHistory();
  const isMobile = useResponsive('down', 'md');
  const cloud = useSelector((state) => selectCloudById(state, cloudId));

  // Auto-navigate to first table if on tables section without tableId
  useEffect(() => {
    if (activeSection === 'tables' && !tableId && cloud?.tables?.items) {
      const publicTables = cloud.tables.items.filter(t => t.schema === 'public');
      if (publicTables.length > 0) {
        history.replace(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${publicTables[0].id}`);
      }
    }
  }, [activeSection, tableId, cloud?.tables?.items, history, altanerId, componentId, cloudId]);

  // Handle section navigation
  const handleSectionChange = (section) => {
    if (section === 'overview') {
      history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}`);
    } else if (section === 'tables') {
      // Auto-navigate to first public table if no tableId
      if (!tableId && cloud?.tables?.items) {
        const publicTables = cloud.tables.items.filter(t => t.schema === 'public');
        if (publicTables.length > 0) {
          history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${publicTables[0].id}`);
          return;
        }
      }
      // Keep current tableId if we have one
      if (tableId) {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${tableId}`);
      } else {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables`);
      }
    } else {
      history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/${section}`);
    }
  };

  // Handle table navigation
  const handleTableChange = (newTableId) => {
    history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${newTableId}`);
  };

  const handleDeleteTable = async (tableIdToDelete) => {
    await dispatch(deleteTable(cloudId, tableIdToDelete));
    // If deleting current table, navigate to first remaining table
    if (tableIdToDelete === tableId && cloud?.tables?.items) {
      const remainingTables = cloud.tables.items.filter(t => t.id !== tableIdToDelete && t.schema === 'public');
      if (remainingTables.length > 0) {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}/tables/${remainingTables[0].id}`);
      } else {
        history.push(`/project/${altanerId}/c/${componentId}/cloud/${cloudId}`);
      }
    }
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="flex-1 overflow-auto min-w-0 max-w-full w-full">
            <CloudOverview onNavigate={handleSectionChange} />
          </div>
        );
      case 'tables':
        return (
          <>
            <div className="shrink-0 min-w-0 w-full box-border overflow-hidden">
              <CloudTableTabs
                activeTableId={tableId}
                onTableChange={handleTableChange}
                onDeleteTable={handleDeleteTable}
              />
            </div>
            <div className="flex-1 relative overflow-hidden min-w-0 w-full">
              {tableId ? (
                <CloudTable tableId={tableId} />
              ) : (
                <CloudPlaceholder
                  title="No Table Selected"
                  description="Select a table from above to view its data."
                />
              )}
            </div>
          </>
        );
      case 'sql-editor':
        return <SQLTerminal baseId={cloudId} />;
      case 'users':
        return <CloudUsers onNavigate={handleSectionChange} />;
      case 'storage':
        return <CloudStorage onNavigate={handleSectionChange} />;
      case 'services':
        return <CloudServices />;
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
        <div className="flex-1 flex flex-col overflow-auto min-w-0 w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default memo(CloudLayout);
