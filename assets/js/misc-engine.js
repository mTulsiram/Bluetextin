
window.MiscEngine = {
  getAudioContext: function() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  },
  detectPitch: function(buffer) {
    // Basic Autocorrelation implementation
    let SIZE = buffer.length;
    let sum = 0;
    let r = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        r[i] += buffer[j] * buffer[j + i];
      }
    }
    let d = 0;
    while (r[d] > r[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (r[i] > maxval) {
        maxval = r[i];
        maxpos = i;
      }
    }
    return maxpos;
  }
};
