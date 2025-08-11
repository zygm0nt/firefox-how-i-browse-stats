# Tab Stats Analyzer - Firefox Extension

A simple and powerful Firefox extension that analyzes all your open tabs across all browser windows and provides comprehensive statistics about your browsing patterns.

## 🌟 Features

- **📊 Comprehensive Tab Statistics**: Get an overview of your browsing habits
  - Total number of browser windows
  - Total number of open tabs
  - Number of unique domains
  - Average tabs per window

- **🏆 Top 20 Domains Ranking**: See which websites you visit most frequently
  - Sorted by number of open tabs
  - Visual ranking with medals for top 3 domains
  - Tab count badges for each domain

- **🔄 Real-time Updates**: 
  - Manual refresh button for instant updates
  - Auto-refresh every 30 seconds while popup is open

- **🎨 Clean Interface**: 
  - Modern, user-friendly design
  - Easy-to-read statistics layout
  - Responsive popup window

## 📋 Requirements

- Firefox 57 or later
- No additional dependencies required

## 🚀 Installation

### Method 1: Temporary Installation (For Development/Testing)

1. **Download the Extension**
   - Clone this repository or download all files
   - Ensure you have these files in a folder:
     - `manifest.json`
     - `popup.html`
     - `popup.js`

2. **Create Icons (Optional)**
   - Create PNG icons with sizes: 16x16, 32x32, 48x48, and 128x128 pixels
   - Name them: `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`
   - Place them in the same folder as other extension files
   - If you skip this step, Firefox will use default icons

3. **Load the Extension in Firefox**
   - Open Firefox and type `about:debugging` in the address bar
   - Click on **"This Firefox"** in the left sidebar
   - Click the **"Load Temporary Add-on..."** button
   - Navigate to your extension folder and select the `manifest.json` file
   - Click **"Open"**

4. **Verify Installation**
   - The extension should now appear in your extensions list
   - Look for the Tab Stats Analyzer icon in your Firefox toolbar
   - If the icon doesn't appear, click the puzzle piece icon (⋯) in the toolbar and pin the extension

### Method 2: Permanent Installation (Advanced Users)

For a permanent installation, you would need to:

1. **Package the Extension**
   - Zip all extension files into a `.zip` file
   - Rename the extension to `.xpi`

2. **Sign the Extension**
   - Submit to Mozilla Add-ons for review and signing, or
   - Use Mozilla's web-ext tool for self-distribution

*Note: Method 2 requires developer accounts and additional setup. Method 1 is recommended for personal use.*

## 📖 Usage

1. **Open the Extension**
   - Click the Tab Stats Analyzer icon in your Firefox toolbar
   - A popup window will appear with your tab statistics

2. **View Your Statistics**
   - **Overview Section**: Shows total windows, tabs, unique domains, and average tabs per window
   - **Top 20 Domains**: Lists your most frequently visited domains with tab counts

3. **Refresh Data**
   - Click the **"🔄 Refresh Stats"** button to update statistics
   - The extension auto-refreshes every 30 seconds while the popup remains open

4. **Interpret the Results**
   - 🥇🥈🥉 medals indicate your top 3 most-visited domains
   - Green badges show the exact number of tabs for each domain
   - Domains are sorted from most to least tabs

## 🔧 How It Works

The extension uses Firefox's WebExtensions API to:

1. **Query All Windows**: Accesses all open browser windows using `browser.windows.getAll()`
2. **Analyze Tabs**: Retrieves tabs from each window using `browser.tabs.query()`
3. **Extract Domains**: Parses URLs to identify unique domains, removing "www." prefixes
4. **Calculate Statistics**: Processes data to generate comprehensive statistics
5. **Display Results**: Presents information in an organized, easy-to-read format

## 🛡️ Permissions

The extension requires these permissions:

- **`tabs`**: To access information about open tabs across all windows
- **`activeTab`**: To interact with the currently active tab

*The extension only reads tab information and does not modify, store, or transmit any data.*

## 🚨 Troubleshooting

### Extension Icon Not Visible
- Click the puzzle piece icon (⋯) in the Firefox toolbar
- Find "Tab Stats Analyzer" and click the pin icon to make it visible

### "Error loading tab statistics"
- Ensure the extension has proper permissions
- Try refreshing by clicking the refresh button
- Restart Firefox and try again

### No Tabs Found
- This can happen if all tabs are special pages (like `about:` pages)
- Open some regular websites and refresh the statistics

### Extension Disappears After Firefox Restart
- This is normal for temporary installations
- Follow the installation steps again, or consider packaging for permanent installation

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

- Report bugs or issues
- Suggest new features
- Improve the user interface
- Add support for additional browsers
- Enhance documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Enhancements

Potential features for future versions:
- Export statistics to CSV/JSON
- Historical data tracking
- Tab grouping by domain
- Memory usage statistics
- Duplicate tab detection
- Custom domain filtering

## 📞 Support

If you encounter any issues or have questions:
- Check the troubleshooting section above
- Create an issue in the project repository
- Ensure you're using a supported Firefox version

---

**Happy tab analyzing!** 🚀