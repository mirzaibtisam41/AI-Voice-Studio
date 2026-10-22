import { createSlice } from '@reduxjs/toolkit';

export const AUTH_STATUS = {
  CHECKING: 'checking',
  LOGGED_IN: 'logged-in',
  LOGGED_OUT: 'logged-out',
};

const initialState = {
  status: AUTH_STATUS.CHECKING,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted(state, action) {
      state.status = AUTH_STATUS.LOGGED_IN;
      state.user = action.payload;
    },
    userUpdated(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    loggedOut(state) {
      state.status = AUTH_STATUS.LOGGED_OUT;
      state.user = null;
    },
  },
});

export const { sessionStarted, userUpdated, loggedOut } = authSlice.actions;

export const authReducer = authSlice.reducer;

export const selectAuthStatus = (state) => state.auth.status;
export const selectCurrentUser = (state) => state.auth.user;
