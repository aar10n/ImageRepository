import { ActionType, BaseAction } from 'redux/types';
import {
  UploadImagesAction,
  FetchImageAction,
  EditImageAction,
  DeleteImageAction,
  AddTagAction,
  DeleteTagAction,
} from 'redux/image/types';

export type RequestStatus =
  | 'idle'
  | 'uploading'
  | 'waiting'
  | 'success'
  | 'failure';

export interface RequestState {
  getImages: RequestStatus;
  searchImages: RequestStatus;
  uploadImages: RequestStatus;
  fetchImage: RequestStatus;
  editImage: RequestStatus;
  deleteImage: RequestStatus;
  addTag: RequestStatus;
  deleteTag: RequestStatus;
}

export interface SetRequestStatusAction
  extends BaseAction<ActionType.SET_REQUEST_STATUS> {
  request: keyof RequestState;
  status: RequestStatus;
}

export type RequestActions = SetRequestStatusAction;
