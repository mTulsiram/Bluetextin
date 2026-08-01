/**
 * EditorState - Single Source of Truth for Video Canvas Engineering Studio.
 * Maintains media assets, timeline tracks, clips data, playhead time, zoom, and history.
 */

export const EditorState = {
  // Array of imported media assets: { id, name, type, url, duration, thumbnailUrl }
  mediaBin: [
    { id: 'media-1', name: 'cinematic_intro.mp4', type: 'video', url: '', duration: 12.0, thumbnailUrl: '' },
    { id: 'media-2', name: 'drone_shot_beach.mov', type: 'video', url: '', duration: 45.0, thumbnailUrl: '' },
    { id: 'media-3', name: 'studio_overlay.png', type: 'image', url: '', duration: 10.0, thumbnailUrl: '' },
    { id: 'media-4', name: 'interview_take_2.mp4', type: 'video', url: '', duration: 24.0, thumbnailUrl: '' },
    { id: 'media-5', name: 'lofi_chill_vibes.mp3', type: 'audio', url: '', duration: 165.0, thumbnailUrl: '' },
    { id: 'media-6', name: 'cyberpunk_beat.wav', type: 'audio', url: '', duration: 90.0, thumbnailUrl: '' }
  ],

  // Matches the 4 visual timeline rows in the DOM
  tracks: [
    { id: 'track-1', type: 'video', name: 'Video 1', muted: false, locked: false },
    { id: 'track-2', type: 'video', name: 'Video 2', muted: false, locked: false },
    { id: 'track-3', type: 'audio', name: 'Audio 1', muted: false, locked: false },
    { id: 'track-4', type: 'text', name: 'Text 1', muted: false, locked: false }
  ],

  // Track placement details and properties for every clip
  clips: [
    {
      id: 'clip-video-1',
      trackId: 'track-1',
      mediaId: 'media-2', // drone_shot_beach.mov
      startTime: 2.0,      // 60px / 30px/s = 2.0s
      duration: 8.0,       // 240px / 30px/s = 8.0s
      trimIn: 0,
      trimOut: 8.0,
      x: 0,
      y: 0,
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      opacity: 100,
      saturation: 100,
      contrast: 100
    },
    {
      id: 'clip-video-2',
      trackId: 'track-2',
      mediaId: 'media-1', // cinematic_intro.mp4
      startTime: 12.0,     // 360px / 30px/s = 12.0s
      duration: 6.0,       // 180px / 30px/s = 6.0s
      trimIn: 0,
      trimOut: 6.0,
      x: 0,
      y: 0,
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      opacity: 100,
      saturation: 100,
      contrast: 100
    },
    {
      id: 'clip-audio-1',
      trackId: 'track-3',
      mediaId: 'media-5', // lofi_chill_vibes.mp3
      startTime: 1.333,    // 40px / 30px/s = 1.333s
      duration: 16.666,    // 500px / 30px/s = 16.666s
      trimIn: 0,
      trimOut: 16.666,
      x: 0,
      y: 0,
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      opacity: 100,
      saturation: 100,
      contrast: 100
    },
    {
      id: 'clip-text-1',
      trackId: 'track-4',
      mediaId: 'media-3', // studio_overlay.png
      startTime: 3.333,    // 100px / 30px/s = 3.333s
      duration: 6.0,       // 180px / 30px/s = 6.0s
      trimIn: 0,
      trimOut: 6.0,
      x: 0,
      y: 0,
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      opacity: 100,
      saturation: 100,
      contrast: 100
    }
  ],

  playheadTime: 4.4,     // Initial scrubber position
  selectedClipId: null,
  zoomPxPerSecond: 30,   // Horizontal scale factor
  history: [],          // Undo stack
  redoStack: [],        // Redo stack

  // Save the current state of clips before performing a mutation
  pushHistory() {
    this.history.push(JSON.stringify(this.clips));
    this.redoStack = []; // Clear redo stack on any new edit
  },

  // Undo the last edit
  undo() {
    if (this.history.length > 0) {
      this.redoStack.push(JSON.stringify(this.clips));
      this.clips = JSON.parse(this.history.pop());
      return true;
    }
    return false;
  },

  // Redo the last undone edit
  redo() {
    if (this.redoStack.length > 0) {
      this.history.push(JSON.stringify(this.clips));
      this.clips = JSON.parse(this.redoStack.pop());
      return true;
    }
    return false;
  }
};
