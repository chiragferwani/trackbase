#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_commander = require("commander");
var import_inquirer = __toESM(require("inquirer"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_crypto = __toESM(require("crypto"));
var program = new import_commander.Command();
program.name("trackbase").description("TrackBase CLI to initialize your Google Sheets user database").version("0.1.0");
program.command("init").description("Initialize a new TrackBase project").action(async () => {
  console.log("\n\u{1F680} Welcome to TrackBase!");
  console.log("Let's set up your Google Sheets user tracking system.\n");
  const answers = await import_inquirer.default.prompt([
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
  const apiKey = "trk_live_" + import_crypto.default.randomBytes(16).toString("hex");
  const config = {
    projectName: answers.projectName,
    apiKey,
    sheetId,
    fields: fieldsArray
  };
  const configPath = import_path.default.join(process.cwd(), "trackbase.config.json");
  import_fs.default.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
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
