import { createSlice } from '@reduxjs/toolkit';

import { optimai_shop } from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  subscriptions: [],
  planGroups: [],
  billing: [],
};

const slice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.initialized = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSubscriptions(state, action) {
      state.subscriptions = action.payload;
    },
    addSubscription(state, action) {
      state.subscriptions.push(action.payload);
    },
    updateSubscription(state, action) {
      const index = state.subscriptions.findIndex((sub) => sub.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = { ...state.subscriptions[index], ...action.payload };
      }
    },
    deleteSubscription(state, action) {
      state.subscriptions = state.subscriptions.filter((sub) => sub.id !== action.payload);
    },
    setPlans(state, action) {
      state.plans = action.payload;
    },
    addPlan(state, action) {
      const { plan } = action.payload;
      const group = state.planGroups.find((g) => g.id === plan.group_id);
      if (group) {
        if (!group.plans) {
          group.plans = { items: [] };
        }
        group.plans.items.push(plan);
      }
    },
    updatePlan(state, action) {
      const { groupId, plan } = action.payload;
      const group = state.planGroups.find((g) => g.id === groupId);
      if (group && group.plans) {
        const index = group.plans.items.findIndex((p) => p.id === plan.id);
        if (index !== -1) {
          group.plans.items[index] = { ...group.plans.items[index], ...plan };
        }
      }
    },
    deletePlan(state, action) {
      const planId = action.payload;
      state.planGroups = state.planGroups.map((group) => {
        if (group.plans && Array.isArray(group.plans.items)) {
          return {
            ...group,
            plans: {
              ...group.plans,
              items: group.plans.items.filter((plan) => plan.id !== planId),
            },
          };
        }
        return group;
      });
    },
    setPlanGroups(state, action) {
      state.planGroups = action.payload;
    },
    addPlanGroup(state, action) {
      state.planGroups.push(action.payload);
    },
    updatePlanGroup(state, action) {
      const index = state.planGroups.findIndex((group) => group.id === action.payload.id);
      if (index !== -1) {
        state.planGroups[index] = { ...state.planGroups[index], ...action.payload };
      }
    },
    deletePlanGroup(state, action) {
      state.planGroups = state.planGroups.filter((group) => group.id !== action.payload);
    },
  },
});

export default slice.reducer;

// Actions
export const {
  startLoading,
  stopLoading,
  hasError,
  setSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  setPlans,
  addPlan,
  updatePlan,
  deletePlan,
  setPlanGroups,
  addPlanGroup,
  updatePlanGroup,
  deletePlanGroup,
} = slice.actions;

export const getSubscription = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.get(`/subscriptions/${id}`);
    dispatch(updateSubscription(response.data.subscription));
    dispatch(stopLoading());
    return response.data.subscription;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const deleteSubscriptionThunk = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    await optimai_shop.delete(`/subscriptions/${id}`);
    dispatch(deleteSubscription(id));
    dispatch(stopLoading());
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const createPlan = (data) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.post('/subscriptions/plans', data);
    dispatch(addPlan({ plan: response.data.subscription_plan }));
    dispatch(stopLoading());
    return response.data.subscription_plan;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const getPlan = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.get(`/subscriptions/plans/${id}`);
    dispatch(updatePlan(response.data.subscription_plan));
    dispatch(stopLoading());
    return response.data.subscription_plan;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const updatePlanThunk = (groupId, id, data) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.patch(`/subscriptions/plans/${id}`, data);
    dispatch(updatePlan({ groupId, plan: response.data.subscription_plan }));
    dispatch(stopLoading());
    return response.data.subscription_plan;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const deletePlanThunk = (groupId, id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    await optimai_shop.delete(`/subscriptions/plans/${id}`);
    dispatch(deletePlan({ groupId, planId: id }));
    dispatch(stopLoading());
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const createPlanGroup = (data) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.post('/subscriptions/plans/groups', data);
    dispatch(addPlanGroup(response.data.group));
    dispatch(stopLoading());
    return response.data.group;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const listPlanGroups = (accountId) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.get(`/subscriptions/account/${accountId}/groups`);
    dispatch(setPlanGroups(response.data.groups));
    dispatch(stopLoading());
    return response.data.groups;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const getPlanGroup = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.get(`/subscriptions/plans/groups/${id}`);
    dispatch(updatePlanGroup(response.data.group));
    dispatch(stopLoading());
    return response.data.group;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const updatePlanGroupThunk = (id, data) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await optimai_shop.patch(`/subscriptions/plans/groups/${id}`, data);
    dispatch(updatePlanGroup(response.data.group));
    dispatch(stopLoading());
    return response.data.group;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const deletePlanGroupThunk = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    await optimai_shop.delete(`/subscriptions/plans/groups/${id}`);
    dispatch(deletePlanGroup(id));
    dispatch(stopLoading());
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};
