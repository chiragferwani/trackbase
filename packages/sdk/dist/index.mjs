// src/index.ts
var TrackBaseError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "TrackBaseError";
    this.statusCode = statusCode;
  }
};
var DEFAULT_BASE_URL = "https://trackbase.dev";
var TrackBase = class {
  constructor(config) {
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
  async request(path, options) {
    const url = `${this.baseUrl}/api/v1${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options?.headers
      }
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error ?? errorBody.message ?? errorMessage;
      } catch {
      }
      throw new TrackBaseError(errorMessage, response.status);
    }
    return response.json();
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
  async identify(data) {
    return this.request("/identify", {
      method: "POST",
      body: JSON.stringify(data)
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
  async userCount() {
    return this.request("/users/count");
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
  async analytics() {
    return this.request("/analytics");
  }
};
var index_default = TrackBase;
export {
  TrackBase,
  TrackBaseError,
  index_default as default
};
