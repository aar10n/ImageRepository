import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import error from 'redux/error';
import reducer from 'redux/reducers';

// @ts-ignore
const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__
  ? compose(
      applyMiddleware(error, thunk),
      // @ts-ignore
      window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  : applyMiddleware(error, thunk);

const store = createStore(reducer, enhancer);

export default store;
