
window.DataEngine = {
  createHexDump: function(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    let hex = '';
    let ascii = '';
    let result = '';
    const length = arrayBuffer.byteLength;

    for (let i = 0; i < length; i++) {
      const byte = view.getUint8(i);
      hex += byte.toString(16).padStart(2, '0') + ' ';
      ascii += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';

      if ((i + 1) % 16 === 0 || i === length - 1) {
        const offset = ('00000000' + (i - (i % 16)).toString(16)).slice(-8);
        result += offset + '  ' + hex.padEnd(48, ' ') + '  |' + ascii + '|\n';
        hex = '';
        ascii = '';
      }
    }
    return result;
  }
};
