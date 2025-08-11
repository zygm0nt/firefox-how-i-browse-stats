/*
Ah — that’s a classic gotcha in Firefox extensions:

browser.windows.create() doesn’t actually fail here, but the moment you open a new window from a popup script, the popup closes immediately and kills your script context.
That’s why your console.log lines “after” the creation are never reached — the code is literally stopped because the environment is gone.
Why this happens

    Your code is running in popup.js (popup UI context).

    When you create a new top-level browser window, Firefox closes the popup (since the user’s attention has moved).

    Closing the popup unloads the script, so the rest of your async function is never executed.

How to fix

You need to run the tab/window creation and the rest of the logic in a persistent context — e.g. a background script or background service worker, not in the popup script.
*/

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === "createWindowWithTabs" && message.domainTabs) {
    try {
      let tabsToMove = message.domainTabs;
      if (!tabsToMove.length) {
        console.warn("No tabs to move.");
        return;
      }

      let firstTab = tabsToMove[0];

      // Create new window with first tab's URL
      let newWindow = await browser.windows.create({ tabId: firstTab.id });
      console.log("New window created:", newWindow);

      // Move remaining tabs
      for (let i = 1; i < tabsToMove.length; i++) {
        try {
          await browser.tabs.move(tabsToMove[i].id, {
            windowId: newWindow.id,
            index: -1,
          });
          console.log(`Moved tab: ${tabsToMove[i].url}`);
        } catch (err) {
          console.error(`Failed to move tab ${tabsToMove[i].id}`, err);
        }
      }
    } catch (err) {
      console.error("Error in background script:", err);
    }
  }
});
