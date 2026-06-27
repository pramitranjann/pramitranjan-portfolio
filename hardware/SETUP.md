# PR Life desk printer — setup & troubleshooting

A wall-powered ESP32 sits at your desk, polls PR Life over Wi-Fi for queued
receipts, and prints them on the 58 mm Bluetooth thermal printer. PR Life is the
brain; the ESP32 is a dumb output device that only holds a single device token.

```
Task queued in PR Life ─▶ ESP32 polls /printer/claim (HTTPS, every ~7s)
   ─▶ ESP32 leases ONE job ─▶ prints payload over Bluetooth (ESC/POS)
   ─▶ ESP32 reports /printer/complete ─▶ PR Life records final state
```

## Hardware profile (this printer)

| | |
|---|---|
| Printer | 58 mm BT thermal, controller YICHIP YC3121 |
| Bluetooth | **Classic / SPP** (legacy PIN pairing) |
| MAC | `5A:4A:6A:78:45:0F` |
| Pairing PIN | `1234` |
| Data | raw **ESC/POS** (confirmed over USB; SPP pending on-chip test) |
| ESP32 | ESP32-DevKitC (ESP32-WROOM-32) |

> macOS cannot drive this printer over Bluetooth (Apple dropped SPP printer
> support and mislabels it as a "keyboard"). That's irrelevant — the ESP32
> connects via SPP by MAC + PIN and ignores all of that.

## One-time: Arduino IDE setup

1. Install the **Arduino IDE**.
2. **Boards Manager** → install **esp32 by Espressif** (core 3.x).
3. **Library Manager** → install **ArduinoJson** (v7+).
4. Board: **ESP32 Dev Module**. Select the serial port for your DevKitC.

## Step 1 — Prove the printer works (compatibility test)

Run this **before** anything else. It is standalone (Bluetooth only, no Wi-Fi).

1. Charge the printer, load paper, power it on.
2. Open `hardware/printer_compat_test/printer_compat_test.ino`, upload it.
3. Open Serial Monitor at **115200 baud**.
4. Watch the logs. Success looks like:
   ```
   [BT] CONNECTED to printer.
   [TX] Sending ESC/POS test receipt...
   >>> RESULT: SPP CONNECTED and bytes were written successfully.
   ```
5. **Look at the paper.** It must print `PR LIFE - Printer connected.` and cut.
   - Prints correctly → ESC/POS-over-SPP works. ✅ Proceed.
   - Connects but prints nothing/garbage → the printer is **not** ESC/POS-over-SPP
     (likely BLE or a proprietary app protocol). Stop; V1 needs a printer that
     accepts **raw ESC/POS over Bluetooth Classic SPP**.
   - Won't connect → see Troubleshooting.

Type `r` in Serial Monitor to reprint the test line.

## Step 2 — Configure the worker

1. Copy `hardware/pr_life_printer/config.example.h` → `hardware/pr_life_printer/config.h`.
   (`config.h` is gitignored — your secrets stay local.)
2. Fill in:
   - `WIFI_SSID` / `WIFI_PASSWORD` — **2.4 GHz** network (the ESP32 has no 5 GHz).
   - `API_BASE` — your deployed origin, e.g. `https://your-app.vercel.app` (no trailing slash).
   - `DEVICE_TOKEN` — the value of `PRINTER_DEVICE_TOKEN` set in Vercel.
   - `DEVICE_ID` — leave as `desk` unless you run multiple printers.
   - `PRINTER_MAC_BYTES` / `PRINTER_PIN` — already set for this printer.

## Step 3 — Flash the worker & power it permanently

1. Upload `hardware/pr_life_printer/pr_life_printer.ino`.
2. Serial Monitor (115200) should show:
   ```
   [WiFi] Connected. IP ...
   ```
   and then, when a job exists, `[JOB] Leased ... -> Printed`.
3. Once happy, power the ESP32 from a **wall USB charger** and leave it on. The
   printer keeps its own battery/charger — **never power the printer from the ESP32**.

## Step 4 — Queue something to print

In PR Life → **Tasks**:

- **Per task:** the **🖨 Print** button on any task row queues a receipt.
- **Print Management tab:** oversight + recovery. Multi-select tasks to queue,
  watch the **Queue**, see **Printed** history, and **Retry** anything under
  **Needs Attention**. Reprint is always explicit and asks for confirmation.

Queuing creates a durable job. It does **not** print from the browser — the next
time the ESP32 polls (≤10 s) it leases and prints it. Queue a task while you're
out and it'll be waiting on paper when the ESP32 next sees it.

## Eligibility (what gets printed)

V1 is **manual** — only what you explicitly queue (per-task Print, or Print
Management) becomes a receipt. There is no automatic rule, so nothing prints by
surprise. (A V2 option exists to auto-queue tasks flagged `desk_eligible`, but
it's off by default.)

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Compat test won't connect | Printer off / asleep / out of range. Power-cycle it. Make sure it isn't actively paired to your phone or Mac (only one master at a time). Re-check the MAC. |
| Connects but nothing prints | Out of paper, or the printer isn't ESC/POS-over-SPP. Confirm paper; if still nothing, the protocol is unsupported for V1. |
| `[WiFi] FAILED` | Wrong SSID/password, or a 5 GHz network. Use a 2.4 GHz SSID. |
| `claim -> HTTP 401` | `DEVICE_TOKEN` doesn't match `PRINTER_DEVICE_TOKEN` in Vercel. |
| `claim -> HTTP 200` but never prints | Nothing queued, or jobs target a different `DEVICE_ID`. Check the Queue in Print Management. |
| Job stuck in **Queue** (leased) then reappears | ESP32 lost power/Wi-Fi mid-job; the lease expired and the job was re-offered. Expected — it'll reprint when the ESP32 returns. |
| Job in **Needs Attention** | Print failed (paper/battery/Bluetooth). Fix the printer, then **Retry**. |
| Duplicate receipt | Rare, after an ambiguous connection drop. Acceptable by design — losing a job is worse than printing it twice. |

## What lives where

- `printer_compat_test/` — standalone Bluetooth/ESC/POS proof (Step 1).
- `pr_life_printer/` — the always-on worker (`config.h` is yours, gitignored).
- Backend: `lib/life/print-jobs.ts`, `lib/life/receipt.ts`,
  `app/api/life/printer/*`, `app/api/life/print-jobs/*`,
  migration `supabase/migrations/007_print_jobs.sql`.
