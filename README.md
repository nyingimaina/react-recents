# OnBrowserLocationTracker and Recents Component

This package helps track the websites you've visited (URLs and window titles) and shows them in a React component. You can customize how many recent sites you want to keep and easily remove or clear them if needed.

## Features

- **OnBrowserLocationTracker**: Tracks the websites you've visited (URL and title) in `localStorage`.
- **Recents Component**: Displays the recent websites in a list. You can remove individual items or clear all of them.
- **Custom Rules**: You can control how many recents are stored and set rules to avoid tracking certain URLs or titles.

## How It Works

### Setting Up the Tracker

The `OnBrowserLocationTracker` is used to track your visited websites (URLs). Here's how you can set it up:

```ts
import { OnBrowserLocationTracker } from 'jattac.react.recents';

// Create a new tracker with a limit of 10 recents
const tracker = new OnBrowserLocationTracker({ maxRecents: 10 });

// Track the current page (URL and title) when you visit it
tracker.trackVisit({
  url: window.location.href, // Current page URL
  windowTitle: document.title, // Current page title
  lastVisited: new Date().toISOString(), // Current timestamp
});
```

### Configurations for `OnBrowserLocationTrackerConfig`

You can customize the behavior of the tracker with the following configuration options:

#### 1. `maxRecents` (required)

- **What is it?**: This option controls how many recent URLs and titles are kept in `localStorage`. Once this limit is reached, older items will be removed to make space for new ones.
- **Why is it useful?**: This helps prevent the storage from becoming too large. For example, if you only want to keep track of the 10 most recent websites, you can set `maxRecents: 10`.
- **Example**:
  ```ts
  const tracker = new OnBrowserLocationTracker({ maxRecents: 5 });
  ```

#### 2. `namespace` (optional)

- **What is it?**: This is an optional string value that adds a prefix to the key used in `localStorage`. If not provided, a default key is used.
- **Why is it useful?**: This is useful if you want to have different recents trackers for different sections of your app or for different users, without the data overwriting each other.
- **Example**:
  ```ts
  const tracker = new OnBrowserLocationTracker({ namespace: 'user1' });
  ```

#### 3. `dontTrack` (optional)

- **What is it?**: This config option allows you to specify rules for URLs or titles that shouldn't be tracked. You can filter URLs based on a prefix, suffix, or if they contain certain substrings.
- **Why is it useful?**: You might want to avoid tracking certain pages (e.g., login pages, privacy-sensitive pages, or pages with URLs you don't need in your recents).
- **Properties**:
  - **`withPrefix`**: An array of strings to match URLs that start with the specified prefix.
  - **`withSuffix`**: An array of strings to match URLs that end with the specified suffix.
  - **`contains`**: An array of strings to match URLs that contain the specified substring.
- **Example**:
  ```ts
  const tracker = new OnBrowserLocationTracker({
    dontTrack: {
      withPrefix: ['https://example.com/login'],
      withSuffix: ['/logout'],
      contains: ['secret'],
    },
  });
  ```

#### 4. `disregardQueryStrings` (optional)

- **What is it?**: This option allows you to specify which query strings should be disregarded when tracking URLs. You can provide an array of paths and query strings to exclude from the URL tracking.
- **Why is it useful?**: Sometimes URLs may contain dynamic query strings (e.g., session IDs, filters) that don't need to be tracked as they don't affect the actual page content you want to track.
- **Example**:
  ```ts
  const tracker = new OnBrowserLocationTracker({
    disregardQueryStrings: [{ path: '/products', queryStrings: ['sort', 'filter'] }],
  });
  ```

### Recents Component

The `Recents` component shows the recent websites you've visited. It loads this data from your browser's `localStorage` using the `OnBrowserLocationTracker`.

#### Example Usage:

```tsx
import React from 'react';
import { Recents } from 'jattac.react.recents';

const App: React.FC = () => {
  return (
    <div>
      <h1>Your Recent Activity</h1>
      <Recents
        onBeforeRemove={(items) => {
          // Optionally, ask the user before removing recents
          return window.confirm(`Are you sure you want to remove these recents?`);
        }}
      />
    </div>
  );
};

export default App;
```

#### Props for `Recents` Component

- **`onBeforeRemove` (optional)**: A function that runs before removing any recent items. It gets an array of items to be removed. If it returns `false`, the removal will be canceled.

```tsx
const onBeforeRemove = (items: Recent[]) => {
  // Do something before removing items
  return true; // return false to cancel removal
};
```

#### Available Methods

- **`trackVisit(location: ILocation): Promise<void>`**: Tracks a new location (URL and title).
- **`getRecentsAsync(): Promise<ILocation[]>`**: Fetches the list of recent locations.
- **`removeRecent(url: string): Promise<void>`**: Removes a specific recent location by its URL.
- **`clearRecents(): Promise<void>`**: Clears all stored recents.

#### Styling

You can customize how the `Recents` component looks by changing the CSS. The component uses the following classes:

- `.recentsContainer`
- `.recentsTitle`
- `.removeAllButton`
- `.recentItem`
- `.recentLink`
- `.timeLabel`
- `.removeButton`
- `.noRecents`
- `.noRecentsText`

You can change these styles by editing the `Recents.module.css` file or by writing your own styles.

#### Example Styles (for reference):

```css
.recentsContainer {
  padding: 16px;
  font-family: Arial, sans-serif;
}

.recentsTitle {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.removeAllButton {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.recentItem {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.recentLink {
  color: #007bff;
  text-decoration: none;
}

.removeButton {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: red;
}

.noRecents {
  text-align: center;
}

.noRecentsText {
  font-size: 1.2em;
  color: gray;
}
```

## Contributing

If you have any suggestions, bug fixes, or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
