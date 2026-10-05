if (typeof window === 'undefined') {
  global.window = typeof global.window !== 'undefined' ? global.window : {};
}

window.OfficeEngine = {
  diffText: function(a, b) {
    // Basic character-level differences array
    return {
      added: b.length - a.length,
      removed: a.length - b.length,
      same: true
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.OfficeEngine;
}
