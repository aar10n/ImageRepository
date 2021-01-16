import { Image } from 'core/types';
import { AppState } from 'redux/types';

export const getCurrent = (state: AppState): Image | null =>
  state.image.loaded[state.image.current ?? ''] ?? null;

export const getImage = (state: AppState, id: string): Image | null =>
  state.image.loaded[id] ?? null;

export const getSecret = (state: AppState, id: string): string | null =>
  state.image.owned[id] ?? null;
