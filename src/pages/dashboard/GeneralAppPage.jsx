import {
  ButtonGroup,
  Grid,
  Typography,
  Button,
  Card,
  Box,
  alpha,
  useTheme,
  Stack,
  Skeleton,
} from '@mui/material';
import React, { memo, useState, useCallback } from 'react';
import { useHistory } from 'react-router';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import CreatorDialog from '../../components/CreatorDialog';
import DateRangePicker, { useDateRangePicker } from '../../components/date-range-picker';
import { DynamicIsland } from '../../components/dynamic-island/DynamicIsland';
import Iconify from '../../components/iconify';
import IconRenderer from '../../components/icons/IconRenderer';
import { CompactLayout } from '../../layouts/dashboard';
import { openCreateAltaner, selectAccountSubscriptions } from '../../redux/slices/general/index.ts';
import { dispatch, useSelector } from '../../redux/store.ts';
import { TimePeriodChips } from '../../sections/@dashboard/general/app';
// import { getClients } from '../../redux/slices/clients';

// import { MotivationIllustration } from '../../assets/illustrations';
// import { CustomAvatar } from '../../components/custom-avatar';

// import WebSocketEventTable from './analytics/WebSocketEventTable';
import DashboardGridChart from '../../sections/@dashboard/general/app/DashboardGridChart';
import { AccountSubscriptions } from '../../sections/@dashboard/user/account';
// import ActionExecutionsChart from '../../sections/@dashboard/general/app/ActionExecutions';

const AppBox = memo(({ id, name, iconUrl }) => {
  const history = useHistory();;
  const theme = useTheme();

  const handleClick = useCallback(() => {
    history.push(`/altaners/${id}`);
  }, [id, history.push]);

  const icon = iconUrl || '@lottie:da-vinci';
  return (
    <Card
      onClick={handleClick}
      sx={{
        width: '100%',
        height: '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[10],
          '& .app-icon': {
            transform: 'scale(1.1)',
          },
          '& .app-name': {
            color: theme.palette.primary.main,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: (theme) => alpha(theme.palette.primary.main, 0.08),
          borderRadius: '16px 16px 50% 50%',
        },
      }}
    >
      <Box
        className="app-icon"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows[2],
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1,
        }}
      >
        <IconRenderer
          icon={icon.startsWith('@lottie:') ? `${icon}:autoplay,loop` : icon}
          size={40}
        />
      </Box>
      <Typography
        className="app-name"
        variant="subtitle1"
        sx={{
          mt: 2,
          fontWeight: 'bold',
          transition: 'color 0.3s ease-in-out',
        }}
      >
        {name}
      </Typography>
    </Card>
  );
});

const selectAltaners = (state) => state.general.account.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;
const selectAltanersInitialized = (state) => state.general.accountAssetsInitialized.altaners;

const AppBoxes = memo(({ sx = null, ...other }) => {
  const altaners = useSelector(selectAltaners);
  const altanersLoading = useSelector(selectAltanersLoading);
  const altanersInitialized = useSelector(selectAltanersInitialized);

  if (!!altanersLoading || !altanersInitialized) {
    return (
      <Skeleton
        sx={{
          height: 100,
          width: 250,
        }}
        variant="rectangular"
      />
    );
  }

  if (!altaners) return null;

  return (
    <Grid
      container
      spacing={2}
      sx={{ py: 2, ...(sx || {}) }}
      {...other}
    >
      {altaners.map((altaner, index) => (
        <Grid
          item
          xs={6}
          sm={4}
          md={3}
          key={index}
        >
          <AppBox
            id={altaner.id}
            name={altaner.name}
            iconUrl={altaner.icon_url}
          />
        </Grid>
      ))}
    </Grid>
  );
});

// const GeneralAppPageSkeleton = () => (
//   <CompactLayout title="Dashboard · Altan" data-testid="dashboard-title">
//     <Grid container spacing={2} sx={{ pb: 2 }}>
//       {[...Array(4)].map((_, index) => (
//         <Grid item xs={6} md={3} key={index}>
//           <Box sx={{ height: 120, bgcolor: 'background.neutral' }} />
//         </Grid>
//       ))}
//       <Grid item xs={12}>
//         <Box sx={{ height: 1500, bgcolor: 'background.neutral' }} />
//       </Grid>
//     </Grid>
//   </CompactLayout>
// );

const CHARTS = [
  {
    title: 'Executed Tasks',
    selector: (state) => state.general.account.executions,
    selectorLoading: (state) => state.general.accountAssetsLoading.executions,
    total: (transformed, original) => original?.length || 0,
    graphType: 'area',
    colors: (theme) => [theme.palette.info.dark],
  },
  {
    title: 'Flows',
    selector: (state) => state.general.account.workflows,
    selectorLoading: (state) => state.general.accountAssetsLoading.workflows,
    total: (transformed, original) => original?.length || 0,
    graphType: 'area',
    colors: (theme) => [theme.palette.info.dark],
  },
  {
    title: 'Payments',
    selector: (state) => state.general.account.payments,
    selectorLoading: (state) => state.general.accountAssetsLoading.payments,
    total: (transformed, original) =>
      original?.reduce((sum, payment) => sum + payment.amount, 0) / 100 || 0,
    graphType: 'bar',
    type: 'payments',
    sumKey: 'amount',
    groupTimeTransformation: (amount) => amount / 100,
    colors: (theme) => [theme.palette.primary.main],
  },
  {
    title: 'Conversations',
    selector: (state) => state.general.account.rooms,
    selectorLoading: (state) => state.general.accountAssetsLoading.rooms,
    total: (transformed, original) => transformed?.length || 0,
    graphType: 'area',
    transformation: (original) => original?.flatMap((room) => room?.threads?.items || []) ?? [],
    colors: (theme) => [theme.palette.primary.main],
  },
];

