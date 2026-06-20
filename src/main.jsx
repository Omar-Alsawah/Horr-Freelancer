import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './chat-styles.css';
import './i18n';

import { Provider } from 'react-redux';
import { store } from './app/clientStore';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
