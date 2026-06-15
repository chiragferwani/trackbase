#!/usr/bin/env node

// src/cli.ts
import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
var program = new Command();
program.name("trackbase").description("TrackBase CLI to initialize your Google Sheets user database").version("0.1.0");
program.command("init").description("Initialize a new TrackBase project").action(async () => {
  console.log("\n\u{1F680} Welcome to TrackBase!");
  console.log("Let's set up your Google Sheets user tracking system.\n");
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project Name:",
      default: "My App"
    },
    {
      type: "input",
      name: "fields",
      message: "What fields do you want to track? (comma separated):",
      default: "name,email"
    },
    {
      type: "input",
      name: "sheetUrl",
      message: "Paste your Google Sheet URL:",
      validate: (input) => {
        if (!input.includes("docs.google.com/spreadsheets/d/")) {
          return "Please provide a valid Google Sheets URL.";
        }
        return true;
      }
    }
  ]);
  const match = answers.sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = match ? match[1] : null;
  if (!sheetId) {
    console.error("\u274C Could not extract Sheet ID from URL.");
    process.exit(1);
  }
  const fieldsArray = answers.fields.split(",").map((f) => f.trim()).filter((f) => f.length > 0);
  const apiKey = "trk_live_" + crypto.randomBytes(16).toString("hex");
  const config = {
    projectName: answers.projectName,
    apiKey,
    sheetId,
    fields: fieldsArray
  };
  const configPath = path.join(process.cwd(), "trackbase.config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  console.log("\n\u2705 Configuration saved to trackbase.config.json!");
  console.log(`
\u{1F511} Your API Key: ${apiKey}`);
  console.log("\n\u26A0\uFE0F  IMPORTANT NEXT STEPS \u26A0\uFE0F\n");
  console.log("1. Share your Google Sheet with the TrackBase service account:");
  console.log("   trackbase@trackbase-499515.iam.gserviceaccount.com");
  console.log("\n2. Add the API Key to your environment variables:");
  console.log(`   TRACKBASE_API_KEY=${apiKey}
`);
  console.log("3. Start tracking users in your app:");
  console.log(`
  import { TrackBase } from "trackbase";

  const trackbase = new TrackBase({
    apiKey: process.env.TRACKBASE_API_KEY,
  });

  await trackbase.identify({
    ${fieldsArray.map((f) => `${f}: "..."`).join(",\n    ")}
  });
`);
});
program.parse(process.argv);
