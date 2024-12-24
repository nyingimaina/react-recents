import React, { useEffect, useState } from "react";
import styles from "../Styles/Recents.module.css";
import { OnBrowserLocationTracker } from "../OnBrowserLocationTracker";
import { formatFriendlyTime } from "../TimeFormatter";
import NoRecents from "./NoRecents";

export interface Recent {
  windowTitle: string;
  url: string;
  lastVisited: string; // ISO string
}

export interface RecentsProps {
  onBeforeRemove?: (items: Recent[]) => boolean;
}

const Recents: React.FC<RecentsProps> = ({ onBeforeRemove }) => {
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    const tracker = new OnBrowserLocationTracker({ maxRecents: 10 });

    const loadRecents = async () => {
      const storedRecents = await tracker.getRecentsAsync();
      setRecents(storedRecents);
    };

    loadRecents();
  }, []);

  const handleRemoveRecent = (recent: Recent) => {
    const shouldRemove = onBeforeRemove ? onBeforeRemove([recent]) : true;
    if (!shouldRemove) return;

    setRecents((prevRecents) =>
      prevRecents.filter((item) => item.url !== recent.url)
    );
    // Update tracker storage if needed
    const tracker = new OnBrowserLocationTracker({ maxRecents: 10 });
    tracker.removeRecent(recent.url);
  };

  const handleRemoveAll = () => {
    const shouldRemoveAll = onBeforeRemove ? onBeforeRemove(recents) : true;
    if (!shouldRemoveAll) return;

    setRecents([]);
    // Update tracker storage if needed
    const tracker = new OnBrowserLocationTracker({ maxRecents: 10 });
    tracker.clearRecents();
  };

  return (
    <div className={styles.recentsContainer}>
      <h2 className={styles.recentsTitle}>
        Recently Visited
        {recents.length > 0 && (
          <button
            onClick={handleRemoveAll}
            className={styles.removeAllButton}
            title="Remove all recents"
          >
            Clear All
          </button>
        )}
      </h2>
      {recents.length === 0 ? (
        <div className={styles.noRecents}>
          <NoRecents />
          <p className={styles.noRecentsText}>
            No recent activity yet. Start browsing to see your recent history
            here!
          </p>
        </div>
      ) : (
        recents.map((item, index) => (
          <div key={index} className={styles.recentItem}>
            <a href={item.url} className={styles.recentLink}>
              {item.windowTitle}
            </a>
            <span className={styles.timeLabel}>
              {formatFriendlyTime(item.lastVisited)}
            </span>
            <button
              onClick={() => handleRemoveRecent(item)}
              className={styles.removeButton}
              title="Remove this recent"
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Recents;
