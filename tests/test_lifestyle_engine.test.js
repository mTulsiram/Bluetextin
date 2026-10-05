const test = require('node:test');
const assert = require('node:assert');

// Initialize window global before loading lifestyle-engine.js
global.window = global.window || {};
require('../assets/js/lifestyle-engine.js');

test('LifestyleEngine.mifflinStJeor exists on window.LifestyleEngine', () => {
  assert.strictEqual(typeof window.LifestyleEngine, 'object');
  assert.strictEqual(typeof window.LifestyleEngine.mifflinStJeor, 'function');
});

test('mifflinStJeor calculates BMR correctly for male inputs', () => {
  // Test case 1: weight = 70, height = 175, age = 25, male
  // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
  const result1 = window.LifestyleEngine.mifflinStJeor(70, 175, 25, 'male');
  assert.strictEqual(result1, 1673.75);

  // Test case 2: weight = 80, height = 180, age = 50, male
  // 10*80 + 6.25*180 - 5*50 + 5 = 800 + 1125 - 250 + 5 = 1680
  const result2 = window.LifestyleEngine.mifflinStJeor(80, 180, 50, 'male');
  assert.strictEqual(result2, 1680);
});

test('mifflinStJeor calculates BMR correctly for female inputs', () => {
  // Test case 1: weight = 60, height = 165, age = 30, female
  // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
  const result1 = window.LifestyleEngine.mifflinStJeor(60, 165, 30, 'female');
  assert.strictEqual(result1, 1320.25);

  // Test case 2: weight = 55, height = 160, age = 20, female
  // 10*55 + 6.25*160 - 5*20 - 161 = 550 + 1000 - 100 - 161 = 1289
  const result2 = window.LifestyleEngine.mifflinStJeor(55, 160, 20, 'female');
  assert.strictEqual(result2, 1289);
});

test('mifflinStJeor handles edge cases and default gender fallback', () => {
  // Non-'male' string should default to female formula (-161)
  const nonMaleResult = window.LifestyleEngine.mifflinStJeor(60, 165, 30, 'other');
  assert.strictEqual(nonMaleResult, 1320.25);

  // Zero inputs for male: 10*0 + 6.25*0 - 5*0 + 5 = 5
  const zeroMale = window.LifestyleEngine.mifflinStJeor(0, 0, 0, 'male');
  assert.strictEqual(zeroMale, 5);

  // Zero inputs for female: 10*0 + 6.25*0 - 5*0 - 161 = -161
  const zeroFemale = window.LifestyleEngine.mifflinStJeor(0, 0, 0, 'female');
  assert.strictEqual(zeroFemale, -161);

  // Decimal values calculation:
  // weight = 68.5, height = 172.5, age = 28, male
  // 10*68.5 + 6.25*172.5 - 5*28 + 5 = 685 + 1078.125 - 140 + 5 = 1628.125
  const decimalResult = window.LifestyleEngine.mifflinStJeor(68.5, 172.5, 28, 'male');
  assert.strictEqual(decimalResult, 1628.125);
});
