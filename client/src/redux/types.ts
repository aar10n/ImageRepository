import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ImageActions, ImageState } from './image/types';
import { ToastActions, ToastState } from './toast/types';

export enum ActionType {
  UPLOAD_IMAGES = 'image/UPLOAD_IMAGES',
  FETCH_IMAGE = 'image/FETCH_IMAGE',
  EDIT_IMAGE = 'image/EDIT_IMAGE',
  DELETE_IMAGE = 'image/DELETE_IMAGE',
  ADD_TAG = 'image/tag/ADD_TAG',
  DELETE_TAG = 'image/tag/DELETE_TAG',

  SET_TOAST = 'toast/SET_TOAST',
  CLEAR_TOAST = 'toast/CLEAR_TOAST',
}

export interface AppState {
  image: ImageState;
  toast: ToastState;
}

export type Actions = ImageActions | ToastActions;

export interface BaseAction<A extends ActionType> {
  type: A;
}

export type SafeReducer<S, A extends AnyAction> = (state: S, action: A) => S;

export type Thunk<T extends BaseAction<any>> = (
  dispatch: ThunkDispatch<AppState, void, T>,
  getState?: () => AppState
) => void | Promise<void>;

export type ActionTypeMap<T extends BaseAction<any>> = {
  [K in T['type']]: Extract<T, { type: K }>;
};

export type Reducers<S, A extends BaseAction<any>, M = ActionTypeMap<A>> = {
  [K in keyof M]: (state: S, action: M[K]) => S;
};
