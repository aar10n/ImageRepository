import { createReducer } from 'redux/reducers';
import { ActionType } from 'redux/types';
import { RequestActions, RequestState } from './types';

const initialState: RequestState = {
  getImages: 'idle',
  searchImages: 'idle',
  uploadImages: 'idle',
  fetchImage: 'idle',
  editImage: 'idle',
  deleteImage: 'idle',
  addTag: 'idle',
  deleteTag: 'idle',
};

export const requestReducer = createReducer<RequestState, RequestActions>(
  initialState,
  {
    [ActionType.SET_REQUEST_STATUS]: (state, { request, status }) => ({
      ...state,
      [request]: status,
    }),
  }
);
