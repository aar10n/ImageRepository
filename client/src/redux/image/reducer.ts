import { tuple } from 'core/types';
import { createReducer } from 'redux/reducers';
import { ActionType } from 'redux/types';
import { ImageActions, ImageState } from './types';

const initialState: ImageState = {
  loaded: {},
  owned: {},
  current: null,
  requestStatus: 'idle',
};

export const imageReducer = createReducer<ImageState, ImageActions>(
  initialState,
  {
    [ActionType.UPLOAD_IMAGES]: (state, { images, owned }) => ({
      ...state,
      loaded: Object.fromEntries(images.map(image => tuple(image.id, image))),
      owned: Object.fromEntries(owned),
      current: images[0].id,
      requestStatus: 'success',
    }),
    [ActionType.FETCH_IMAGE]: (state, { image }) => ({
      ...state,
      loaded: {
        ...state.loaded,
        [image.id]: image,
      },
    }),
    [ActionType.EDIT_IMAGE]: (state, { id, info }) => ({
      ...state,
      loaded: {
        ...state.loaded,
        [id]: {
          ...state.loaded[id],
          ...info,
        },
      },
    }),
    [ActionType.DELETE_IMAGE]: (state, { id }) => {
      const { [id]: _, ...loaded } = state.loaded;
      const { [id]: __, ...owned } = state.owned;
      return {
        ...state,
        loaded,
        owned,
      };
    },
    [ActionType.ADD_TAG]: (state, { id, tag }) => {
      const oldTags = state.loaded[id].tags;
      const tags = oldTags.includes(tag) ? oldTags : [...oldTags, tag];
      return {
        ...state,
        loaded: {
          ...state.loaded,
          [id]: {
            ...state.loaded[id],
            tags,
          },
        },
      };
    },
    [ActionType.DELETE_TAG]: (state, { id, tag }) => {
      const tags = state.loaded[id].tags.filter(t => t !== tag);
      return {
        ...state,
        loaded: {
          ...state.loaded,
          [id]: {
            ...state.loaded[id],
            tags,
          },
        },
      };
    },
    [ActionType.LOAD_SAVED_SECRETS]: (state, { owned }) => ({
      ...state,
      owned: {
        ...state.owned,
        ...owned,
      },
    }),
    [ActionType.SET_REQUEST_STATUS]: (state, { status }) => ({
      ...state,
      requestStatus: status,
    }),
  }
);
