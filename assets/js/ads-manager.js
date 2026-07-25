/**
 * BlueTEXT Centralized Ads & Game Audio Manager
 * - Non-intrusive Google AdSense Auto-Injection & Management
 * - Web Audio Synthesizer Background Music & Sound Effects Engine
 */

class BlueTEXTAdsManager {
  constructor(publisherId = "ca-pub-0000000000000000") {
    this.publisherId = publisherId;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Inject AdSense script dynamically if publisher ID is configured
    if (this.publisherId && !document.querySelector('script[src*="googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    this.renderAdSlots();
  }

  renderAdSlots() {
    const slots = document.querySelectorAll(".bt-ad-slot");
    slots.forEach(slot => {
      if (slot.dataset.rendered) return;
      slot.dataset.rendered = "true";

      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.dataset.adClient = this.publisherId;
      ins.dataset.adSlot = slot.dataset.slotId || "auto";
      ins.dataset.adFormat = slot.dataset.format || "auto";
      ins.dataset.fullWidthResponsive = "true";

      slot.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push deferred:", e);
      }
    });
  }
}

class BlueTEXTAudioManager {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.volumeNode = null;
    this.timerId = null;
    this.noteIndex = 0;
    
    // Synth Chiptune Melody (Pentatonic retro gaming vibe)
    this.melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
      349.23, 440.00, 523.25, 698.46, 523.25, 440.00
    ];
  }

  initCtx() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.volumeNode = this.audioCtx.createGain();
        this.volumeNode.gain.value = 0.08; // Soft background volume
        this.volumeNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggleMusic(btn) {
    this.initCtx();
    if (!this.audioCtx) return;

    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startMelody();
      if (btn) btn.innerHTML = "🔊 Music: ON";
    } else {
      this.stopMelody();
      if (btn) btn.innerHTML = "🔇 Music: OFF";
    }
  }

  startMelody() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      
      const freq = this.melody[this.noteIndex % this.melody.length];
      this.noteIndex++;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      noteGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);

      osc.connect(noteGain);
      noteGain.connect(this.volumeNode);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    }, 320);
  }

  stopMelody() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  playSFX(type = "click") {
    this.initCtx();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }
}

// Global Instances
window.BlueTEXTAds = new BlueTEXTAdsManager();
window.BlueTEXTAudio = new BlueTEXTAudioManager();

document.addEventListener("DOMContentLoaded", () => {
  window.BlueTEXTAds.init();

  // Auto-inject Music Toggle Button into Game Pages
  if (window.location.pathname.includes("/pages/games/")) {
    const gameHeaders = document.querySelectorAll(".card-header");
    gameHeaders.forEach(header => {
      if (!header.querySelector("#bt-music-toggle-btn")) {
        const musicBtn = document.createElement("button");
        musicBtn.id = "bt-music-toggle-btn";
        musicBtn.className = "btn btn-sm btn-outline-primary ms-auto me-2 font-monospace";
        musicBtn.innerHTML = "🔇 Music: OFF";
        musicBtn.onclick = () => window.BlueTEXTAudio.toggleMusic(musicBtn);
        header.insertBefore(musicBtn, header.lastElementChild);
      }
    });
  }
});
