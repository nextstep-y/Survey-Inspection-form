window.CLARK_BEAM_POINTS = [];

window.CLARK_BEAM_REVIEW_NOTE = {
  status: "review_required",
  source: "NSCR-GCR-N03-CRKSTN-DRC-ST-000033.pdf",
  note: "B100 X01-X02/Y02 draft points were removed because the footprint must be recalculated from FG22 and sloped foundation girder boundaries before use."
};

// GitHub Pages hotfix: the inline Clark Station grid parser in older index.html
// used an unescaped digit matcher, so X02/T02 normalized back to the first grid.
// This runs after the inline script has defined the global function and replaces it
// without needing to re-upload the large index.html file.
document.addEventListener('DOMContentLoaded', () => {
  window.clarkStationNormalizeGridLabel = function clarkStationNormalizeGridLabel(value, axisPrefix) {
    const raw = String(value || '').toUpperCase().replace(/[’`]/g, "'").replace(/\s+/g, '');
    const m = raw.match(new RegExp(`${axisPrefix}(\\d{1,2})(['"])?`));
    if (!m) return '';
    return `${axisPrefix}${String(parseInt(m[1], 10)).padStart(2, '0')}${m[2] || ''}`;
  };
});
