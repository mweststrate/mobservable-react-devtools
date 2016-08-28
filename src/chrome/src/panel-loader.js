/* global chrome */

var panelCreated = false;

function createPanelIfMobxLoaded() {
  if (panelCreated) {
    return;
  }
  chrome.devtools.inspectedWindow.eval(`!!(
    Object.keys(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.instances).length || window.mobx
  )`, function(pageHasMobx, err) {
    if (!pageHasMobx || panelCreated) {
      return;
    }

    clearInterval(loadCheckInterval);
    panelCreated = true;
    chrome.devtools.panels.create('MobX', '', 'panel.html', function(panel) {
      panel.onShown.addListener(function(window) {
      });
      panel.onHidden.addListener(function() {
      });
    });
  });
}

chrome.devtools.network.onNavigated.addListener(function() {
  createPanelIfMobxLoaded();
});

var loadCheckInterval = setInterval(function() {
  createPanelIfMobxLoaded();
}, 1000);

createPanelIfMobxLoaded();
