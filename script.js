let voltageData=[];
let tempData=[];
let humidityData=[];


let labels=[];



let voltageChart=
createChart("voltageChart","Voltage");


let tempChart=
createChart("tempChart","Temperature");


let humidityChart=
createChart("humidityChart","Humidity");




function createChart(id,name){

return new Chart(
document.getElementById(id),
{

type:"line",

data:{

labels:labels,

datasets:[{

label:name,

data:[]

}]

}

});

}





async function connectBLE(){


let device =
await navigator.bluetooth.requestDevice({

filters:[
{name:"CYBER BATTERY ANALYZER"}
],

optionalServices:[
"12345678-1234-1234-1234-123456789abc"
]

});



let server =
await device.gatt.connect();



let service =
await server.getPrimaryService(
"12345678-1234-1234-1234-123456789abc"
);



let characteristic =
await service.getCharacteristic(
"abcdefab-1234-5678-1234-abcdefabcdef"
);



characteristic.startNotifications();



document.getElementById("status")
.innerHTML="CONNECTED";



characteristic.addEventListener(
"characteristicvaluechanged",
event=>{


let data =
new TextDecoder()
.decode(event.target.value);



let json =
JSON.parse(data);



document.getElementById("voltage")
.innerHTML=
json.voltage+"V";


document.getElementById("temperature")
.innerHTML=
json.temperature+"°C";


document.getElementById("humidity")
.innerHTML=
json.humidity+"%";



labels.push("");

voltageChart.data.datasets[0].data.push(json.voltage);

tempChart.data.datasets[0].data.push(json.temperature);

humidityChart.data.datasets[0].data.push(json.humidity);



voltageChart.update();

tempChart.update();

humidityChart.update();



});


}
