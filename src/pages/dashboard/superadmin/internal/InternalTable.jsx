import { Stack, Autocomplete, TextField, IconButton, Tooltip } from '@mui/material';
import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';

import InternalTableFilterPopover from './InternalTableFilterPopover.jsx';
import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import useResponsive from '../../../../hooks/useResponsive';
import { selectAccountId } from '../../../../redux/slices/general';
import { getTable } from '../../../../redux/slices/superadmin';
import { dispatch, useSelector } from '../../../../redux/store';
import { useMultiTab } from '../providers/MultiTabProvider.jsx';
import FormFields from '../tables/FormFields.jsx';
import TableComponent from '../tables/TableComponent.jsx';

const allTables = [
  'Interface',
  'Deployment',
  'Commit',
  'InterfaceDomain',
  'Account',
  'AccountFile',
  'Action',
  'ActionExecution',
  'ActionResourceTypeRelationship',
  'ActionType',
  'Address',
  'Agent',
  'AgentCommand',
  'Aggregator',
  'Altaner',
  'AltanerComponent',
  'AltanerTrigger',
  'Database',
  'Table',
  'Field',
  'View',
  'Annotation',
  'APIToken',
  'Attribute',
  'AttributePermission',
  'Authentication',
  'BusinessCategory',
  'CalendarEvent',
  'Catalog',
  'CatalogAttribute',
  'Chunk',
  'Command',
  'Company',
  'Connection',
  'ConnectionType',
  'Department',
  'DepartmentType',
  'DevAppHook',
  'Email',
  'EmailSubscription',
  'Employee',
  'EmployeeType',
  'ExternalApp',
  'ExternalDevApp',
  'Field',
  'File',
  'FlowExecution',
  'Form',
  'FormResponse',
  'Gate',
  'Guest',
  'Internal',
  'Invitation',
  'Iterator',
  'Layout',
  'LayoutSection',
  'LLMConfig',
  'Location',
  'Media',
  'Media3D',
  'Member',
  'MemberAttribute',
  'Message',
  'MessageMedia',
  'MessageReaction',
  'MessageWidget',
  'Module',
  'Note',
  'Notification',
  'Order',
  'OrderItem',
  'OrderStatusHistory',
  'Organisation',
  'OrganisationUser',
  'Payment',
  'Payout',
  'Permission',
  'Person',
  'Phone',
  'Product',
  'ProductAttribute',
  'ProductCategory',
  'ProductKnowledge',
  'Repeater',
  'Request',
  'Resource',
  'ResourceRelationship',
  'ResourceType',
  'ResourceTypeRelationship',
  'Role',
  'RolePermission',
  'Room',
  'RoomEvent',
  'RoomMember',
  'RoomPolicy',
  'Router',
  'RouteCondition',
  'Search',
  'Section',
  'SectionWidget',
  'Session',
  'Social',
  'Space',
  'SpaceCommand',
  'SpaceKnowledge',
  'SpaceLink',
  'SpaceResource',
  'SpaceSubscription',
  'SpaceTool',
  'SpaceWidget',
  'Subscription',
  'SubscriptionPlan',
  'SubscriptionPlanBilling',
  'SubscriptionPlanGroup',
  'SuperAdmin',
  'Task',
  'TaskExecution',
  'Template',
  'TemplateVersion',
  'ClonedTemplate',
  'Thread',
  'ThreadEvent',
  'ThreadMedia',
  'ThreadRead',
  'ThreadSpaceBreadcrumb',
  'Tool',
  'Trigger',
  'UseCase',
  'UseCaseTranslation',
  'User',
  'UserNotification',
  'UserPermission',
  'UserRole',
  'UserVerification',
  'UTM',
  'VariantOption',
  'VariationType',
  'Voice',
  'Webhook',
  'WebhookEvent',
  'WebhookEventType',
  'WebhookSubscription',
  'WebsiteProxy',
  'Widget',
  'WidgetAttribute',
  'WidgetMedia',
  'WidgetRelationship',
  'Workflow',
  'CreditTransaction',
];

const nonSuperAdminTableSet = new Set([
  'AccountFile',
  'ActionExecution',
  'AgentCommand',
  'Altaner',
  'AltanerComponent',
  'AltanerTrigger',
  'APIToken',
  'Catalog',
  'CatalogAttribute',
  'ExternalDevApp',
  'ExternalApp',
  'Form',
  'FormResponse',
  'FlowExecution',
  'Gate',
  'Guest',
  'Message',
  'Media',
  'Media3D',
  'MessageMedia',
  'Module',
  'Note',
  'Notification',
  'Order',
  'OrderItem',
  'OrderStatusHistory',
  'Organisation',
  'OrganisationUser',
  'Payment',
  'Payout',
  'Permission',
  'Product',
  'ProductAttribute',
  'ProductCategory',
  'ProductKnowledge',
  'Role',
  'RolePermission',
  'Room',
  'RoomEvent',
  'RoomMember',
  'RoomPolicy',
  'SubscriptionPlan',
  'SubscriptionPlanBilling',
  'SubscriptionPlanGroup',
  'TaskExecution',
  'ClonedTemplate',
  'Thread',
  'ThreadEvent',
  'ThreadMedia',
  'ThreadRead',
  'ThreadSpaceBreadcrumb',
  'Tool',
  'VariantOption',
  'VariationType',
  'Voice',
  'WebhookEvent',
  'WebhookEventType',
  'WebhookSubscription',
  'WebsiteProxy',
  'Widget',
  'Workflow',
]);

