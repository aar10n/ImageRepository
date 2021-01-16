import { ActionType } from 'redux/types';
import { ToastKind, SetToastAction, ClearToastAction } from './types';

export const setToast = (kind: ToastKind, message: string): SetToastAction => ({
  type: ActionType.SET_TOAST,
  kind,
  message,
});

export const clearToast = (): ClearToastAction => ({
  type: ActionType.CLEAR_TOAST,
});
