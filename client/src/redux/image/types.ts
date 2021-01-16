import { CreatedImage, Image, ImageInfo, Tag } from 'core/types';
import { ActionType, BaseAction } from 'redux/types';

export interface ImageState {
  owned: Record<string, string>;
  loaded: Record<string, Image>;
  current: string | null;
}

// actions

export interface UploadImagesAction
  extends BaseAction<ActionType.UPLOAD_IMAGES> {
  images: CreatedImage[];
  owned: [string, string][];
}

export interface FetchImageAction extends BaseAction<ActionType.FETCH_IMAGE> {
  image: Image;
}

export interface EditImageAction extends BaseAction<ActionType.EDIT_IMAGE> {
  id: string;
  info: ImageInfo;
}

export interface DeleteImageAction extends BaseAction<ActionType.DELETE_IMAGE> {
  id: string;
}

//

export interface AddTagAction extends BaseAction<ActionType.ADD_TAG> {
  id: string;
  tag: Tag;
}

export interface DeleteTagAction extends BaseAction<ActionType.DELETE_TAG> {
  id: string;
  tag: Tag;
}

export type ImageActions =
  | UploadImagesAction
  | FetchImageAction
  | EditImageAction
  | DeleteImageAction
  | AddTagAction
  | DeleteTagAction;
