import { ActionType, BaseAction, Reducers } from 'redux/types';

export type ToastKind = '' | 'error';

export interface ToastState {
  kind: ToastKind;
  message: string;
}

// actions

export interface SetToastAction extends BaseAction<ActionType.SET_TOAST> {
  kind: ToastKind;
  message: string;
}

export interface ClearToastAction extends BaseAction<ActionType.CLEAR_TOAST> {}

export type ToastActions = SetToastAction | ClearToastAction;
