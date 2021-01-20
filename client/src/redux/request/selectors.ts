import { AppState } from 'redux/types';
import { RequestState } from './types';

export const getRequestStatus = (request: keyof RequestState) => (
  state: AppState
) => state.request[request];
