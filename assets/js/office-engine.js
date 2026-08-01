
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
