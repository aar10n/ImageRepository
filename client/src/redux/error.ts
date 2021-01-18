import { MiddlewareAPI } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AxiosError } from 'axios';
import { AppState, BaseAction, Thunk } from 'redux/types';
import { setToast } from './toast/actions';

type SomeAction = BaseAction<any> | Thunk<any>;
type Dispatch = ThunkDispatch<AppState, void, BaseAction<any>>;

const isHttpError = (err: any): err is AxiosError => err?.response;

const errorMiddleware = (_: MiddlewareAPI<Dispatch, AppState>) => (
  next: Dispatch
) => (action: SomeAction) => {
  const handleError = (error: any) => {
    if (isHttpError(error)) {
      const { response } = error;
      next(setToast('error', `${response?.status} ${response?.statusText}`));
    }
  };

  if (typeof action === 'function') {
    const wrapped = (...args: Parameters<Thunk<any>>) => {
      let result: any;
      try {
        result = action(...args);
      } catch (error) {
        handleError(error);
      }

      if (result instanceof Promise) {
        return result.then(value => value, handleError);
      }
      return result;
    };

    return next(wrapped);
  } else {
    return next(action);
  }
};

export default errorMiddleware;
