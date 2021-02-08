import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Integrations} from "@sentry/tracing";
import * as Sentry from "@sentry/react";

console.log(process.env);
if (process.env.REACT_APP_ENABLE_MONITORING === "true" || process.env.NODE_ENV === "production") {
    Sentry.init({
        dsn: "https://6ef540dfdecf40a8a17c3d7f53db93ad@o164715.ingest.sentry.io/5627001",
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 0.1,
        beforeSend(event, hint) {
            if (event.exception) {
                Sentry.showReportDialog({eventId: event.event_id});
            }
            return event;
        }
    });
}

ReactDOM.render(
    <React.StrictMode>
        <Sentry.ErrorBoundary fallback="An error has occurred">
            <App/>
        </Sentry.ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
