import { ImageInfo, Tag, tuple } from 'core/types';
import { ActionType, Thunk } from 'redux/types';
import {
  AddTagAction,
  DeleteImageAction,
  DeleteTagAction,
  EditImageAction,
  FetchImageAction,
  UploadImagesAction,
} from './types';
import RestService from 'core/RestService';
import { getSecret } from './selectors';

export const uploadImages = (
  files: FileList
): Thunk<UploadImagesAction> => async dispatch => {
  try {
    const images = await RestService.uploadImages(files);
    const owned = images.map(image => {
      localStorage.setItem(image.id, image.secret);
      return tuple(image.id, image.secret);
    });

    dispatch({
      type: ActionType.UPLOAD_IMAGES,
      images,
      owned,
    });
  } catch (err) {
    console.error(err);
  }
};

export const fetchImage = (
  id: string
): Thunk<FetchImageAction> => async dispatch => {
  try {
    dispatch({
      type: ActionType.FETCH_IMAGE,
      image: await RestService.getImage(id),
    });
  } catch (err) {
    console.error(err);
  }
};

export const editImage = (
  id: string,
  info: ImageInfo
): Thunk<EditImageAction> => async (dispatch, getState) => {
  try {
    const secret = getSecret(getState!(), id);
    await RestService.editImage(id, secret, info);
    dispatch({
      type: ActionType.EDIT_IMAGE,
      id,
      info,
    });
  } catch (err) {
    console.error(err);
  }
};

export const deleteImage = (id: string): Thunk<DeleteImageAction> => async (
  dispatch,
  getState
) => {
  try {
    const secret = getSecret(getState!(), id);
    await RestService.deleteImage(id, secret);
    dispatch({
      type: ActionType.DELETE_IMAGE,
      id,
    });
  } catch (err) {
    console.error(err);
  }
};

export const addTag = (id: string, tag: Tag): Thunk<AddTagAction> => async (
  dispatch,
  getState
) => {
  try {
    const secret = getSecret(getState!(), id);
    await RestService.addTags(id, secret, [tag]);
    dispatch({
      type: ActionType.ADD_TAG,
      id,
      tag,
    });
  } catch (err) {
    console.error(err);
  }
};

export const deleteTag = (
  id: string,
  tag: Tag
): Thunk<DeleteTagAction> => async (dispatch, getState) => {
  try {
    const secret = getSecret(getState!(), id);
    await RestService.deleteTag(id, secret, tag);
    dispatch({
      type: ActionType.DELETE_TAG,
      id,
      tag,
    });
  } catch (err) {
    console.error(err);
  }
};
