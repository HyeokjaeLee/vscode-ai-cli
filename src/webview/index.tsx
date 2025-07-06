import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import '../index.css'; // Import Tailwind CSS

const App = () => {
  return (
    <div className="tw-p-4 tw-text-white tw-bg-gray-800">
      <h1 className="tw-text-2xl tw-font-bold">AI CLI Webview</h1>
      <p>This is your React app running in the VS Code webview!</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
