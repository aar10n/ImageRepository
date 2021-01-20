import { ActionType } from 'redux/types';
import { RequestState, RequestStatus, SetRequestStatusAction } from './types';

export const setRequestStatus = (
  request: keyof RequestState,
  status: RequestStatus
): SetRequestStatusAction => ({
  type: ActionType.SET_REQUEST_STATUS,
  request,
  status,
});
