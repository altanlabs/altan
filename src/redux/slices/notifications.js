import { createSlice } from '@reduxjs/toolkit';

import { optimai, optimai_room } from '../../utils/axios';

const initialState = {
  initialized: false,
  notifications: [],
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.initialized = true;
    },
    addNotifications: (state, action) => {
      state.notifications = [...state.notifications, ...action.payload];
      state.initialized = true;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    updateNotificationStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.notifications.findIndex((notification) => notification.id === id);
      if (index !== -1) {
        state.notifications[index] = {
          ...state.notifications[index],
          status: status,
        };
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
    clearState: (state) => {
      state.notifications = [];
      state.initialized = false;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearState: clearNotificationsState,
} = slice.actions;

export default slice.reducer;

export const fetchNotifications = () => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const response = await optimai.get(`/account/${account.id}/notifications`);

    const { notifications } = response.data;
    dispatch(slice.actions.setNotifications(notifications));
    const personal = await optimai.get('/user/me/notifications');
    dispatch(slice.actions.addNotifications(personal.data.notifications));
    return 'success';
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const readNotification = (notificationId) => async (dispatch) => {
  try {
    await optimai.patch(`/notifications/read/${notificationId}`);
    dispatch(slice.actions.updateNotificationStatus({ id: notificationId, status: 'opened' }));
    return 'success';
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const archiveNotification = (notificationId) => async (dispatch) => {
  try {
    await optimai.patch(`/notifications/archive/${notificationId}`);
    dispatch(slice.actions.updateNotificationStatus({ id: notificationId, status: 'archived' }));
    return 'success';
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const acceptRoomInvitation = (invitationId) => async (dispatch, getState) => {
  try {
    const response = await optimai_room.patch(`/invitation/room/${invitationId}/accept`);
    const { room } = response.data;
    return Promise.resolve(room);
  } catch (e) {
    return Promise.reject(e);
  }
};
