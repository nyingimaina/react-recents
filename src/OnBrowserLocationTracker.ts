import ILocation from './ILocation';

interface ITrackable {
  urlOrTitle?: string;
  url?: string;
}

export interface OnBrowserLocationTrackerConfig {
  maxRecents: number; // Maximum number of recents to keep
  namespace?: string;
  dontTrack?: {
    withPrefix?: ITrackable[];
    withSuffix?: ITrackable[];
    contains?: ITrackable[];
  };

  disregardQueryStrings?: { path: string; queryStrings: string[] }[];
}

const defaultNamespace = 'global';

export class OnBrowserLocationTracker {
  private storageKey = 'recents';
  private titleObserver: MutationObserver | null = null;
  private config: OnBrowserLocationTrackerConfig;
  private static _namespace: string = '';

  constructor(config: OnBrowserLocationTrackerConfig) {
    this.config = config;
    if (!OnBrowserLocationTracker._namespace) {
      if (this.config.namespace) {
        OnBrowserLocationTracker._namespace = this.config.namespace;
      } else {
        OnBrowserLocationTracker._namespace = defaultNamespace;
      }
    }
  }

  public static get namespace(): string {
    if (this._namespace) {
      return this._namespace;
    } else {
      return defaultNamespace;
    }
  }

  private get fullStorageKey(): string {
    return `${OnBrowserLocationTracker.namespace}_${this.storageKey}`;
  }

  private async getStoredRecents(): Promise<ILocation[]> {
    const data = localStorage.getItem(this.fullStorageKey);
    const result = (data ? JSON.parse(data) : []) as ILocation[];
    const validRecents = result
      .filter((a: ILocation) => this.isValid(a))
      .sort((a: ILocation, b: ILocation) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime());
    const uniqueByDisplayLabel = [...new Map(validRecents.map((item: ILocation) => [item.windowTitle, item])).values()];
    return uniqueByDisplayLabel;
  }

  private isValid(location: ILocation): boolean {
    return location.url && location.windowTitle ? true : false;
  }

  private async saveRecents(recents: ILocation[]): Promise<void> {
    const validRecents = recents.filter((a: ILocation) => this.isValid(a));
    localStorage.setItem(this.fullStorageKey, JSON.stringify(validRecents));
  }

  private shouldTrack(location: ILocation): boolean {
    if (!this.config.dontTrack) return true; // If no dontTrack rules, always track

    const { withPrefix, withSuffix, contains } = this.config.dontTrack;

    // Helper function to check a condition
    const matchesCondition = (value: string | undefined, patterns: ITrackable[]): boolean => {
      if (!value || !patterns) return false;
      return patterns.some((pattern) => {
        const { urlOrTitle: title, url } = pattern;
        return (title && value.startsWith(title)) || (url && value.startsWith(url));
      });
    };

    const matchables = [withPrefix, withSuffix, contains];

    for (let i = 0; i < matchables.length; i++) {
      const specificMatchable = matchables[i] ?? [];
      const foundMatch =
        matchesCondition(location.url, specificMatchable) || matchesCondition(location.windowTitle, specificMatchable);
      if (foundMatch) {
        return false;
      }
    }
    return true;
  }

  async trackVisit(location: ILocation): Promise<void> {
    location.url = this.processUrlForTracking(location.url);
    if (!this.shouldTrack(location)) return; // Skip tracking if location matches dontTrack rules

    const recents = await this.getStoredRecents();

    // Remove any existing entry for the same URL
    const updatedRecents = recents.filter((r) => r.url !== location.url);

    // Add the new location to the top
    updatedRecents.unshift(location);

    // Enforce the limit
    if (updatedRecents.length > this.config.maxRecents) {
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
    localStorage.removeItem(this.fullStorageKey);
  }

  getCurrentLocation(): ILocation | null {
    // Ensure document is ready before accessing title
    if (!window.location.href) return null;

    // Check if the document is fully loaded before accessing <title>
    if (document.readyState === 'complete') {
      this.observeTitleChange();
    } else {
      // If the document is not fully loaded, listen for the load event
      window.addEventListener('load', () => this.observeTitleChange());
    }

    return null; // MutationObserver will handle updates
  }

  /**
   * Processes the URL for tracking, taking into account the disregardQueryStrings configuration.
   * @param url The URL to process.
   * @returns The processed URL.
   */
  private processUrlForTracking(url: string): string {
    if (!this.config.disregardQueryStrings) return url;

    const urlObj = new URL(url);
    const path = urlObj.pathname;

    this.config.disregardQueryStrings.forEach(({ path: disregardPath, queryStrings }) => {
      if (path.startsWith(disregardPath)) {
        queryStrings.forEach((queryString) => {
          urlObj.searchParams.delete(queryString);
        });
      }
    });

    return urlObj.toString();
  }

  private observeTitleChange(): void {
    const titleElement = document.querySelector('title');

    // Fallback if the title is not available
    if (!titleElement) {
      // If no title tag found, observe the <head> element instead
      const headElement = document.querySelector('head');

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
      title = title.substring(0, maxTitleLength) + '...';
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
