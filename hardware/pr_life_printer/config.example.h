/*
 * PR LIFE printer — local configuration TEMPLATE.
 *
 * Copy this file to `config.h` (same folder) and fill in real values.
 * `config.h` is gitignored so your Wi-Fi password and device token never get
 * committed. Keep the structure identical so provisioning can be automated later.
 */
#pragma once

// ---- Wi-Fi (2.4 GHz only — the ESP32-WROOM-32 has no 5 GHz radio) ----------
#define WIFI_SSID      "your-2.4ghz-ssid"
#define WIFI_PASSWORD  "your-wifi-password"

// ---- PR Life API -----------------------------------------------------------
// No trailing slash. Use your deployed HTTPS origin.
#define API_BASE       "https://your-app.vercel.app"
// The dedicated device token (PRINTER_DEVICE_TOKEN in Vercel). The ONLY
// credential this device holds.
#define DEVICE_TOKEN   "paste-the-PRINTER_DEVICE_TOKEN-here"
// Logical printer id this device claims jobs for. Must match what PR Life
// queues against (default "desk").
#define DEVICE_ID      "desk"

// ---- Printer (Bluetooth Classic SPP) ---------------------------------------
// MAC most-significant byte first: 5A:4A:6A:78:45:0F
#define PRINTER_MAC_BYTES { 0x5A, 0x4A, 0x6A, 0x78, 0x45, 0x0F }
#define PRINTER_PIN    "1234"

// ---- Polling ---------------------------------------------------------------
#define POLL_INTERVAL_MS  7000   // 5000–10000 per the design (5–10s)
