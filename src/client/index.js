import React from 'react';
import { Router, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import routes from './routes.js';
import Perf from 'react-addons-perf';
import store from './utils/store';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';

window.Perf = Perf;
console.warn = function () { };

// import whyDidYouUpdate from 'why-did-you-update';
// whyDidYouUpdate(React);
const ErrorBoundary = ({ children }) => {
    if (process.env.NODE_ENV === 'production') {
        const bugsnagClient = bugsnag({ apiKey: '817ab366d8f0f252b53ca739a4ce6444', overwrite: true });
        bugsnagClient.use(bugsnagReact, React);
        const Boundary = bugsnagClient.getPlugin('react');
        return <Boundary>{children}</Boundary>;
    }
    return <div style={{ height: '100%' }} >{children}</div>;
};

ReactDOM.render(
    <ErrorBoundary>
        <Provider store={store}>
            <Router history={hashHistory} routes={routes} />
        </Provider>
    </ErrorBoundary>,
    document.getElementById('app')
);
