import { combineReducers } from 'redux';
import { toastReducer } from 'redux/toast/reducer';
import { requestReducer } from './request/reducer';
import { imageReducer } from './image/reducer';
import { BaseAction, SafeReducer, Reducers } from './types';

export function createReducer<S, A extends BaseAction<any>>(
  initialState: S,
  reducers: Reducers<S, A>
): SafeReducer<S, A> {
  return (state: S = initialState, action: A) => {
    if (reducers[action.type as keyof typeof reducers]) {
      return reducers[action.type as keyof typeof reducers](
        state,
        action as any
      );
    }
    return state;
  };
}

export default combineReducers({
  toast: toastReducer,
  request: requestReducer,
  image: imageReducer,
});
