// store.js

import { configureStore, createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    session: JSON.parse(sessionStorage.getItem("session")) || {}
  },
  reducers: {
    SET_SESSION: (state, action) => {
      state.session = action.payload;
    },
    CLEAR_SESSION: (state) => {
      state.session = {};
    },
  },
});

export const { SET_SESSION, CLEAR_SESSION } = sessionSlice.actions;



const usersSlice = createSlice({
  name: "users",
  initialState: {
      users:[]
  },
  reducers: {
      SET_USERS: (state, action)=>{
          state.users = action.payload;
      }
  }
})
export const { SET_USERS } = usersSlice.actions;




const sessionStorageSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === SET_SESSION.type || action.type === CLEAR_SESSION.type) {
    const { session } = store.getState().session;
    sessionStorage.setItem("session", JSON.stringify(session));
  }

  return result;
};








export const mainStore = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    users: usersSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionStorageSyncMiddleware),
});

export default mainStore;
