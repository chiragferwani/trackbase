/**
 * TrackBase SDK
 *
 * User tracking without the backend.
 * Store user signups directly in your Google Sheet via the TrackBase API.
 *
 * Usage:
 *   import { TrackBase } from "trackbase";
 *   const tb = new TrackBase({ apiKey: "trk_live_xxxxxxxxxxxxxxxxxxxxxxxx" });
 *   await tb.identify({ name: "Alice", email: "alice@example.com" });
 */

export interface TrackBaseConfig {
  /**
   * Your project API key, generated in the TrackBase dashboard.
   * Format: trk_live_xxxxxxxxxxxxxxxxxxxxxxxx
   */
  apiKey: string;

  /**
   * Base URL of your TrackBase instance.
   * Defaults to the hosted TrackBase API.
   * Override this when self-hosting TrackBase.
   */
  baseUrl?: string;
}

export interface AnalyticsResult {
  totalUsers: number;
  todayUsers: number;
  weeklyUsers: number;
  lastSignup: string | null;
}

export interface UserCountResult {
  totalUsers: number;
}

export interface IdentifyResult {
  status: "ok" | "exists" | "error";
  message?: string;
}

export class TrackBaseError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "TrackBaseError";
    this.statusCode = statusCode;
  }
}

const DEFAULT_BASE_URL = "https://trackbase.dev";

export class TrackBase {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: TrackBaseConfig) {
    if (!config.apiKey) {
      throw new TrackBaseError("apiKey is required");
    }
    if (!config.apiKey.startsWith("trk_live_")) {
      throw new TrackBaseError(
        'Invalid API key format. Expected format: "trk_live_xxxxxxxxxxxxxxxxxxxxxxxx"'
      );
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  /**
   * Internal fetch helper that attaches the Authorization header and
   * handles error responses uniformly.
   */
  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json() as { error?: string; message?: string };
        errorMessage = errorBody.error ?? errorBody.message ?? errorMessage;
      } catch {
        // Ignore JSON parse errors on error responses
      }
      throw new TrackBaseError(errorMessage, response.status);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Track a user signup or identify a user.
   *
   * Sends user data to TrackBase, which appends a row to the linked
   * Google Sheet. The fields must match the project's configured field list.
   *
   * @param data - Key-value pairs matching your project's configured fields
   * @returns { status: "ok" } on success, { status: "exists" } if duplicate prevention is enabled and the user already exists
   *
   * @example
   * await trackbase.identify({
   *   name: "Alice",
   *   email: "alice@example.com",
   *   college: "MIT",
   *   branch: "CS"
   * });
   */
  async identify(data: Record<string, string>): Promise<IdentifyResult> {
    return this.request<IdentifyResult>("/identify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get the total number of users tracked in this project.
   *
   * Reads the linked Google Sheet and counts data rows (excluding the header).
   *
   * @returns { totalUsers: number }
   *
   * @example
   * const { totalUsers } = await trackbase.userCount();
   * console.log(`${totalUsers} users so far!`);
   */
  async userCount(): Promise<UserCountResult> {
    return this.request<UserCountResult>("/users/count");
  }

  /**
   * Get full analytics for this project.
   *
   * Computes counts from the Timestamp column in the linked Google Sheet.
   * Results are cached for up to 60 seconds to avoid API rate limits.
   *
   * @returns { totalUsers, todayUsers, weeklyUsers, lastSignup }
   *
   * @example
   * const stats = await trackbase.analytics();
   * console.log(`${stats.todayUsers} signups today`);
   */
  async analytics(): Promise<AnalyticsResult> {
    return this.request<AnalyticsResult>("/analytics");
  }
}

// Default export for CommonJS convenience
export default TrackBase;
