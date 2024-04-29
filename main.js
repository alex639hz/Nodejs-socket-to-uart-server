import { WebSocketServer } from 'ws';
import { init } from 'raspi';
import { Serial } from 'raspi-serial';

let _serial;
let _ws;
let _wsMsg;
let _serMsg = "";
let _replayCountMax = 10;
let _replayCount = 0;

init(() => {
  _serial = new Serial({
    portId: "/dev/ttyUSB0",
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: Serial.PARITY_NONE
  });
  _serial.open(() => {
    _serial.on('data', (data) => {
      const dataBuf = Buffer.from(data)
      const dataStr = dataBuf.toString()
      if (dataStr[0] === '{' && dataStr[dataStr.length - 1] === '}') {
        const resultArray = Array.from(dataBuf).map((item) => item.toString())
        console.log(resultArray)
        _ws.send('mcu: ' + resultArray)
        _replayCount = 0;
      } else if (_replayCount < _replayCountMax) {
        _replayCount++
        _serial.write(dataStr);
        console.log(`counting  ${_replayCount} tries`)
      } else {
        _ws.send(`Failed ${_replayCount} tries`)
        _replayCount = 0
      }
      // process.stdout.write(data);
      // console.log('coded: ', ourBuffer, ourBuffer.toString())
    });
  });
});


const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  _ws = ws
  ws.on('error', console.error);

  ws.on('message', function message(data) {

    // _serial.write(data);
    // console.log(JSON.stringify(data));
    // const wsMsg = String.fromCharCode(...[85, 33, 0, 0, 33])
    // const wsMsg = String.fromCharCode(...[85, 32, 0, 1, 33])
    // _wsMsg = String.fromCharCode(...[85, 35, 0, 2, 33]) // connected RIO
    _wsMsg = data
    // _wsMsg = "{alex}"
    _serial.write(_wsMsg);

    console.log('client: ?' + _wsMsg);
  });


});