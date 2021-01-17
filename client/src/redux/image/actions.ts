import { ImageInfo, Tag, tuple } from 'core/types';
import { ActionType, Thunk } from 'redux/types';
import {
  AddTagAction,
  DeleteImageAction,
  DeleteTagAction,
  EditImageAction,
  FetchImageAction,
  SetRequestStatusAction,
  RequestStatus,
} from './types';
import RestService from 'core/RestService';
import { getSecret } from './selectors';

export const getImages = (page: number): Thunk<any> => async dispatch => {
  const images = await RestService.getImages(page, 20);
  return;
};

export const uploadImages = (files: FileList): Thunk<any> => async dispatch => {
  dispatch(setRequestStatus('uploading'));
  try {
    const images = await RestService.uploadImages(files, progress => {
      if (progress === 100) {
        dispatch(setRequestStatus('waiting'));
      }
    });
    const owned = images.map(image => {
      localStorage.setItem(image.id, image.secret);
      return tuple(image.id, image.secret);
    });

    dispatch({
      type: ActionType.UPLOAD_IMAGES,
      images,
      owned,
    });
  } catch (error) {
    dispatch(setRequestStatus('failure'));
    throw error;
  }
};

export const fetchImage = (
  id: string
): Thunk<FetchImageAction> => async dispatch => {
  dispatch({
    type: ActionType.FETCH_IMAGE,
    image: await RestService.getImage(id),
  });
};

export const editImage = (
  id: string,
  info: ImageInfo
): Thunk<EditImageAction> => async (dispatch, getState) => {
  const secret = getSecret(id)(getState!());
  await RestService.editImage(id, secret, info);
  dispatch({
    type: ActionType.EDIT_IMAGE,
    id,
    info,
  });
};

export const deleteImage = (id: string): Thunk<DeleteImageAction> => async (
  dispatch,
  getState
) => {
  const secret = getSecret(id)(getState!());
  await RestService.deleteImage(id, secret);
  dispatch({
    type: ActionType.DELETE_IMAGE,
    id,
  });
};

export const addTag = (id: string, tag: Tag): Thunk<AddTagAction> => async (
  dispatch,
  getState
) => {
  const secret = getSecret(id)(getState!());
  await RestService.addTags(id, secret, [tag]);
  dispatch({
    type: ActionType.ADD_TAG,
    id,
    tag,
  });
};

export const deleteTag = (
  id: string,
  tag: Tag
): Thunk<DeleteTagAction> => async (dispatch, getState) => {
  const secret = getSecret(id)(getState!());
  await RestService.deleteTag(id, secret, tag);
  dispatch({
    type: ActionType.DELETE_TAG,
    id,
    tag,
  });
};

export const setRequestStatus = (
  status: RequestStatus
): SetRequestStatusAction => ({
  type: ActionType.SET_REQUEST_STATUS,
  status,
});
