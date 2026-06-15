# trackbase

**User tracking without the backend.**

TrackBase lets you track user signups and view analytics by using **Google Sheets** as the storage layer — no database, no Firebase/Supabase setup required.

## Installation

```bash
npm install trackbase
```

## Quick Start

1. Create a project at [trackbase.dev](https://trackbase.dev)
2. Connect your Google Sheet
3. Copy your API key
4. Install the SDK and start tracking

```typescript
import { TrackBase } from "trackbase";

const trackbase = new TrackBase({
  apiKey: "trk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
});

// Track a user signup
await trackbase.identify({
  name: "Alice",
  email: "alice@example.com",
  college: "MIT",
  branch: "Computer Science"
});

// Get user count
const { totalUsers } = await trackbase.userCount();
console.log(`${totalUsers} users so far!`);

// Get full analytics
const stats = await trackbase.analytics();
console.log(stats);
// {
//   totalUsers: 142,
//   todayUsers: 12,
//   weeklyUsers: 47,
//   lastSignup: "2026-06-15"
// }
```

## API Reference

### `new TrackBase(config)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | ✅ | Your project API key (`trk_live_...`) |
| `baseUrl` | `string` | ❌ | Override for self-hosted instances |

### `identify(data)`

Track a user signup. `data` is a key-value object matching your project's configured fields.

Returns `{ status: "ok" }` or `{ status: "exists" }` if duplicate prevention is enabled.

### `userCount()`

Returns `{ totalUsers: number }` — the count of all tracked users.

### `analytics()`

Returns aggregate analytics computed from your Google Sheet's Timestamp column:

```typescript
{
  totalUsers: number;
  todayUsers: number;
  weeklyUsers: number;
  lastSignup: string | null;
}
```

## Self-Hosting

Point the SDK to your own TrackBase instance:

```typescript
const trackbase = new TrackBase({
  apiKey: "trk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
  baseUrl: "https://your-trackbase.example.com"
});
```

## License

MIT
