# Cyber Battery Analyzer

A browser dashboard for ESP32 BLE voltage, temperature, and humidity telemetry.

## Run

Serve this directory with `python -m http.server 8000`, then open `http://localhost:8000`, or host it on HTTPS. Use a browser/platform supporting Web Bluetooth. Chart.js is loaded from a CDN and requires network access.

## Device contract

| Setting | Value |
|---|---|
| Advertised device name | `CYBER BATTERY ANALYZER` |
| Service UUID | `12345678-1234-1234-1234-123456789abc` |
| Notify characteristic UUID | `abcdefab-1234-5678-1234-abcdefabcdef` |
| Payload | UTF-8 JSON: `{"voltage":3.7,"temperature":24.5,"humidity":45}` |

All three values must be finite JSON numbers. Malformed packets are rejected, telemetry is rendered as text, and each history retains at most 300 samples. Connection failures and disconnections appear in the status panel.

## Status

This is a frontend prototype. Matching ESP32 firmware, voltage-divider/calibration details, and physical validation are not included. The page does not measure battery capacity, internal resistance, or state of charge. The historical repository name is retained.
