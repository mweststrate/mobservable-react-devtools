import installGlobalHook from '../../backend/installGlobalHook';

const script = document.createElement('script');
script.textContent = `;(${installGlobalHook.toString()}(window))`;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
