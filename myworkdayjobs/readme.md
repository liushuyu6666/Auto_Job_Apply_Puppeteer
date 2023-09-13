# Overview
After exploring, I found the "myworkdayjobs" is a SPA and everytime when we search for job positions, it will call an API to get the result. The class `MyWorkDayJobs` mimic the process to fetch the API and get the result automatically.


# Exploration on Each Page
## Search Job Pages
### Pagination
Navigating between different pages on their job search interface does not alter the URL, suggesting that the website employs a Single Page Application (SPA) framework or a comparable client-side rendering mechanism. Upon inspecting the network activity, it's evident that while the endpoint remains consistent, distinct parameters accompany each API request during page transitions.

### Dropdown List
![dropdown list attached](static/dropdown_list_attached_myworkdayjobs.png)

After selecting the "Location" button, a dropdown menu appears with various locations. To extract the location data along with their corresponding IDs, it's essential to determine the origin of this data. We've identified three potential sources:

1. **Dynamic API Calls**: The location data might be fetched from a server in real-time.
   * Action: Navigate to the browser's developer tools and access the 'Network' tab. Filter the results by "fetch/XHR" to inspect potential API calls.
2. **Hidden Content**: The data could already be present within the page's HTML but set to be invisible using CSS.
   * Action: Examine the page's source code and look for any elements that may contain the data but are hidden.
3. **JavaScript Rendering**: The list could be dynamically rendered onto the page using JavaScript upon clicking the button. The rendering can stem from two types of JavaScript module imports:
   1. **Static Import**: The module is loaded initially at build time, they will typically be part of the initial chunks or bundles.
      * Action: Inspect the "Sources" tab in the browser's developer tools. Check the initially loaded JavaScript files or chunks to identify the module's content.
   2. **Dynamic Import**: The module isn't loaded initially but only when it's needed (at runtime), which means there would typically be **an additional network request** to fetch that module.
      * Action: After opening the dropdown list, monitor the 'Network' tab in the browser's developer tools for any new JavaScript requests, indicating a dynamic import.