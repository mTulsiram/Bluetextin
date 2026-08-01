
window.ConverterEngine = {
  sanitizeValue: function(value) {
    return Number(parseFloat(value).toFixed(6));
  },
  playTone: function(freq, duration) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, duration);
    } catch(e) {}
  }
};
