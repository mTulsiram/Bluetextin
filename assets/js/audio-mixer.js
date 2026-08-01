/**
 * Audio Mixer - Manages Web Audio routing for playback previews and video exports.
 * Routes media element sources into separate preview and export gain chains.
 */

let audioContext = null;
const sourceNodeCache = new Map(); // WeakMap or Map keyed by HTMLMediaElement
const trackGainNodes = {}; // Maps trackId -> { previewGain, exportGain }
let previewMasterGain = null;
let exportMasterGain = null;
let exportDestinationNode = null;

/**
 * Initializes and retrieves the shared audio context.
 */
export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    
    // Preview channel: Routes sound to physical destination (user headphones/speakers)
    previewMasterGain = audioContext.createGain();
    previewMasterGain.connect(audioContext.destination);

    // Export channel: Routes sound to MediaStreamDestination (MediaRecorder target)
    exportMasterGain = audioContext.createGain();
    exportDestinationNode = audioContext.createMediaStreamDestination();
    exportMasterGain.connect(exportDestinationNode);
  }
  return audioContext;
}

/**
 * Registers an HTML5 Media Element inside the audio graph.
 * Ensures createMediaElementSource is called exactly once per unique element.
 */
export function registerMediaElement(element, trackId) {
  const ctx = getAudioContext();

  let sourceNode;
  if (sourceNodeCache.has(element)) {
    sourceNode = sourceNodeCache.get(element);
  } else {
    sourceNode = ctx.createMediaElementSource(element);
    sourceNodeCache.set(element, sourceNode);
  }

  // Build track nodes if they don't exist
  if (!trackGainNodes[trackId]) {
    const previewGain = ctx.createGain();
    previewGain.connect(previewMasterGain);
    previewGain.gain.value = 1.0; // Explicitly enable sound by default

    const exportGain = ctx.createGain();
    exportGain.connect(exportMasterGain);
    exportGain.gain.value = 1.0; // Explicitly enable sound by default

    trackGainNodes[trackId] = {
      previewGain,
      exportGain
    };
  }

  // Connect source node to both preview and export track gain nodes
  // Clean connections to prevent multiple parallel paths
  try {
    sourceNode.disconnect();
  } catch (e) {
    // Ignore if not connected
  }
  
  sourceNode.connect(trackGainNodes[trackId].previewGain);
  sourceNode.connect(trackGainNodes[trackId].exportGain);
}

/**
 * Updates the mixer levels for a specific track based on its mute state.
 */
export function updateTrackAudioMix(trackId, isMuted) {
  getAudioContext();
  const nodes = trackGainNodes[trackId];
  if (nodes) {
    // Mute on preview path only affects what user hears
    nodes.previewGain.gain.value = isMuted ? 0 : 1;
    // Mute on export path affects final output stream
    nodes.exportGain.gain.value = isMuted ? 0 : 1;
  }
}

/**
 * Retrieves the destination stream for exporting audio.
 */
export function getExportAudioStream() {
  getAudioContext();
  return exportDestinationNode.stream;
}

/**
 * Mutes or unmutes the master preview path (does not affect export mix).
 */
export function setGlobalPreviewMute(isMuted) {
  getAudioContext();
  if (previewMasterGain) {
    previewMasterGain.gain.value = isMuted ? 0 : 1;
  }
}
