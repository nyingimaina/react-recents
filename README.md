# OnBrowserLocationTracker and Recents Component

This package helps track the websites you've visited (URLs and window titles) and shows them in a React component. It allows you to customize how many recents you want to keep, and you can remove or clear them if needed.

## Features

- **OnBrowserLocationTracker**: Tracks the websites you've visited (URL and title) in `localStorage`.
- **Recents Component**: Shows the recent websites in a list. You can remove individual items or clear all of them.
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
