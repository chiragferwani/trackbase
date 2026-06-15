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
interface TrackBaseConfig {
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
interface AnalyticsResult {
    totalUsers: number;
    todayUsers: number;
    weeklyUsers: number;
    lastSignup: string | null;
}
interface UserCountResult {
    totalUsers: number;
}
interface IdentifyResult {
    status: "ok" | "exists" | "error";
    message?: string;
}
declare class TrackBaseError extends Error {
    readonly statusCode?: number;
    constructor(message: string, statusCode?: number);
}
declare class TrackBase {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(config: TrackBaseConfig);
    /**
     * Internal fetch helper that attaches the Authorization header and
     * handles error responses uniformly.
     */
    private request;
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
    identify(data: Record<string, string>): Promise<IdentifyResult>;
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
    userCount(): Promise<UserCountResult>;
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
    analytics(): Promise<AnalyticsResult>;
}

export { type AnalyticsResult, type IdentifyResult, TrackBase, type TrackBaseConfig, TrackBaseError, type UserCountResult, TrackBase as default };
