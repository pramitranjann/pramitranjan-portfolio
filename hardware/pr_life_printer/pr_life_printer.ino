/*
 * PR LIFE — Print worker firmware
 * ===============================
 * The desk ESP32 is an OUTBOUND-ONLY client. It never accepts inbound
 * connections and never decides what to print. It just:
 *
 *   1. Connects to 2.4 GHz Wi-Fi.
 *   2. Every 5–10s, POSTs /api/life/printer/claim with the device token.
 *   3. If a job is leased, prints the supplied receipt payload over
 *      Bluetooth Classic SPP (raw ESC/POS).
 *   4. POSTs /api/life/printer/complete with success or a failure reason.
 *   5. Recovers from Wi-Fi / Bluetooth / API / printer / power failures.
 *
 * PR Life is the brain; this device holds only the device token and prints
 * compact, ready-made receipts. A dropped lease is auto-reclaimed server-side,
 * so a crash here never loses a job (a rare duplicate is acceptable).
 *
 * Dependencies (Library Manager): "ArduinoJson" (v7+).
 * Board: ESP32 Dev Module. Core 3.x. Copy config.example.h -> config.h first.
 *
 * NOTE: TLS uses setInsecure() for simplicity (no cert pinning). Fine for a
 * personal device on your own network; pin the root CA later if desired.
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "BluetoothSerial.h"
#include "config.h"

BluetoothSerial SerialBT;
uint8_t PRINTER_MAC[6] = PRINTER_MAC_BYTES;

unsigned long lastPoll = 0;

// ---- Wi-Fi -----------------------------------------------------------------
void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WiFi] Connecting to %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WiFi] Connected. IP %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[WiFi] FAILED — will retry next loop.");
  }
}

// ---- Bluetooth printer -----------------------------------------------------
bool ensurePrinter() {
  if (SerialBT.connected()) return true;

  Serial.println("[BT] Connecting to printer...");
  SerialBT.setPin(PRINTER_PIN, strlen(PRINTER_PIN));
  if (!SerialBT.connect(PRINTER_MAC)) {
    Serial.println("[BT] connect() failed.");
    return false;
  }
  for (int i = 0; i < 20 && !SerialBT.connected(); i++) delay(100);
  if (SerialBT.connected()) {
    Serial.println("[BT] Printer connected.");
    return true;
  }
  Serial.println("[BT] Link did not come up.");
  return false;
}

// Stream the receipt payload as raw ESC/POS. Returns true if bytes were sent.
bool printPayload(const String &payload) {
  if (!SerialBT.connected()) return false;

  const uint8_t init[] = { 0x1B, 0x40 };  // ESC @
  SerialBT.write(init, sizeof(init));
  SerialBT.print(payload);
  SerialBT.print("\n");
  SerialBT.flush();

  const uint8_t feed[] = { 0x1B, 0x64, 0x04 };       // feed 4 lines
  SerialBT.write(feed, sizeof(feed));
  const uint8_t cut[] = { 0x1D, 0x56, 0x42, 0x00 };  // partial cut
  SerialBT.write(cut, sizeof(cut));
  SerialBT.flush();
  return true;
}

// ---- API -------------------------------------------------------------------
// Returns the HTTP body, or "" on transport failure. Sets outCode.
String apiPost(const String &path, const String &body, int &outCode) {
  WiFiClientSecure client;
  client.setInsecure();           // no cert pinning (see header note)
  client.setTimeout(12000);

  HTTPClient http;
  String url = String(API_BASE) + path;
  if (!http.begin(client, url)) {
    outCode = -1;
    return "";
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  outCode = http.POST((uint8_t *)body.c_str(), body.length());
  String resp = (outCode > 0) ? http.getString() : "";
  http.end();
  return resp;
}

void reportResult(const String &jobId, bool success, const String &errorMsg) {
  StaticJsonDocument<256> doc;
  doc["jobId"] = jobId;
  doc["deviceId"] = DEVICE_ID;
  doc["success"] = success;
  if (!success) doc["error"] = errorMsg;
  String body;
  serializeJson(doc, body);

  int code = 0;
  apiPost("/api/life/printer/complete", body, code);
  Serial.printf("[API] complete (success=%d) -> HTTP %d\n", success, code);
}

// Poll for one job, print it, and report the outcome.
void pollOnce() {
  ensureWifi();
  if (WiFi.status() != WL_CONNECTED) return;

  String body = String("{\"deviceId\":\"") + DEVICE_ID + "\"}";
  int code = 0;
  String resp = apiPost("/api/life/printer/claim", body, code);

  if (code != 200) {
    Serial.printf("[API] claim -> HTTP %d (will retry)\n", code);
    return;
  }

  StaticJsonDocument<2048> doc;
  DeserializationError err = deserializeJson(doc, resp);
  if (err) {
    Serial.printf("[API] claim JSON parse error: %s\n", err.c_str());
    return;
  }

  if (doc["job"].isNull()) {
    // Idle — nothing to print. (Quietly; this is the common case.)
    return;
  }

  String jobId = doc["job"]["id"].as<String>();
  String payload = doc["job"]["payload"].as<String>();
  Serial.printf("[JOB] Leased %s (%d bytes)\n", jobId.c_str(), payload.length());

  if (!ensurePrinter()) {
    reportResult(jobId, false, "Bluetooth printer not reachable");
    return;
  }

  if (printPayload(payload)) {
    Serial.println("[JOB] Printed; reporting success.");
    reportResult(jobId, true, "");
  } else {
    Serial.println("[JOB] Print write failed; reporting failure.");
    reportResult(jobId, false, "Failed to write to printer");
  }
}

void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println();
  Serial.println("==== PR LIFE print worker ====");
  WiFi.mode(WIFI_STA);
  // Master mode for Bluetooth Classic so we initiate the printer connection.
  SerialBT.begin("PR-Life-Bridge", true);
  ensureWifi();
}

void loop() {
  if (millis() - lastPoll >= POLL_INTERVAL_MS) {
    lastPoll = millis();
    pollOnce();
  }
  delay(50);  // keep the loop responsive without busy-waiting
}
