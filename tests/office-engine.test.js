const { describe, it } = require('node:test');
const assert = require('node:assert');
const OfficeEngine = require('../assets/js/office-engine.js');

describe('OfficeEngine Module', () => {
  it('should be defined and attached to window and exports', () => {
    assert.ok(OfficeEngine, 'OfficeEngine should be defined');
    assert.strictEqual(typeof OfficeEngine.diffText, 'function', 'diffText should be a function');
  });

  describe('diffText()', () => {
    it('should return correct diff metrics for identical strings', () => {
      const result = OfficeEngine.diffText('hello world', 'hello world');
      assert.deepStrictEqual(result, {
        added: 0,
        removed: 0,
        same: true
      });
    });

    it('should return correct diff metrics for empty strings', () => {
      const result = OfficeEngine.diffText('', '');
      assert.deepStrictEqual(result, {
        added: 0,
        removed: 0,
        same: true
      });
    });

    it('should return positive added count when string b is longer', () => {
      const result = OfficeEngine.diffText('hello', 'hello world');
      assert.strictEqual(result.added, 6);
      assert.strictEqual(result.removed, -6);
      assert.strictEqual(result.same, true);
    });

    it('should return positive removed count when string a is longer', () => {
      const result = OfficeEngine.diffText('hello world', 'hello');
      assert.strictEqual(result.added, -6);
      assert.strictEqual(result.removed, 6);
      assert.strictEqual(result.same, true);
    });

    it('should handle special characters and unicode', () => {
      const strA = '🎉 party';
      const strB = '🎉 party time!';
      const result = OfficeEngine.diffText(strA, strB);
      assert.strictEqual(result.added, strB.length - strA.length);
      assert.strictEqual(result.removed, strA.length - strB.length);
      assert.strictEqual(result.same, true);
    });
  });
});
