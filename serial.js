const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;

raspi.init(() => {
  var serial = new Serial({ portId: "/dev/ttyUSB0", baudRate: 115200, dataBits: 8, stopBits: 1, parity: Serial.PARITY_NONE });
  serial.open(() => {
    serial.on('data', (data) => {
      process.stdout.write(data);
    });
    serial.write('Hello from raspi-serial');
  });
});