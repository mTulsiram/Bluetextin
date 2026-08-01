
window.MediaEngine = {
  createSilenceBuffer: function(ctx, duration) {
    return ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  }
};
