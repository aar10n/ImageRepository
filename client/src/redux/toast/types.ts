import { ActionType, BaseAction } from 'redux/types';

export type ToastKind = 'error' | 'warning';

export interface ToastState {
  kind: ToastKind | null;
  message: string | null;
}

// actions

export interface SetToastAction extends BaseAction<ActionType.SET_TOAST> {
  kind: ToastKind;
  message: string;
}

export interface ClearToastAction extends BaseAction<ActionType.CLEAR_TOAST> {}

export type ToastActions = SetToastAction | ClearToastAction;
