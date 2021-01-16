import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import reportWebVitals from 'reportWebVitals';

import App from 'views/App';
import reducer from 'redux/reducers';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const enhancer = compose(
  applyMiddleware(thunk),
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__()
);
const store = createStore(reducer, enhancer);

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
