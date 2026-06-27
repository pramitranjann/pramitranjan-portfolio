/*
 * PR LIFE — Printer compatibility test (STANDALONE)
 * =================================================
 * Goal: prove (or disprove) that the desk thermal printer accepts raw ESC/POS
 * over Bluetooth Classic SPP from an ESP32, BEFORE building the full worker.
 *
 * Hardware: ESP32-DevKitC (ESP32-WROOM-32). No Wi-Fi here — Bluetooth only.
 * Printer:  58mm BT thermal printer, controller YICHIP YC3121.
 *           MAC 5A:4A:6A:78:45:0F, legacy pairing PIN 1234, raw ESC/POS
 *           (ESC/POS already confirmed working over USB via `lp -o raw`).
 *
 * What it does:
 *   1. Starts Bluetooth Classic in MASTER mode and pairs with PIN 1234.
 *   2. Connects to the printer by MAC address (more reliable than by name).
 *   3. Sends ESC/POS: init, "PR LIFE - Printer connected.", feed, cut.
 *   4. Logs every step to Serial at 115200 and states clearly whether the
 *      write succeeded — then asks you to confirm paper actually came out.
 *
 * IMPORTANT: a successful SPP write only proves the bytes were sent. Only YOU,
 * looking at the paper, can confirm ESC/POS truly printed. Do not declare the
 * printer "compatible" until this sketch prints the line on real paper.
 *
 * Board manager: "ESP32 Dev Module". Tested against ESP32 Arduino core 3.x.
 * If your core is 2.x, see the setPin note below.
 */

#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error "Bluetooth is not enabled. Enable it in Tools > (menuconfig) or use the default ESP32 Dev Module config."
#endif

BluetoothSerial SerialBT;

// Printer MAC 5A:4A:6A:78:45:0F, most-significant byte first.
uint8_t PRINTER_MAC[6] = { 0x5A, 0x4A, 0x6A, 0x78, 0x45, 0x0F };
const char *PRINTER_PIN = "1234";

// ---- ESC/POS helpers -------------------------------------------------------
void escposInit() {
  const uint8_t cmd[] = { 0x1B, 0x40 };  // ESC @  -> reset/initialise printer
  SerialBT.write(cmd, sizeof(cmd));
}

void escposFeedAndCut() {
  const uint8_t feed[] = { 0x1B, 0x64, 0x04 };  // ESC d 4 -> feed 4 lines
  SerialBT.write(feed, sizeof(feed));
  const uint8_t cut[] = { 0x1D, 0x56, 0x42, 0x00 };  // GS V 66 0 -> partial cut
  SerialBT.write(cut, sizeof(cut));
}

void printTestReceipt() {
  escposInit();
  SerialBT.println("PR LIFE - Printer connected.");
  SerialBT.flush();
  escposFeedAndCut();
  SerialBT.flush();
}

// ---- setup -----------------------------------------------------------------
bool connectToPrinter() {
  Serial.println("[BT] Starting Bluetooth Classic in master mode...");
  if (!SerialBT.begin("PR-Life-Bridge", true)) {  // true = master
    Serial.println("[BT] FATAL: SerialBT.begin() failed.");
    return false;
  }

  // Legacy PIN pairing. Core 3.x: setPin(pin, len). Core 2.x: setPin(pin).
  SerialBT.setPin(PRINTER_PIN, strlen(PRINTER_PIN));
  Serial.printf("[BT] PIN set to %s. Connecting to %02X:%02X:%02X:%02X:%02X:%02X ...\n",
                PRINTER_PIN, PRINTER_MAC[0], PRINTER_MAC[1], PRINTER_MAC[2],
                PRINTER_MAC[3], PRINTER_MAC[4], PRINTER_MAC[5]);

  // connect() blocks up to ~10s by default and returns connection result.
  bool ok = SerialBT.connect(PRINTER_MAC);
  if (!ok) {
    Serial.println("[BT] connect() returned false.");
    return false;
  }

  // Give the link a moment to settle, then confirm.
  for (int i = 0; i < 20 && !SerialBT.connected(); i++) delay(100);
  if (!SerialBT.connected()) {
    Serial.println("[BT] connect() returned true but link did not come up.");
    return false;
  }

  Serial.println("[BT] CONNECTED to printer.");
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println();
  Serial.println("==========================================");
  Serial.println(" PR LIFE - Printer compatibility test");
  Serial.println("==========================================");

  if (!connectToPrinter()) {
    Serial.println();
    Serial.println(">>> RESULT: COULD NOT CONNECT over Bluetooth Classic SPP.");
    Serial.println(">>> If this persists, the printer may be BLE-only or use a");
    Serial.println(">>> proprietary profile. Required spec for V1: Bluetooth");
    Serial.println(">>> Classic SPP (RFCOMM) accepting raw ESC/POS bytes.");
    return;
  }

  Serial.println("[TX] Sending ESC/POS test receipt...");
  printTestReceipt();
  delay(500);

  Serial.println();
  Serial.println(">>> RESULT: SPP CONNECTED and bytes were written successfully.");
  Serial.println(">>> NOW CHECK THE PRINTER: did it print");
  Serial.println(">>>     'PR LIFE - Printer connected.'");
  Serial.println(">>> and feed/cut the paper?");
  Serial.println(">>>   - YES -> raw ESC/POS over SPP WORKS. Printer is compatible.");
  Serial.println(">>>   - Connected but NOTHING printed / garbage -> wrong protocol");
  Serial.println(">>>     (likely BLE/proprietary); ESC/POS-over-SPP not supported.");
  Serial.println();
  Serial.println("[i] Type 'r' in Serial Monitor to reprint the test line.");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'r') {
      if (SerialBT.connected()) {
        Serial.println("[TX] Reprinting test line...");
        printTestReceipt();
      } else {
        Serial.println("[BT] Not connected; reconnecting...");
        connectToPrinter();
      }
    }
  }
  delay(50);
}
