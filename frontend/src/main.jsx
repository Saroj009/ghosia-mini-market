import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log('🚀 Frontend loading...');
console.log('✅ React version:', React.version);

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✅ App component rendered');
} else {
  console.error('❌ Root element not found!');
}
