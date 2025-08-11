// Function to extract domain from URL
function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, ''); // Remove www prefix
  } catch (e) {
    // Handle special URLs like chrome:// or moz-extension://
    if (url.includes('://')) {
      return url.split('://')[0] + '://';
    }
    return 'unknown';
  }
}

// Function to analyze all tabs
async function analyzeAllTabs() {
  try {
    // Get all windows
    const windows = await browser.windows.getAll();
    
    // Get all tabs from all windows
    const allTabs = [];
    for (const window of windows) {
      const tabs = await browser.tabs.query({ windowId: window.id });
      allTabs.push(...tabs);
    }
    
    // Analyze tab data
    const domainCounts = {};
    const windowTabCounts = [];
    
    // Group tabs by window and count domains
    for (const window of windows) {
      const windowTabs = await browser.tabs.query({ windowId: window.id });
      windowTabCounts.push(windowTabs.length);
      
      windowTabs.forEach(tab => {
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
      avgTabsPerWindow: windows.length > 0 ? (allTabs.length / windows.length).toFixed(1) : 0,
      topDomains: sortedDomains,
      windowTabCounts: windowTabCounts
    };
    
    return stats;
  } catch (error) {
    console.error('Error analyzing tabs:', error);
    throw error;
  }
}

// Function to display statistics
function displayStats(stats) {
  document.getElementById('totalWindows').textContent = stats.totalWindows;
  document.getElementById('totalTabs').textContent = stats.totalTabs;
  document.getElementById('uniqueDomains').textContent = stats.uniqueDomains;
  document.getElementById('avgTabsPerWindow').textContent = stats.avgTabsPerWindow;
  
  // Display top domains
  const domainListElement = document.getElementById('domainList');
  domainListElement.innerHTML = '';
  
  if (stats.topDomains.length === 0) {
    domainListElement.innerHTML = '<div style="text-align: center; color: #666;">No tabs found</div>';
    return;
  }
  
  stats.topDomains.forEach((domainData, index) => {
    const [domain, count] = domainData;
    const domainElement = document.createElement('div');
    domainElement.className = 'domain-item';
    
    // Add rank number for top 3
    const rankIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
    
    domainElement.innerHTML = `
      <span class="domain-name" title="${domain}">
        ${rankIcon} ${domain}
      </span>
      <span class="domain-count">${count}</span>
    `;
    
    domainListElement.appendChild(domainElement);
  });
}

// Function to show loading state
function showLoading(isLoading) {
  const loadingElement = document.getElementById('loading');
  const statsElement = document.getElementById('stats');
  
  if (isLoading) {
    loadingElement.style.display = 'block';
    statsElement.style.display = 'none';
  } else {
    loadingElement.style.display = 'none';
    statsElement.style.display = 'block';
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
    console.error('Failed to load tab stats:', error);
    document.getElementById('loading').innerHTML = `
      <div style="color: red; text-align: center;">
        ❌ Error loading tab statistics<br>
        <small>${error.message}</small>
      </div>
    `;
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadTabStats();
  
  // Add refresh button functionality
  document.getElementById('refreshBtn').addEventListener('click', loadTabStats);
});

// Optional: Auto-refresh every 30 seconds if popup stays open
setInterval(() => {
  if (document.visibilityState === 'visible') {
    loadTabStats();
  }
}, 30000);