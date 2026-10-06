// BLE telemetry dashboard. The ESP32 firmware is maintained separately.
const MAX_SAMPLES = 300;
let voltageData = [], tempData = [], humidityData = [], labels = [];
let connectedDevice = null;
let connecting = false;
const voltageChart = createChart("voltageChart", "Voltage");
const tempChart = createChart("tempChart", "Temperature");
const humidityChart = createChart("humidityChart", "Humidity");

function createChart(id, name) {
  return new Chart(document.getElementById(id), {
    type: "line", data: { labels, datasets: [{ label: name, data: [] }] }
  });
}

function receiveTelemetry(event) {
  try {
    const json = JSON.parse(new TextDecoder().decode(event.target.value));
    if (!json || typeof json !== "object" ||
        ![json.voltage, json.temperature, json.humidity].every(value =>
          typeof value === "number" && Number.isFinite(value))) {
      throw new Error("Expected numeric voltage, temperature, and humidity");
    }
    document.getElementById("voltage").textContent = json.voltage + " V";
    document.getElementById("temperature").textContent = json.temperature + " °C";
    document.getElementById("humidity").textContent = json.humidity + " %";
    labels.push(new Date().toLocaleTimeString());
    if (labels.length > MAX_SAMPLES) labels.shift();
    for (const [chart, value] of [[voltageChart, json.voltage], [tempChart, json.temperature], [humidityChart, json.humidity]]) {
      const values = chart.data.datasets[0].data;
      values.push(value);
      if (values.length > MAX_SAMPLES) values.shift();
      chart.update();
    }
    document.getElementById("status").textContent = "CONNECTED";
  } catch (error) {
    document.getElementById("status").textContent = "INVALID TELEMETRY";
    console.warn("Ignored malformed BLE data", error);
  }
}

async function connectBLE() {
  const status = document.getElementById("status");
  if (connecting || connectedDevice?.gatt.connected) return;
  if (!navigator.bluetooth) {
    status.textContent = "Web Bluetooth unavailable. Use a supported browser over HTTPS or localhost.";
    return;
  }
  connecting = true;
  let device;
  try {
    status.textContent = "CONNECTING";
    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: "CYBER BATTERY ANALYZER" }],
      optionalServices: ["12345678-1234-1234-1234-123456789abc"]
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("12345678-1234-1234-1234-123456789abc");
    const characteristic = await service.getCharacteristic("abcdefab-1234-5678-1234-abcdefabcdef");
    characteristic.addEventListener("characteristicvaluechanged", receiveTelemetry);
    await characteristic.startNotifications();
    connectedDevice = device;
    device.addEventListener("gattserverdisconnected", () => {
      connectedDevice = null;
      status.textContent = "DISCONNECTED";
    }, { once: true });
    status.textContent = "CONNECTED";
  } catch (error) {
    device?.gatt.disconnect();
    status.textContent = error.name === "NotFoundError" ? "NO DEVICE SELECTED" : "CONNECTION FAILED: " + error.message;
  } finally { connecting = false; }
}
