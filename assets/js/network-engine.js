
window.NetworkEngine = {
  calculateSubnet: function(ipStr, cidrVal) {
    const parts = ipStr.split('.').map(Number);
    const slash = parseInt(cidrVal);
    if (parts.length !== 4 || parts.some(isNaN) || isNaN(slash) || slash < 0 || slash > 32) {
      return null;
    }
    const ipNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    const mask = slash === 0 ? 0 : (~0 << (32 - slash));
    const netNum = ipNum & mask;
    const broadNum = ipNum | ~mask;
    
    function numToIp(num) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
      ].join('.');
    }
    return {
      network: numToIp(netNum),
      broadcast: numToIp(broadNum),
      hosts: slash >= 31 ? 0 : Math.pow(2, 32 - slash) - 2
    };
  }
};
