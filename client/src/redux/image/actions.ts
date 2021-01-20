import { Image, ImageInfo, Tag, tuple } from 'core/types';
import { ActionType, BaseAction, Thunk } from 'redux/types';
import { LoadSavedSecretsAction } from './types';
import { getSecret } from './selectors';
import { setRequestStatus } from 'redux/request/actions';
import { RequestState, SetRequestStatusAction } from 'redux/request/types';
import RestService from 'core/RestService';

const requestAction = <T extends BaseAction<any>, E, P extends any[]>(
  key: keyof RequestState,
  fn: (...args: P) => Promise<E> | Thunk<T | SetRequestStatusAction, E>
) => (...args: P): Thunk<T | SetRequestStatusAction, E> => async (
  dispatch,
  getState
) => {
  try {
    dispatch(setRequestStatus(key, 'waiting'));
    const result = fn(...args);

    let value: E;
    if (result instanceof Promise) {
      value = await result;
    } else {
      value = await result(dispatch, getState);
    }

    dispatch(setRequestStatus(key, 'success'));
    return value;
  } catch (error) {
    dispatch(setRequestStatus(key, 'failure'));
    throw error;
  }
};

export const getImages = requestAction('getImages', async (page: number) => {
  return await RestService.getImages(page, 100);
});

export const searchImages = requestAction(
  'searchImages',
  async (url: string) => {
    return await RestService.searchImages(url);
  }
);

export const uploadImages = (
  files: FileList
): Thunk<any, Image[]> => async dispatch => {
  dispatch(setRequestStatus('uploadImages', 'uploading'));
  try {
    const images = await RestService.uploadImages(files, progress => {
      if (progress === 100) {
        dispatch(setRequestStatus('uploadImages', 'waiting'));
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
    dispatch(setRequestStatus('uploadImages', 'success'));
    return images;
  } catch (error) {
    dispatch(setRequestStatus('uploadImages', 'failure'));
    throw error;
  }
};

export const fetchImage = requestAction(
  'fetchImage',
  (id: string) => async dispatch => {
    const image = await RestService.getImage(id);
    dispatch({
      type: ActionType.FETCH_IMAGE,
      image,
    });
    return image;
  }
);

export const editImage = requestAction(
  'editImage',
  (id: string, info: ImageInfo) => async (dispatch, getState) => {
    const secret = getSecret(id)(getState!());
    await RestService.editImage(id, secret, info);
    dispatch({
      type: ActionType.EDIT_IMAGE,
      id,
      info,
    });
  }
);

export const deleteImage = requestAction(
  'deleteImage',
  (id: string) => async (dispatch, getState) => {
    const secret = getSecret(id)(getState!());
    await RestService.deleteImage(id, secret);
    dispatch({
      type: ActionType.DELETE_IMAGE,
      id,
    });
  }
);

export const addTag = requestAction(
  'addTag',
  (id: string, tag: Tag) => async (dispatch, getState) => {
    console.log('adding tag');
    console.log(getState);
    console.log(getState!());
    const secret = getSecret(id)(getState!());
    console.log(secret);
    await RestService.addTags(id, secret, [tag]);
    dispatch({
      type: ActionType.ADD_TAG,
      id,
      tag,
    });
  }
);

export const deleteTag = requestAction(
  'deleteTag',
  (id: string, tag: Tag) => async (dispatch, getState) => {
    const secret = getSecret(id)(getState!());
    await RestService.deleteTag(id, secret, tag);
    dispatch({
      type: ActionType.DELETE_TAG,
      id,
      tag,
    });
  }
);

export const loadSavedSecrets = (): LoadSavedSecretsAction => {
  const entries = Object.entries(localStorage).filter(
    ([key, value]) => key.length === 7 && value.length === 20
  );
  return {
    type: ActionType.LOAD_SAVED_SECRETS,
    owned: Object.fromEntries(entries),
  };
};
