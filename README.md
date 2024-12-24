
# OnBrowserLocationTracker and Recents Component

This package provides a utility for tracking recent browser locations (URLs and window titles) and a React component for displaying them. It allows for a configurable number of recent locations and enables you to track, remove, and clear recents.

## Features

- **OnBrowserLocationTracker**: Tracks recent URLs and window titles in `localStorage`.
- **Recents Component**: Displays the tracked recents in a React component, with options to remove individual entries or clear all recents.
- **Customization**: You can customize how many recents are stored and apply rules to prevent tracking specific URLs or titles.

## Installation

To install the package, run the following command:

```bash
npm install on-browser-location-tracker
```

## Usage

### Setting Up the Tracker

You can use the `OnBrowserLocationTracker` class to track recent locations. Here's an example of how to instantiate it and track a visit:

```ts
import { OnBrowserLocationTracker } from "on-browser-location-tracker";

const tracker = new OnBrowserLocationTracker({ maxRecents: 10 });

// Track a new location (e.g., from a window or URL change)
tracker.trackVisit({
  url: window.location.href,
  windowTitle: document.title,
  lastVisited: new Date().toISOString(),
});
```

### Recents Component

The `Recents` component displays the recent locations in a list. It automatically loads the stored recents from `localStorage` using the `OnBrowserLocationTracker`.

#### Example Usage:

```tsx
import React from "react";
import Recents from "on-browser-location-tracker/Recents";

const App: React.FC = () => {
  return (
    <div>
      <h1>Your Recent Activity</h1>
      <Recents
        onBeforeRemove={(items) => {
          // Optionally, check before removing items (returns true to proceed)
          return window.confirm(`Are you sure you want to remove these recents?`);
        }}
      />
    </div>
  );
};

export default App;
```

#### Props for `Recents` Component

- **`onBeforeRemove` (optional)**: A callback function that is called before removing an item or clearing all recents. It receives an array of recents to be removed. If it returns `false`, the removal is cancelled.

```tsx
const onBeforeRemove = (items: Recent[]) => {
  // Perform custom logic before removing recents
  return true; // return false to prevent removal
};
```

#### Available Methods

- **`trackVisit(location: ILocation): Promise<void>`**: Tracks a new location.
- **`getRecentsAsync(): Promise<ILocation[]>`**: Retrieves the list of recent locations.
- **`removeRecent(url: string): Promise<void>`**: Removes a specific recent location by URL.
- **`clearRecents(): Promise<void>`**: Clears all recent locations.

#### Styling

You can customize the appearance of the `Recents` component using CSS. The `Recents` component uses the following CSS classes:

- `.recentsContainer`
- `.recentsTitle`
- `.removeAllButton`
- `.recentItem`
- `.recentLink`
- `.timeLabel`
- `.removeButton`
- `.noRecents`
- `.noRecentsText`

You can override these classes by editing the `Recents.module.css` file or writing your own styles.

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

Feel free to open an issue or submit a pull request if you have suggestions, bug fixes, or improvements.

## License

This project is licensed under the MIT License.
