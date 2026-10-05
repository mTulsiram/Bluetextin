const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Load NetworkEngine in a clean window context
const enginePath = path.join(__dirname, '../assets/js/network-engine.js');
const code = fs.readFileSync(enginePath, 'utf8');
const window = {};
new Function('window', code)(window);
const NetworkEngine = window.NetworkEngine;

test('calculateSubnet - happy paths', async (t) => {
  await t.test('calculates standard /24 subnet correctly', () => {
    const result = NetworkEngine.calculateSubnet('192.168.1.10', '24');
    assert.deepStrictEqual(result, {
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      hosts: 254
    });
  });

  await t.test('calculates Class A /8 subnet correctly', () => {
    const result = NetworkEngine.calculateSubnet('10.0.1.50', '8');
    assert.deepStrictEqual(result, {
      network: '10.0.0.0',
      broadcast: '10.255.255.255',
      hosts: 16777214
    });
  });

  await t.test('calculates Class B /16 subnet correctly', () => {
    const result = NetworkEngine.calculateSubnet('172.16.42.1', '16');
    assert.deepStrictEqual(result, {
      network: '172.16.0.0',
      broadcast: '172.16.255.255',
      hosts: 65534
    });
  });

  await t.test('accepts integer CIDR parameter', () => {
    const result = NetworkEngine.calculateSubnet('192.168.1.10', 24);
    assert.deepStrictEqual(result, {
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      hosts: 254
    });
  });

  await t.test('correctly calculates subnet when IP has non-zero host bits', () => {
    const result = NetworkEngine.calculateSubnet('192.168.1.233', '24');
    assert.deepStrictEqual(result, {
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      hosts: 254
    });
  });
});

test('calculateSubnet - boundary and edge cases', async (t) => {
  await t.test('handles CIDR /0 (entire IPv4 address space)', () => {
    const result = NetworkEngine.calculateSubnet('10.0.0.1', '0');
    assert.deepStrictEqual(result, {
      network: '0.0.0.0',
      broadcast: '255.255.255.255',
      hosts: 4294967294
    });
  });

  await t.test('handles CIDR /31 (point-to-point link)', () => {
    const result = NetworkEngine.calculateSubnet('192.168.1.1', '31');
    assert.deepStrictEqual(result, {
      network: '192.168.1.0',
      broadcast: '192.168.1.1',
      hosts: 0
    });
  });

  await t.test('handles CIDR /32 (single host)', () => {
    const result = NetworkEngine.calculateSubnet('192.168.1.1', '32');
    assert.deepStrictEqual(result, {
      network: '192.168.1.1',
      broadcast: '192.168.1.1',
      hosts: 0
    });
  });

  await t.test('handles high octet values (255.255.255.255 /24)', () => {
    const result = NetworkEngine.calculateSubnet('255.255.255.255', '24');
    assert.deepStrictEqual(result, {
      network: '255.255.255.0',
      broadcast: '255.255.255.255',
      hosts: 254
    });
  });
});

test('calculateSubnet - invalid input handling', async (t) => {
  await t.test('returns null for IP with fewer than 4 octets', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1', '24'), null);
  });

  await t.test('returns null for IP with more than 4 octets', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1.1.1', '24'), null);
  });

  await t.test('returns null for empty IP string', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('', '24'), null);
  });

  await t.test('returns null for IP with non-numeric characters', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1.abc', '24'), null);
  });

  await t.test('returns null for CIDR < 0', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1.1', '-1'), null);
  });

  await t.test('returns null for CIDR > 32', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1.1', '33'), null);
  });

  await t.test('returns null for non-numeric CIDR', () => {
    assert.strictEqual(NetworkEngine.calculateSubnet('192.168.1.1', 'abc'), null);
  });
});
