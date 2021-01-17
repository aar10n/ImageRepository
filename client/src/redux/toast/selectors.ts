import { AppState } from 'redux/types';
import { ToastKind } from './types';

export const getToastKind = (state: AppState): ToastKind | null =>
  state.toast.kind;
export const getToastMessage = (state: AppState): string | null =>
  state.toast.message;
