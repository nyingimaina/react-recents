import ILocation from "./ILocation";

interface ITrackable {
  urlOrTitle?: string;
  url?: string;
}

export interface OnBrowserLocationTrackerConfig {
  maxRecents: number; // Maximum number of recents to keep
  dontTrack?: {
    withPrefix?: ITrackable[];
    withSuffix?: ITrackable[];
    contains?: ITrackable[];
  };
}

export class OnBrowserLocationTracker {
  private storageKey = "recents";
  private maxRecents: number;
  private titleObserver: MutationObserver | null = null;
  private dontTrack?: {
    withPrefix?: ITrackable[];
    withSuffix?: ITrackable[];
    contains?: ITrackable[];
  };

  constructor(config: OnBrowserLocationTrackerConfig) {
    this.maxRecents = config.maxRecents;
    this.dontTrack = config.dontTrack;
  }

  private async getStoredRecents(): Promise<ILocation[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private async saveRecents(recents: ILocation[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(recents));
  }

  private shouldTrack(location: ILocation): boolean {
    debugger;
    if (!this.dontTrack) return true; // If no dontTrack rules, always track

    const { withPrefix, withSuffix, contains } = this.dontTrack;

    // Helper function to check a condition
    const matchesCondition = (
      value: string | undefined,
      patterns: ITrackable[]
    ): boolean => {
      if (!value || !patterns) return false;
      return patterns.some((pattern) => {
        const { urlOrTitle: title, url } = pattern;
        return (
          (title && value.startsWith(title)) || (url && value.startsWith(url))
        );
      });
    };

    const matchables = [withPrefix, withSuffix, contains];

    for (let i = 0; i < matchables.length; i++) {
      const specificMatchable = matchables[i] ?? [];
      const foundMatch =
        matchesCondition(location.url, specificMatchable) ||
        matchesCondition(location.windowTitle, specificMatchable);
      if (foundMatch) {
        return false;
      }
    }
    return true;
  }

  async trackVisit(location: ILocation): Promise<void> {
    if (!this.shouldTrack(location)) return; // Skip tracking if location matches dontTrack rules

    const recents = await this.getStoredRecents();

    // Remove any existing entry for the same URL
    const updatedRecents = recents.filter((r) => r.url !== location.url);

    // Add the new location to the top
    updatedRecents.unshift(location);

    // Enforce the limit
    if (updatedRecents.length > this.maxRecents) {
      updatedRecents.pop();
    }

    await this.saveRecents(updatedRecents);
  }

  async getRecentsAsync(): Promise<ILocation[]> {
    return await this.getStoredRecents();
  }

  async removeRecent(url: string): Promise<void> {
    const recents = await this.getStoredRecents();
    const updatedRecents = recents.filter((recent) => recent.url !== url);
    await this.saveRecents(updatedRecents);
  }

  async clearRecents(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  getCurrentLocation(): ILocation | null {
    // Ensure document is ready before accessing title
    if (!window.location.href) return null;

    // Check if the document is fully loaded before accessing <title>
    if (document.readyState === "complete") {
      this.observeTitleChange();
    } else {
      // If the document is not fully loaded, listen for the load event
      window.addEventListener("load", () => this.observeTitleChange());
    }

    return null; // MutationObserver will handle updates
  }

  private observeTitleChange(): void {
    const titleElement = document.querySelector("title");

    // Fallback if the title is not available
    if (!titleElement) {
      // If no title tag found, observe the <head> element instead
      const headElement = document.querySelector("head");

      if (!headElement) return;

      if (!this.titleObserver) {
        this.titleObserver = new MutationObserver(() => {
          const title = document.title;
          this.updateLocation(title);
        });

        // Observe changes in the <head> element to detect changes in the title
        this.titleObserver.observe(headElement, {
          childList: true, // Watch for changes in child elements like <title>
          subtree: true, // Watch all descendants, including the title tag
        });
      }
    } else {
      // Directly update if the <title> is available
      const title = document.title;
      this.updateLocation(title);
    }
  }

  private async updateLocation(title: string): Promise<void> {
    const maxTitleLength: number = 45;

    if (!title) return;

    // Truncate title if it exceeds max length and add ellipses
    if (title.length > maxTitleLength) {
      title = title.substring(0, maxTitleLength) + "...";
    }

    const location: ILocation = {
      windowTitle: title,
      url: window.location.href,
      lastVisited: new Date().toISOString(),
    };

    // Track the visit and persist the location
    await this.trackVisit(location);
  }
}
