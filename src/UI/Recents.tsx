import React, { useEffect, useMemo, useState } from "react";
import styles from "../Styles/Recents.module.css";
import { OnBrowserLocationTracker } from "../OnBrowserLocationTracker";
import { formatFriendlyTime } from "../TimeFormatter";
import NoRecents from "./NoRecents";
import { getFaviconUrl } from "../Utils/getFaviconUrl";

export interface Recent {
  windowTitle: string;
  url: string;
  lastVisited: string; // ISO string
}

export interface RecentsProps {
  onBeforeRemove?: (items: Recent[]) => boolean;
  namespace?: string;
  maxRecents?: number;
}

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const Recents: React.FC<RecentsProps> = ({
  onBeforeRemove,
  namespace,
  maxRecents = 10,
}) => {
  const [recents, setRecents] = useState<Recent[]>([]);

  const tracker = useMemo(() => {
    return new OnBrowserLocationTracker({
      maxRecents: maxRecents,
      namespace: namespace,
    });
  }, [maxRecents, namespace]);

  useEffect(() => {
    const loadRecents = async () => {
      const storedRecents = await tracker.getRecentsAsync();
      setRecents(storedRecents);
    };

    loadRecents();
  }, [tracker]);

  const handleRemoveRecent = (recent: Recent) => {
    const shouldRemove = onBeforeRemove ? onBeforeRemove([recent]) : true;
    if (!shouldRemove) return;

    setRecents((prevRecents) =>
      prevRecents.filter((item) => item.url !== recent.url)
    );
    tracker.removeRecent(recent.url);
  };

  const handleRemoveAll = () => {
    const shouldRemoveAll = onBeforeRemove ? onBeforeRemove(recents) : true;
    if (!shouldRemoveAll) return;

    setRecents([]);
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
        <ul className={styles.recentsList}>
          {recents.map((item, index) => (
            <li key={index} className={styles.recentItem}>
              <img
                src={getFaviconUrl(item.url)}
                alt="favicon"
                className={styles.favicon}
              />
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
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recents;

