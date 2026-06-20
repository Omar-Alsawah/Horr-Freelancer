import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import talentReducer from '../features/talent/talentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    talent: talentReducer,
  },
});

export default store;
