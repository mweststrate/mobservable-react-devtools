/* global chrome */

let panelCreated = false;
let loadCheckInterval;

function createPanelIfMobxLoaded() {
  if (panelCreated) {
    return;
  }
  chrome.devtools.inspectedWindow.eval(`!!(
    Object.keys(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.instances).length || window.mobx
  )`, (pageHasMobx) => {
    if (!pageHasMobx || panelCreated) {
      return;
    }

    clearInterval(loadCheckInterval);
    panelCreated = true;
    // chrome.devtools.panels.create('MobX', '', 'panel.html', (panel) => {
    //   panel.onShown.addListener((window) => {
    //   });
    //   panel.onHidden.addListener(() => {
    //   });
    // });
  });
}

chrome.devtools.network.onNavigated.addListener(() => {
  createPanelIfMobxLoaded();
});

loadCheckInterval = setInterval(() => {
  createPanelIfMobxLoaded();
}, 1000);

createPanelIfMobxLoaded();
