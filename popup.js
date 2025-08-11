// Function to extract domain from URL
function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, ""); // Remove www prefix
  } catch (e) {
    // Handle special URLs like chrome:// or moz-extension://
    if (url.includes("://")) {
      return url.split("://")[0] + "://";
    }
    return "unknown";
  }
}

// Function to analyze all tabs
async function analyzeAllTabs() {
  try {
    // Get all windows
    const windows = await browser.windows.getAll();

    // Get all tabs from all windows
    const allTabs = [];
    const tabsByDomain = {};

    for (const window of windows) {
      const tabs = await browser.tabs.query({ windowId: window.id });
      allTabs.push(...tabs);

      console.log(`Window ${window.id} has ${tabs.length} tabs`);

      // Group tabs by domain for easier manipulation
      tabs.forEach((tab) => {
        const domain = getDomainFromUrl(tab.url);
        if (!tabsByDomain[domain]) {
          tabsByDomain[domain] = [];
        }
        tabsByDomain[domain].push({
          ...tab,
          windowId: window.id,
        });
        console.log(
          `Added tab ${tab.id} (${tab.url}) from window ${window.id} to domain ${domain}`,
        );
      });
    }

    // Analyze tab data
    const domainCounts = {};
    const windowTabCounts = [];

    // Count tabs per domain and per window
    for (const window of windows) {
      const windowTabs = await browser.tabs.query({ windowId: window.id });
      windowTabCounts.push(windowTabs.length);

      windowTabs.forEach((tab) => {
        const domain = getDomainFromUrl(tab.url);
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });
    }

    // Sort domains by count and get top 20
    const sortedDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    // Calculate statistics
    const stats = {
      totalWindows: windows.length,
      totalTabs: allTabs.length,
      uniqueDomains: Object.keys(domainCounts).length,
      avgTabsPerWindow:
        windows.length > 0 ? (allTabs.length / windows.length).toFixed(1) : 0,
      topDomains: sortedDomains,
      windowTabCounts: windowTabCounts,
      tabsByDomain: tabsByDomain,
    };

    return stats;
  } catch (error) {
    console.error("Error analyzing tabs:", error);
    throw error;
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function openOtherTabs(remainingTabs) {
  return async function (windowInfo) {
    console.log(
      `Created new window ${newWindow.id} with first tab ${firstTab.id}`,
    );

    // Move ALL remaining tabs (from any window) to the new window
    if (domainTabs.length > 1) {
      const remainingTabs = domainTabs.slice(1);
      console.log(
        `Moving ${remainingTabs.length} remaining tabs to new window`,
      );

      for (const tab of remainingTabs) {
        console.log(
          `Moving tab ${tab.id} from window ${tab.windowId} to new window ${newWindow.id}`,
        );
        await browser.tabs.move(tab.id, {
          windowId: newWindow.id,
          index: -1, // Move to the end
        });
      }
    }
  };
}

async function moveTabsToSameWindow(domain, tabsByDomain, windowIds) {
  try {
    const domainTabs = tabsByDomain[domain];
    if (!domainTabs || domainTabs.length <= 1) {
      showMessage("Only one tab found for this domain", "error");
      return;
    }

    if (windowIds.size <= 1) {
      showMessage("All tabs are already in the same window", "error");
      return;
    }

    // Group tabs by window
    const tabsByWindow = {};
    domainTabs.forEach((tab) => {
      if (!tabsByWindow[tab.windowId]) {
        tabsByWindow[tab.windowId] = [];
      }
      tabsByWindow[tab.windowId].push(tab);
    });

    const windowIdArray = Array.from(windowIds);

    // Find the window with the most tabs for this domain (target window)
    const targetWindowId = windowIdArray.reduce((maxWindowId, windowId) => {
      const maxCount = tabsByWindow[maxWindowId]
        ? tabsByWindow[maxWindowId].length
        : 0;
      const currentCount = tabsByWindow[windowId]
        ? tabsByWindow[windowId].length
        : 0;
      return currentCount > maxCount ? windowId : maxWindowId;
    });

    // Move all tabs from other windows to the target window
    const tabsToMove = [];
    windowIdArray.forEach((windowId) => {
      if (windowId != targetWindowId && tabsByWindow[windowId]) {
        tabsToMove.push(...tabsByWindow[windowId]);
      }
    });

    if (tabsToMove.length === 0) {
      showMessage("All tabs are already in the same window", "error");
      return;
    }

    console.log(`Moving ${tabsToMove.length} tabs to window ${targetWindowId}`);

    // Move tabs one by one
    for (const tab of tabsToMove) {
      await browser.tabs.move(tab.id, {
        windowId: parseInt(targetWindowId),
        index: -1, // Move to the end
      });
    }

    showMessage(
      `Moved ${tabsToMove.length} tab(s) for ${domain} to the same window`,
      "success",
    );

    // Refresh stats after 1 second
    setTimeout(loadTabStats, 1000);
  } catch (error) {
    console.error("Error moving tabs:", error);
    showMessage(`Error moving tabs: ${error.message}`, "error");
  }
}

// Function to show messages to user
function showMessage(text, type = "success") {
  const messageContainer = document.getElementById("messageContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className =
    type === "success" ? "success-message" : "error-message";
  messageDiv.textContent = text;

  // Clear previous messages
  messageContainer.innerHTML = "";
  messageContainer.appendChild(messageDiv);

  // Auto-remove message after 5 seconds
  setTimeout(() => {
    if (messageContainer.contains(messageDiv)) {
      messageContainer.removeChild(messageDiv);
    }
  }, 5000);
}

// Function to display statistics
function displayStats(stats) {
  document.getElementById("totalWindows").textContent = stats.totalWindows;
  document.getElementById("totalTabs").textContent = stats.totalTabs;
  document.getElementById("uniqueDomains").textContent = stats.uniqueDomains;
  document.getElementById("avgTabsPerWindow").textContent =
    stats.avgTabsPerWindow;

  // Display top domains
  const domainListElement = document.getElementById("domainList");
  domainListElement.innerHTML = "";

  if (stats.topDomains.length === 0) {
    domainListElement.innerHTML =
      '<div style="text-align: center; color: #666;">No tabs found</div>';
    return;
  }

  stats.topDomains.forEach((domainData, index) => {
    const [domain, count] = domainData;
    const domainElement = document.createElement("div");
    domainElement.className = "domain-item";

    // Add rank number for top 3
    const rankIcon = index < 3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`;

    // Check if tabs are spread across multiple windows
    const domainTabs = stats.tabsByDomain[domain] || [];
    const windowIds = new Set(domainTabs.map((tab) => tab.windowId));
    const isSpreadAcrossWindows = windowIds.size > 1;

    console.log(`=== DOMAIN: ${domain} ===`);
    console.log(`  Total tabs: ${count}`);
    console.log(`  Domain tabs found:`, domainTabs);
    console.log(`  Window IDs:`, Array.from(windowIds));
    console.log(`  Windows count: ${windowIds.size}`);
    console.log(`  isSpreadAcrossWindows: ${isSpreadAcrossWindows}`);
    console.log(`  Should show button: ${isSpreadAcrossWindows && count > 1}`);

    const domainInfo = document.createElement("div");
    domainInfo.className = "domain-info";
    domainInfo.innerHTML = `
      <span class="domain-name" title="${domain} (${windowIds.size} windows)">
        ${rankIcon} ${domain}
      </span>
    `;

    const domainActions = document.createElement("div");
    domainActions.className = "domain-actions";

    // Add buttons based on conditions
    if (count > 1) {
      // Show "New Window" button for any domain with more than 1 tab
      const newWindowBtn = document.createElement("button");
      newWindowBtn.className = "new-window-btn";
      newWindowBtn.innerHTML = "🪟 New";
      newWindowBtn.title = `Move all ${domain} tabs to a new window`;
      newWindowBtn.addEventListener(
        "click",
        async () =>
          await browser.runtime.sendMessage({
            action: "createWindowWithTabs",
            domainTabs: window.currentStats.tabsByDomain[domain],
            domain: domain,
          }),
      );
      domainActions.appendChild(newWindowBtn);
      console.log(`  ✓ ADDED New Window button for ${domain}`);

      // Show "Group" button only if tabs are spread across multiple windows
      if (isSpreadAcrossWindows) {
        const moveBtn = document.createElement("button");
        moveBtn.className = "move-btn";
        moveBtn.innerHTML = "📂 Group";
        moveBtn.title = `Move all ${domain} tabs to same window`;
        moveBtn.addEventListener("click", () =>
          moveTabsToSameWindow(
            domain,
            window.currentStats.tabsByDomain,
            windowIds,
          ),
        );
        domainActions.appendChild(moveBtn);
        console.log(`  ✓ ADDED Group button for ${domain}`);
      }
    } else {
      // Show window indicator for single tabs
      const windowIndicator = document.createElement("small");
      windowIndicator.style.color = "#999";
      windowIndicator.style.fontSize = "9px";
      windowIndicator.textContent = `${windowIds.size}w`;
      domainActions.appendChild(windowIndicator);
      console.log(`  ✗ NO buttons - only ${count} tab(s)`);
    }

    const countBadge = document.createElement("span");
    countBadge.className = "domain-count";
    countBadge.textContent = count;
    domainActions.appendChild(countBadge);

    domainElement.appendChild(domainInfo);
    domainElement.appendChild(domainActions);

    domainListElement.appendChild(domainElement);
  });

  // Store current stats globally for button access
  window.currentStats = stats;
}

// Function to show loading state
function showLoading(isLoading) {
  const loadingElement = document.getElementById("loading");
  const statsElement = document.getElementById("stats");

  if (isLoading) {
    loadingElement.style.display = "block";
    statsElement.style.display = "none";
  } else {
    loadingElement.style.display = "none";
    statsElement.style.display = "block";
  }
}

// Function to load and display tab statistics
async function loadTabStats() {
  showLoading(true);

  try {
    const stats = await analyzeAllTabs();
    displayStats(stats);
    showLoading(false);
  } catch (error) {
    console.error("Failed to load tab stats:", error);
    document.getElementById("loading").innerHTML = `
      <div style="color: red; text-align: center;">
        ❌ Error loading tab statistics<br>
        <small>${error.message}</small>
      </div>
    `;
  }
}

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  loadTabStats();

  // Add refresh button functionality
  document.getElementById("refreshBtn").addEventListener("click", loadTabStats);

  // Make functions available globally
  window.moveTabsToSameWindow = moveTabsToSameWindow;
  window.moveTabsToNewWindow = moveTabsToNewWindow;
});

// Optional: Auto-refresh every 30 seconds if popup stays open
setInterval(() => {
  if (document.visibilityState === "visible") {
    loadTabStats();
  }
}, 30000);
