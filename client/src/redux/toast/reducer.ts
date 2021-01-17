import { createReducer } from 'redux/reducers';
import { ActionType } from 'redux/types';
import { ToastActions, ToastState } from './types';

const initialState: ToastState = {
  kind: null,
  message: null,
};

export const toastReducer = createReducer<ToastState, ToastActions>(
  initialState,
  {
    [ActionType.SET_TOAST]: (state, { kind, message }) => ({
      ...state,
      kind,
      message,
    }),
    [ActionType.CLEAR_TOAST]: (_, __) => initialState,
  }
);
