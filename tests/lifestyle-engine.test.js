const test = require('node:test');
const assert = require('node:assert');
const LifestyleEngine = require('../assets/js/lifestyle-engine.js');

test('LifestyleEngine - usNavyBodyFat for male', () => {
  const waist = 85;
  const neck = 38;
  const hip = null; // Hip is not used in male calculation
  const height = 175;
  const gender = 'male';

  const result = LifestyleEngine.usNavyBodyFat(waist, neck, hip, height, gender);
  const expected = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;

  assert.strictEqual(typeof result, 'number');
  assert.strictEqual(isNaN(result), false);
  assert.strictEqual(result, expected);
});

test('LifestyleEngine - usNavyBodyFat for female', () => {
  const waist = 70;
  const neck = 32;
  const hip = 95;
  const height = 165;
  const gender = 'female';

  const result = LifestyleEngine.usNavyBodyFat(waist, neck, hip, height, gender);
  const expected = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;

  assert.strictEqual(typeof result, 'number');
  assert.strictEqual(isNaN(result), false);
  assert.strictEqual(result, expected);
});

test('LifestyleEngine - usNavyBodyFat falls back to female formula when gender is not male', () => {
  const waist = 75;
  const neck = 35;
  const hip = 90;
  const height = 160;

  const resultOther = LifestyleEngine.usNavyBodyFat(waist, neck, hip, height, 'other');
  const expectedFemaleBranch = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;

  assert.strictEqual(resultOther, expectedFemaleBranch);
});

test('LifestyleEngine - mifflinStJeor BMR calculation for male and female', () => {
  const weight = 70;
  const height = 175;
  const age = 30;

  const maleBmr = LifestyleEngine.mifflinStJeor(weight, height, age, 'male');
  const expectedMaleBmr = 10 * 70 + 6.25 * 175 - 5 * 30 + 5;
  assert.strictEqual(maleBmr, expectedMaleBmr);

  const femaleBmr = LifestyleEngine.mifflinStJeor(weight, height, age, 'female');
  const expectedFemaleBmr = 10 * 70 + 6.25 * 175 - 5 * 30 - 161;
  assert.strictEqual(femaleBmr, expectedFemaleBmr);
});

test('LifestyleEngine - duboisBSA calculation', () => {
  const weight = 70;
  const height = 175;

  const bsa = LifestyleEngine.duboisBSA(weight, height);
  const expectedBsa = 0.007184 * Math.pow(70, 0.425) * Math.pow(175, 0.725);
  assert.strictEqual(bsa, expectedBsa);
});
