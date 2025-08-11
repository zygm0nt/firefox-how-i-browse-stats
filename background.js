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
