import installGlobalHook from '../../backend/installGlobalHook.js';
const script = document.createElement('script');
script.textContent = ';(' + installGlobalHook.toString() + '(window))';
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
