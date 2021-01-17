import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import error from 'redux/error';
import reducer from 'redux/reducers';

const enhancer = compose(
  applyMiddleware(error, thunk),
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__()
);

const store = createStore(reducer, enhancer);

export default store;
