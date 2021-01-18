import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import reportWebVitals from 'reportWebVitals';

import App from 'views/App';
import store from 'redux/store';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#2e3035',
    },
  },
  typography: {
    allVariants: {
      fontFamily: 'Helvetica, Arial, sans-serrif',
    },
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
