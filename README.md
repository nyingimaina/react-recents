# React Recents: Track and Display User Navigation

`jattac.react.recents` is a lightweight and flexible React library that allows you to track a user's browsing history within your application and display it in a polished and customizable "Recently Visited" component.

It's designed to be easy to use, mobile-first, and highly configurable to fit the needs of your project.

![Recents Component Screenshot](https://i.imgur.com/your-screenshot.png) <!-- TODO: Add a real screenshot -->

## Features

- **📝 LocalStorage Tracking**: Persists recent locations in the user's browser.
- **⚛️ React Components**: Includes a `Recents` component to display activity and a `withLocationTracking` HOC for automatic tracking.
- **⚙️ Highly Configurable**: Control the number of recents, create separate tracking namespaces, and define rules to exclude specific URLs or query parameters.
- **🎨 Customizable UI**: Style the component to match your application's look and feel using CSS Modules.
- **📱 Mobile-First Design**: The component is responsive and optimized for both mobile and desktop screens.
- **✨ Modern Look & Feel**: Includes favicons, smooth animations, and a clean UI out of the box.

## Installation

Install the package using npm or yarn:

```bash
npm install jattac.react.recents
```

```bash
yarn add jattac.react.recents
```

## Core Concepts

The library is split into two main parts:

1.  **`OnBrowserLocationTracker`**: A powerful class for the core tracking logic. You can use it to manually track visits, retrieve the list of recents, and manage the stored data.
2.  **`Recents` Component**: A React component that uses the tracker to automatically fetch and display the list of recently visited pages in a user-friendly interface.

---

## `Recents` Component Guide

This is the quickest way to get up and running. The `Recents` component is a ready-to-use UI element that handles everything for you.

### Basic Usage

Import the `Recents` component and add it to your application.

```tsx
import React from 'react';
import { Recents } from 'jattac.react.recents';

const MyDashboard = () => {
  return (
    <div>
      <h1>Welcome Back!</h1>
      
      {/* Your other dashboard components */}
      
      <div style={{ marginTop: '40px' }}>
        <Recents />
      </div>
    </div>
  );
};

export default MyDashboard;
```

### Component Props

You can customize the `Recents` component with the following props:

| Prop             | Type                               | Default | Description                                                                                                                            |
| ---------------- | ---------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `maxRecents`     | `number`                           | `10`    | The maximum number of recent items to store and display.                                                                               |
| `namespace`      | `string`                           | `global`| A string to namespace the storage key. Use this if you need multiple, separate trackers in the same app.                               |
| `onBeforeRemove` | `(items: Recent[]) => boolean` | `() => true` | A callback function that fires before items are removed. Return `false` from this function to cancel the removal. `items` is an array of the items to be removed. |

### Examples

#### Limiting the Number of Recents

Use the `maxRecents` prop to control how many items are kept in the history.

```tsx
<Recents maxRecents={5} />
```

#### Adding a Confirmation Before Removal

Use the `onBeforeRemove` prop to ask the user for confirmation before clearing items.

```tsx
const handleBeforeRemove = (itemsToRemove) => {
  if (itemsToRemove.length > 1) {
    // For "Clear All"
    return window.confirm(`Are you sure you want to clear all ${itemsToRemove.length} items?`);
  } else {
    // For a single item
    return window.confirm(`Are you sure you want to remove "${itemsToRemove[0].windowTitle}"?`);
  }
};

<Recents onBeforeRemove={handleBeforeRemove} />
```

---

## `OnBrowserLocationTracker` Guide

For more advanced or manual control, you can use the `OnBrowserLocationTracker` class directly.

### Configuration

When creating a tracker instance, you pass a configuration object with the following options:

| Property                 | Type                                           | Required | Description                                                                                             |
| ------------------------ | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `maxRecents`             | `number`                                       | **Yes**  | The maximum number of recent items to store.                                                            |
| `namespace`              | `string`                                       | No       | A string to namespace the `localStorage` key.                                                           |
| `dontTrack`              | `object`                                       | No       | An object with rules to prevent certain URLs or titles from being tracked.                              |
| `disregardQueryStrings`  | `array`                                        | No       | An array of rules to ignore specific query strings from URLs before tracking.                           |

### Examples

#### Basic Initialization

```ts
import { OnBrowserLocationTracker } from 'jattac.react.recents';

const tracker = new OnBrowserLocationTracker({ maxRecents: 15 });
```

#### Excluding URLs with `dontTrack`

Prevent tracking for pages like login, settings, or any page containing 'secret'.

```ts
const tracker = new OnBrowserLocationTracker({
  maxRecents: 10,
  dontTrack: {
    // Matches from the start of the string
    withPrefix: [{ url: 'https://example.com/login' }, { windowTitle: 'Settings' }],
    // Matches from the end of the string
    withSuffix: [{ url: '/logout' }],
    // Matches if the substring exists anywhere
    contains: [{ urlOrTitle: 'secret' }]
  }
});
```

#### Ignoring Query Strings with `disregardQueryStrings`

This is useful for ignoring session IDs, tracking parameters, or filters, ensuring that ` /products?sort=price` and ` /products?sort=name` are treated as the same URL.

```ts
const tracker = new OnBrowserLocationTracker({
  maxRecents: 10,
  disregardQueryStrings: [
    // For the /products path, ignore 'sort' and 'filter' query params
    { path: '/products', queryStrings: ['sort', 'filter'] },
    // For all paths, ignore 'utm_source' and 'session_id'
    { path: '/', queryStrings: ['utm_source', 'session_id'] }
  ]
});
```

### Manual Tracking

To track a visit, you need to provide an `ILocation` object.

```ts
interface ILocation {
  url: string;
  windowTitle: string;
  lastVisited: string; // ISO 8601 timestamp
}

tracker.trackVisit({
  url: window.location.href,
  windowTitle: document.title,
  lastVisited: new Date().toISOString(),
});
```

---

## Automatic Tracking with `withLocationTracking` HOC

To automatically track all navigation within your app, you can use the `withLocationTracking` Higher-Order Component (HOC).

Wrap your root component (or any component that is always mounted) with the HOC and provide it with your tracker configuration.

```tsx
// In your App.js or a layout component
import React from 'react';
import { withLocationTracking } from 'jattac.react.recents';

const App = () => {
  // Your app's content
  return <div>...</div>;
};

// Configuration for the tracker
const trackerConfig = {
  maxRecents: 20,
  dontTrack: { contains: [{ urlOrTitle: 'Admin' }] }
};

// Wrap your component with the HOC
export default withLocationTracking(App, trackerConfig);
```

## Styling and Customization

The component uses CSS Modules to avoid style conflicts. While the default styling is designed to be clean and modern, you can easily override it.

### Overriding Styles

To override the styles, target the generated class names in your own CSS file. You can inspect the component in your browser's developer tools to find the exact class names.

For example, to change the color of the "Clear All" button:

```css
/* In your global CSS file */
.Recents_removeAllButton__XYZ123 {
  background-color: #007bff !important; /* Use a more specific selector if possible */
  color: white !important;
}
```

### Key CSS Classes

Here are the main classes used in the component:

- `.recentsContainer`: The main container.
- `.recentsTitle`: The "Recently Visited" title.
- `.removeAllButton`: The "Clear All" button.
- `.recentsList`: The `<ul>` element for the list.
- `.recentItem`: Each `<li>` list item.
- `.favicon`: The website favicon image.
- `.recentLink`: The `<a>` tag for the link.
- `.timeLabel`: The timestamp text.
- `.removeButton`: The trash icon button for removing a single item.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/nyingimaina/react-recents/issues).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.