const InternalTable = ({ index, isSuperAdmin = true }) => {
  const accountId = useSelector(selectAccountId);
  const isSmallScreen = useResponsive('down', 'md');
  const [filter, setFilter] = useState(null);
  const [table, setTable] = useState(null);
  const [mustReload, setMustReload] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { setTab } = useMultiTab();
  const tables = useMemo(
    () =>
      isSuperAdmin ? allTables : allTables.filter((table) => nonSuperAdminTableSet.has(table)),
    [isSuperAdmin],
  );

  const handleFetchData = () => {
    // console.log("Fetching data...")
    setIsLoading(true);
    dispatch(getTable(table, isSuperAdmin))
      .then((data) => setData(data.result))
      .catch(() => enqueueSnackbar('There was an error fetching the data.', { variant: 'error' }))
      .finally(() => setIsLoading(false));
  };

  const switchTable = useCallback((newValue) => {
    setFilter(null);
    setTable(newValue);
  }, []);

  const onReload = useCallback(() => setMustReload((prev) => prev + 1), []);

  const onCreate = useCallback(() => {
    setIsCreateOpen(true);
  }, [setIsCreateOpen]);

  const onEdit = useCallback(
    (row) => {
      setEditingRow(row.id);
      setTempRowData(row);
    },
    [setEditingRow, setTempRowData],
  );

  const onReset = useCallback(() => {
    setEditingRow(null);
    setTempRowData({});
    setIsCreateOpen(false);
  }, [setEditingRow, setTempRowData, setIsCreateOpen]);

  useEffect(() => {
    if (table) {
      handleFetchData();
    }
  }, [table, mustReload]);

  const formFieldsVisible = !!editingRow || isCreateOpen;

  // console.log("table", table);

  useEffect(() => {
    if (!table) return; // Ensure there's at least an app selected

    // Update the tab
    setTab(index, {
      icon: isLoading
        ? 'svg-spinners:blocks-shuffle-3'
        : formFieldsVisible
          ? 'stash:asterisk-duotone'
          : null,
      label: table,
      tooltip: `${table} ${isLoading ? '(loading data...)' : formFieldsVisible ? '(editing...)' : ''}`,
    });
  }, [table, isLoading, formFieldsVisible]);

  const onChange = useCallback((event, newValue) => switchTable(newValue), [switchTable]);
  const clearData = useCallback(() => setData([]), []);

  return (
    <>
      <Stack
        padding={1}
        width="100%"
        height="100%"
        direction="row"
        spacing={1}
      >
        <div className="flex grow h-full w-full flex-col gap-[5px]">
          <div className="flex w-full max-h-full flex-row gap-[4px]">
            <Autocomplete
              size="small"
              id="combo-box-demo"
              options={tables.sort()}
              className="w-[300px]"
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  label="Select a table"
                />
              )}
              value={table}
              onChange={onChange}
            />
            {!!table && (
              <>
                <Tooltip
                  arrow
                  title={`Reload ${table} data`}
                >
                  <IconButton
                    onClick={onReload}
                    size="small"
                  >
                    <Iconify
                      icon="mdi:refresh"
                      width={25}
                    />
                  </IconButton>
                </Tooltip>
                <InternalTableFilterPopover
                  table={table}
                  filter={filter}
                  setFilter={setFilter}
                  // onSearch={}
                />
                <Tooltip
                  arrow
                  title={`Create new ${table}`}
                >
                  <IconButton
                    onClick={onCreate}
                    size="small"
                  >
                    <Iconify
                      icon="mdi:plus"
                      width={25}
                    />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
          <TableComponent
            table={table}
            data={data}
            clearData={clearData}
            handleFetchData={handleFetchData}
            editingRow={editingRow}
            onEdit={onEdit}
          />
        </div>
        {!isSmallScreen && !!formFieldsVisible && (
          <FormFields
            className="flex flex-col h-full w-2/5"
            table={table}
            data={tempRowData}
            editingRow={editingRow}
            onReset={onReset}
            isSuperAdmin={isSuperAdmin}
            accountId={accountId}
          />
        )}
      </Stack>
      {!!isSmallScreen && (
        <CustomDialog
          dialogOpen={formFieldsVisible}
          onClose={onReset}
        >
          <FormFields
            className="flex flex-col h-full w-full"
            table={table}
            data={tempRowData}
            editingRow={editingRow}
            onReset={onReset}
            isSuperAdmin={isSuperAdmin}
            accountId={accountId}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default memo(InternalTable);
