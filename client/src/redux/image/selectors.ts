import { Image } from 'core/types';
import { AppState } from 'redux/types';
import { UploadStatus } from './types';

export const isCurrent = (id: string) => (state: AppState): boolean =>
  state.image.current === id;

export const getCurrent = (state: AppState): Image | null =>
  state.image.loaded[state.image.current ?? ''] ?? null;

export const getImage = (id: string) => (state: AppState): Image | null =>
  state.image.loaded[id] ?? null;

export const getSecret = (id: string) => (state: AppState): string | null =>
  state.image.owned[id] ?? null;

export const getUploadStatus = (state: AppState): UploadStatus =>
  state.image.uploadStatus;