const createAltaner = () => dispatch(openCreateAltaner());

const GeneralAppPage = () => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const [timePeriod, setTimePeriod] = useState('daily');
  const [creatorOpen, setIsCreatorOpen] = useState(false);

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  const handleDateRangeChange = (range) => {
    onChangeStartDate(range[0]);
    onChangeEndDate(range[1]);
  };

  const handleResetPicker = (e) => {
    onResetPicker();
    onClosePicker();
    e.stopPropagation();
  };

  return (
    <CompactLayout title="Dashboard · Altan">
      <Grid
        container
        // spacing={2}
        padding={{ xs: 0.5, sm: 2 }}
      >
        <Grid
          item
          xs={12}
          md={6}
        >
          <Stack
            width="100%"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            padding={1}
          >
            <Typography
              gutterBottom
              variant="h6"
            >
              👋 Hey {user?.first_name || ''}, welcome back!
            </Typography>
            <Typography variant="h2">Your Dashboard</Typography>
            <ButtonGroup
              size="large"
              variant="soft"
            >
              <Button
                color="secondary"
                startIcon={<Iconify icon="iconoir:developer" />}
                onClick={() => setIsCreatorOpen(true)}
              >
                Find creator
              </Button>

              <Button
                variant="soft"
                onClick={createAltaner}
                startIcon={<Iconify icon="mdi:plus" />}
              >
                Create Altaner
              </Button>
            </ButtonGroup>
          </Stack>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          container
        >
          <AccountSubscriptions
            subscriptionsSelector={selectAccountSubscriptions}
            minified={true}
          />
        </Grid>

        <Grid
          item
          xs={12}
          container
          spacing={2}
        >
          {CHARTS.slice(0, 4).map((item, index) => (
            <DashboardGridChart
              key={`${item.title}-${index}`}
              {...item}
              index={index}
              timePeriod={timePeriod}
            />
          ))}
        </Grid>

        <Grid
          item
          xs={12}
          md={8}
        >
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="left"
            spacing={2}
            padding={1}
            sx={{
              color: theme.palette.mode === 'light' ? 'black' : 'limegreen',
              textShadow: theme.palette.mode === 'light' ? 'none' : '0 0 5px limegreen',
            }}
          >
            <Typography variant="h5">Your Altaners</Typography>
          </Stack>
          <AppBoxes />
        </Grid>

        {/* <Grid item xs={12} md={12}>
          <ActionExecutionsChart timePeriod={timePeriod}/>
        </Grid> */}

        {/* <Grid item xs={12} md={12}>
          <Grid item xs={12}>
            <WebSocketEventTable />
          </Grid>
        </Grid> */}
      </Grid>
      <DynamicIsland>
        <Stack
          spacing={2}
          sx={{ py: 1, minWidth: 200 }}
        >
          <TimePeriodChips
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
          />
          <Button
            fullWidth
            color={isSelectedValuePicker ? 'primary' : 'inherit'}
            onClick={onOpenPicker}
            startIcon={<Iconify icon="eva:calendar-fill" />}
          >
            {isSelectedValuePicker ? shortLabel : 'Filter by Date'}
          </Button>
        </Stack>
      </DynamicIsland>
      <DateRangePicker
        variant="calendar"
        range={[startDate, endDate]}
        onChangeRange={handleDateRangeChange}
        open={openPicker}
        onClose={onClosePicker}
        isSelected={isSelectedValuePicker}
        isError={isError}
        onReset={handleResetPicker}
      />
      <CreatorDialog
        open={creatorOpen}
        onClose={() => setIsCreatorOpen(false)}
      />
    </CompactLayout>
  );
};

export default memo(GeneralAppPage);

/* <Grid item xs={12} md={6}>
      <Card sx={{ height: '100%' }}>
        <CardHeader title="Human-AI Team" action={<Button variant="soft" onClick={() => history.push('/members')}>View</Button>} />
        <CardContent>
          <AvatarGroup max={20}>
            <CustomAvatar name={account?.owner?.person?.first_name} src={account.owner?.person?.avatar_url} />
            {account?.members?.map((member) => (
              <CustomAvatar key={member.id} name={member.person?.first_name} src={member.person?.avatar_url} />
            ))}
          </AvatarGroup>
          <Divider sx={{ my: 2 }} />
          <AvatarGroup max={10}>
            {account?.agents?.map((agent) => (
              <CustomAvatar key={agent.id} name={agent.name} src={agent.avatar_url} />
            ))}
          </AvatarGroup>
        </CardContent>
      </Card>
    </Grid> */
