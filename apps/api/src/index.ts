import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load TrackBase Config
const configPath = path.resolve(process.cwd(), "trackbase.config.json");
let config: any = null;

try {
  const configFile = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(configFile);
} catch (e) {
  console.error("Could not load trackbase.config.json. Make sure you have initialized the project.");
}

// Google Sheets Auth
const getSheetsClient = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any });
};

// Middleware: API Key Validation
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7).trim();
  const validKey = process.env.TRACKBASE_API_KEY || config?.apiKey;

  if (token !== validKey) {
    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
  }

  next();
};

app.post("/api/v1/identify", requireAuth, async (req, res) => {
  try {
    if (!config) throw new Error("Config not found");

    const data = req.body;
    const { sheetId, fields } = config;

    const row = fields.map((f: string) => data[f] || "");
    const timestamp = new Date().toISOString();
    row.unshift(timestamp); // Add timestamp at column A

    const sheets = await getSheetsClient();
    
    // Ensure header row exists
    try {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:A1",
      });
      if (!existing.data.values || existing.data.values.length === 0) {
        const headerRow = ["Timestamp", ...fields];
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: "Sheet1!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headerRow] },
        });
      }
    } catch (e) {
      // Ignore if sheet doesn't exist or is empty
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:A",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    res.json({ status: "ok" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/v1/users/count", requireAuth, async (req, res) => {
  try {
    if (!config) throw new Error("Config not found");

    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: "Sheet1!A:A",
    });

    const rows = response.data.values || [];
    const count = rows.length > 1 ? rows.length - 1 : 0;

    res.json({ totalUsers: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/v1/analytics", requireAuth, async (req, res) => {
  try {
    if (!config) throw new Error("Config not found");

    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: "Sheet1!A:A",
    });

    const rows = response.data.values || [];
    const count = rows.length > 1 ? rows.length - 1 : 0;
    
    // Calculate today and weekly based on timestamp in column A
    let todayUsers = 0;
    let weeklyUsers = 0;
    let lastSignup = null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = 1; i < rows.length; i++) {
      const dateStr = rows[i][0];
      if (dateStr) {
        lastSignup = dateStr;
        const d = new Date(dateStr);
        if (d >= todayStart) todayUsers++;
        if (d >= weekStart) weeklyUsers++;
      }
    }

    res.json({
      totalUsers: count,
      todayUsers,
      weeklyUsers,
      lastSignup,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TrackBase API listening on port ${PORT}`);
});
