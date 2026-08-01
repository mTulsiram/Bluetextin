/**
 * Video Exporter - Handles MediaRecorder WebM capture stream capture.
 */

import { getExportAudioStream, getAudioContext } from './audio-mixer.js';

let mediaRecorder = null;
let recordedChunks = [];
let preExportPlayheadTime = 0;
let exportTotalDuration = 0;
let isExportActive = false;

/**
 * Checks if there is a render export task currently active.
 */
export function isCurrentlyExporting() {
  return isExportActive;
}

/**
 * Triggers the WebM MediaRecorder export pipeline.
 */
export function startExport(EditorState, previewCanvas, triggerPlay, triggerPause, seekTo, renderApp) {
  if (!EditorState.clips || EditorState.clips.length === 0) {
    alert("Nothing to export — add a clip to the timeline first.");
    return;
  }

  // Ensure AudioContext is active
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.warn("AudioContext activation failed:", e);
  }

  // Compute total duration based on clip endpoints
  let maxTime = 0;
  EditorState.clips.forEach(clip => {
    const endTime = clip.startTime + clip.duration;
    if (endTime > maxTime) maxTime = endTime;
  });
  exportTotalDuration = Math.max(1, maxTime);

  preExportPlayheadTime = EditorState.playheadTime;
  isExportActive = true;
  EditorState.isExporting = true;

  // Start real-time WebM MediaRecorder export pipeline
  runWebMExport(EditorState, previewCanvas, triggerPlay, triggerPause, seekTo, renderApp);
}

/**
 * WebM MediaRecorder Pipeline (Stage 3 Real-time Capture)
 */
function runWebMExport(EditorState, previewCanvas, triggerPlay, triggerPause, seekTo, renderApp) {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  let mimeType = '';
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) {
      mimeType = t;
      break;
    }
  }

  if (!mimeType) {
    alert("WebM video recording is not supported in this browser.");
    isExportActive = false;
    EditorState.isExporting = false;
    return;
  }

  let combinedStream;
  try {
    const videoStream = previewCanvas.captureStream(30);
    const audioStream = getExportAudioStream();
    combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);
  } catch (e) {
    alert("Failed to capture streams: " + e.message);
    isExportActive = false;
    EditorState.isExporting = false;
    return;
  }

  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 8000000
    });
  } catch (e) {
    alert("MediaRecorder failed: " + e.message);
    isExportActive = false;
    EditorState.isExporting = false;
    return;
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    isExportActive = false;
    EditorState.isExporting = false;
    hideExportModal();
    triggerPause();

    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: mimeType });
      triggerDownload(blob, 'webm');
    }
  };

  showExportModal(() => {
    cancelExport(EditorState, triggerPause, seekTo, renderApp);
  });

  seekTo(0);
  renderApp();
  mediaRecorder.start();
  triggerPlay();
}

/**
 * Handles cancelling the current export task.
 */
function cancelExport(EditorState, triggerPause, seekTo, renderApp) {
  isExportActive = false;
  EditorState.isExporting = false;
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.ondataavailable = null;
    mediaRecorder.stop();
  }
  
  triggerPause();
  seekTo(preExportPlayheadTime);
  renderApp();
  hideExportModal();
}

/**
 * Real-time progress updates during WebM MediaRecorder renders.
 */
export function updateExportProgress(currentTime) {
  if (!isExportActive) return;
  
  updateExportProgressUI(currentTime, exportTotalDuration);

  if (currentTime >= exportTotalDuration) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }
}

function updateExportProgressUI(currentTime, totalTime) {
  const progressBar = document.getElementById('export-progress-bar');
  const progressText = document.getElementById('export-progress-text');

  const pct = Math.min(100, Math.max(0, (currentTime / totalTime) * 100));

  if (progressBar) {
    progressBar.style.width = `${pct}%`;
  }
  if (progressText) {
    progressText.textContent = `${formatTime(currentTime)} / ${formatTime(totalTime)}`;
  }
}

function triggerDownload(blob, ext) {
  const url = URL.createObjectURL(blob);
  const titleInput = document.getElementById('project-title-input');
  let filename = (titleInput ? titleInput.value.trim() : '') || 'video-canvas-export';
  
  filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  if (!filename.toLowerCase().endsWith('.' + ext)) {
    filename += '.' + ext;
  }
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 15000);
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function showExportModal(onCancel) {
  let modal = document.getElementById('export-progress-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'export-progress-modal';
    modal.className = 'fixed inset-0 bg-zinc-950/85 backdrop-blur flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-editor-panel border border-editor-surface rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
          <!-- Inline SVG loader-2 replaces Lucide dependency -->
          <svg class="w-4 h-4 text-editor-accent animate-spin" stroke="currentColor"><use href="#icon-loader-2"></use></svg>
          <span>Rendering Video</span>
        </h3>
        
        <p class="text-xs text-zinc-400">
          Processing tracks and components...
        </p>

        <!-- Progress bar container -->
        <div class="space-y-1">
          <div class="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div id="export-progress-bar" class="h-full bg-editor-accent rounded-full transition-all duration-100" style="width: 0%;"></div>
          </div>
          <div class="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>Progress</span>
            <span id="export-progress-text">0:00 / 0:00</span>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button id="export-cancel-btn" class="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2 rounded-md transition-all active:scale-95">
            Cancel Render
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.remove('hidden');
  
  const cancelBtn = document.getElementById('export-cancel-btn');
  cancelBtn.onclick = onCancel;
}

function hideExportModal() {
  const modal = document.getElementById('export-progress-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}
