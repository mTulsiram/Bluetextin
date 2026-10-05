const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Set up global window environment to load lifestyle-engine.js
global.window = global;
const scriptPath = path.join(__dirname, '../assets/js/lifestyle-engine.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
new Function('window', scriptContent)(global.window);

const LifestyleEngine = global.window.LifestyleEngine;

test('LifestyleEngine.duboisBSA - Happy Path / Positive Inputs', () => {
  const result = LifestyleEngine.duboisBSA(70, 175);
  // 0.007184 * 70^0.425 * 175^0.725 ≈ 1.84814
  assert.ok(typeof result === 'number' && !isNaN(result));
  assert.ok(Math.abs(result - 1.848) < 0.01, `Expected ~1.848, got ${result}`);
});

test('LifestyleEngine.duboisBSA - Zero Inputs', () => {
  assert.strictEqual(LifestyleEngine.duboisBSA(0, 175), 0, 'Zero weight should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(70, 0), 0, 'Zero height should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(0, 0), 0, 'Zero weight and height should return 0');
});

test('LifestyleEngine.duboisBSA - Negative Inputs', () => {
  assert.strictEqual(LifestyleEngine.duboisBSA(-70, 175), 0, 'Negative weight should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(70, -175), 0, 'Negative height should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(-70, -175), 0, 'Negative weight and height should return 0');
});

test('LifestyleEngine.duboisBSA - Invalid Non-Numeric Inputs', () => {
  assert.strictEqual(LifestyleEngine.duboisBSA(NaN, 175), 0, 'NaN weight should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(70, NaN), 0, 'NaN height should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA('invalid', 175), 0, 'String weight should return 0');
  assert.strictEqual(LifestyleEngine.duboisBSA(), 0, 'Missing arguments should return 0');
});
