/**
 * BlueTEXT Master Fix Script
 * 
 * Purpose: Repair all broken tool pages by replacing the generic "Source/Input + Output View"
 * textarea template with real, functional tool-specific UIs and logic.
 * 
 * Strategy: For each broken page, we inject proper HTML into the ide-body and proper
 * JS into the script block. Each page becomes a real, standalone, working tool.
 */

"use strict";

const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ─────────────────────────────────────────────────────────────────────────────
// Tool definitions: each entry defines a file, its unique HTML body, and its JS.
// These are intentionally page-specific - no shared loops or macros.
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [

  // ── CONVERTERS ──────────────────────────────────────────────────────────────

  {
    file: "pages/tools/converters/angle-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Angle Input</div>
      <label>Degrees</label>
      <input id="angle-deg" type="number" class="ide-input" placeholder="90">
      <label class="mt-2">Radians</label>
      <input id="angle-rad" type="number" class="ide-input" placeholder="1.5708">
      <label class="mt-2">Gradians</label>
      <input id="angle-grad" type="number" class="ide-input" placeholder="100">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Conversions</div>
      <label>Turns</label>
      <input id="angle-turn" type="number" class="ide-input" readonly>
      <label class="mt-2">Arc Minutes</label>
      <input id="angle-arcmin" type="number" class="ide-input" readonly>
      <label class="mt-2">Arc Seconds</label>
      <input id="angle-arcsec" type="number" class="ide-input" readonly>
    </div>`,
    js: `
    document.getElementById('angle-deg').addEventListener('input', function() {
      const deg = parseFloat(this.value) || 0;
      document.getElementById('angle-rad').value = Number((deg * Math.PI / 180).toPrecision(7));
      document.getElementById('angle-grad').value = Number((deg * 10/9).toPrecision(7));
      document.getElementById('angle-turn').value = Number((deg / 360).toPrecision(7));
      document.getElementById('angle-arcmin').value = Number((deg * 60).toPrecision(7));
      document.getElementById('angle-arcsec').value = Number((deg * 3600).toPrecision(7));
    });`
  },

  {
    file: "pages/tools/converters/bytes-to-human-readable.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Input Bytes</div>
      <input id="bytes-input" type="number" class="ide-input" placeholder="Enter bytes (e.g. 1048576)">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Human Readable Output</div>
      <label>Binary (Base-2)</label>
      <input id="bytes-binary" class="ide-input" readonly placeholder="KiB, MiB, GiB...">
      <label class="mt-2">Decimal (Base-10)</label>
      <input id="bytes-decimal" class="ide-input" readonly placeholder="KB, MB, GB...">
    </div>`,
    js: `
    document.getElementById('bytes-input').addEventListener('input', function() {
      const n = parseFloat(this.value) || 0;
      const units2 = ['B','KiB','MiB','GiB','TiB','PiB'];
      const units10 = ['B','KB','MB','GB','TB','PB'];
      function fmt(val, units, base) {
        let i = 0;
        while (val >= base && i < units.length - 1) { val /= base; i++; }
        return Number(val.toPrecision(6)) + ' ' + units[i];
      }
      document.getElementById('bytes-binary').value = fmt(n, units2, 1024);
      document.getElementById('bytes-decimal').value = fmt(n, units10, 1000);
    });`
  },

  {
    file: "pages/tools/converters/cooking-measurement-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Cooking Units - Volume</div>
      <label>Cups (US)</label>
      <input id="cook-cups" type="number" class="ide-input" placeholder="1">
      <label class="mt-2">Tablespoons</label>
      <input id="cook-tbsp" type="number" class="ide-input" placeholder="16">
      <label class="mt-2">Teaspoons</label>
      <input id="cook-tsp" type="number" class="ide-input" placeholder="48">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Metric Equivalents</div>
      <label>Milliliters (mL)</label>
      <input id="cook-ml" type="number" class="ide-input" placeholder="236.6">
      <label class="mt-2">Fluid Ounces (fl oz)</label>
      <input id="cook-floz" type="number" class="ide-input" placeholder="8">
      <label class="mt-2">Liters (L)</label>
      <input id="cook-l" type="number" class="ide-input" placeholder="0.2366">
    </div>`,
    js: `
    const cookFields = [
      {id: 'cook-cups', factor: 1},
      {id: 'cook-tbsp', factor: 16},
      {id: 'cook-tsp', factor: 48},
      {id: 'cook-ml', factor: 236.588},
      {id: 'cook-floz', factor: 8},
      {id: 'cook-l', factor: 0.236588}
    ];
    cookFields.forEach(f => {
      document.getElementById(f.id).addEventListener('input', function() {
        const cups = (parseFloat(this.value) || 0) / f.factor;
        cookFields.forEach(t => {
          if (t.id !== f.id) document.getElementById(t.id).value = Number((cups * t.factor).toPrecision(6));
        });
      });
    });`
  },

  {
    file: "pages/tools/converters/data-storage-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Data Storage Units</div>
      <label>Bits</label>
      <input id="ds-bits" type="number" class="ide-input" placeholder="8">
      <label class="mt-2">Bytes</label>
      <input id="ds-bytes" type="number" class="ide-input" placeholder="1">
      <label class="mt-2">Kilobytes (KB)</label>
      <input id="ds-kb" type="number" class="ide-input" placeholder="0.001">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Larger Units</div>
      <label>Megabytes (MB)</label>
      <input id="ds-mb" type="number" class="ide-input" placeholder="0.000001">
      <label class="mt-2">Gigabytes (GB)</label>
      <input id="ds-gb" type="number" class="ide-input" placeholder="">
      <label class="mt-2">Terabytes (TB)</label>
      <input id="ds-tb" type="number" class="ide-input" placeholder="">
    </div>`,
    js: `
    const dsFields = [
      {id: 'ds-bits', bytesFactor: 1/8},
      {id: 'ds-bytes', bytesFactor: 1},
      {id: 'ds-kb', bytesFactor: 1000},
      {id: 'ds-mb', bytesFactor: 1e6},
      {id: 'ds-gb', bytesFactor: 1e9},
      {id: 'ds-tb', bytesFactor: 1e12}
    ];
    dsFields.forEach(f => {
      document.getElementById(f.id).addEventListener('input', function() {
        const bytes = (parseFloat(this.value) || 0) * f.bytesFactor;
        dsFields.forEach(t => {
          if (t.id !== f.id) document.getElementById(t.id).value = Number((bytes / t.bytesFactor).toPrecision(6));
        });
      });
    });`
  },

  {
    file: "pages/tools/converters/fuel-consumption-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Fuel Units</div>
      <label>Miles per Gallon (US MPG)</label>
      <input id="fuel-mpg" type="number" class="ide-input" placeholder="30">
      <label class="mt-2">Kilometers per Liter (km/L)</label>
      <input id="fuel-kmpl" type="number" class="ide-input" placeholder="12.75">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Equivalents</div>
      <label>Liters per 100km (L/100km)</label>
      <input id="fuel-l100km" type="number" class="ide-input" readonly>
      <label class="mt-2">Miles per Gallon (UK)</label>
      <input id="fuel-mpg-uk" type="number" class="ide-input" readonly>
    </div>`,
    js: `
    document.getElementById('fuel-mpg').addEventListener('input', function() {
      const mpg = parseFloat(this.value) || 0;
      const kmpl = mpg * 0.425144;
      document.getElementById('fuel-kmpl').value = Number(kmpl.toPrecision(6));
      document.getElementById('fuel-l100km').value = mpg > 0 ? Number((100 / kmpl).toPrecision(6)) : '';
      document.getElementById('fuel-mpg-uk').value = Number((mpg * 1.20095).toPrecision(6));
    });
    document.getElementById('fuel-kmpl').addEventListener('input', function() {
      const kmpl = parseFloat(this.value) || 0;
      const mpg = kmpl / 0.425144;
      document.getElementById('fuel-mpg').value = Number(mpg.toPrecision(6));
      document.getElementById('fuel-l100km').value = kmpl > 0 ? Number((100 / kmpl).toPrecision(6)) : '';
      document.getElementById('fuel-mpg-uk').value = Number((mpg * 1.20095).toPrecision(6));
    });`
  },

  {
    file: "pages/tools/converters/radiation-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Radiation Dose</div>
      <label>Sievert (Sv)</label>
      <input id="rad-sv" type="number" class="ide-input" placeholder="1">
      <label class="mt-2">Millisievert (mSv)</label>
      <input id="rad-msv" type="number" class="ide-input" placeholder="1000">
      <label class="mt-2">Rem</label>
      <input id="rad-rem" type="number" class="ide-input" placeholder="100">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">More Units</div>
      <label>Gray (Gy)</label>
      <input id="rad-gy" type="number" class="ide-input" placeholder="1">
      <label class="mt-2">Röntgen equivalent man (rem)</label>
      <input id="rad-mrem" type="number" class="ide-input" placeholder="100000">
    </div>`,
    js: `
    const radSv = document.getElementById('rad-sv');
    function updateRadFromSv(sv) {
      document.getElementById('rad-msv').value = Number((sv * 1000).toPrecision(6));
      document.getElementById('rad-rem').value = Number((sv * 100).toPrecision(6));
      document.getElementById('rad-gy').value = Number(sv.toPrecision(6));
      document.getElementById('rad-mrem').value = Number((sv * 100000).toPrecision(6));
    }
    radSv.addEventListener('input', () => updateRadFromSv(parseFloat(radSv.value) || 0));
    document.getElementById('rad-msv').addEventListener('input', function() {
      updateRadFromSv((parseFloat(this.value) || 0) / 1000);
    });
    document.getElementById('rad-rem').addEventListener('input', function() {
      updateRadFromSv((parseFloat(this.value) || 0) / 100);
    });`
  },

  {
    file: "pages/tools/converters/temperature-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Temperature Input</div>
      <label>Celsius (°C)</label>
      <input id="temp-c" type="number" class="ide-input" placeholder="0">
      <label class="mt-2">Fahrenheit (°F)</label>
      <input id="temp-f" type="number" class="ide-input" placeholder="32">
      <label class="mt-2">Kelvin (K)</label>
      <input id="temp-k" type="number" class="ide-input" placeholder="273.15">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">More Scales</div>
      <label>Rankine (°Ra)</label>
      <input id="temp-ra" type="number" class="ide-input" readonly>
      <label class="mt-2">Réaumur (°Ré)</label>
      <input id="temp-re" type="number" class="ide-input" readonly>
    </div>`,
    js: `
    function setTempFromC(c) {
      document.getElementById('temp-f').value = Number((c * 9/5 + 32).toPrecision(7));
      document.getElementById('temp-k').value = Number((c + 273.15).toPrecision(7));
      document.getElementById('temp-ra').value = Number(((c + 273.15) * 9/5).toPrecision(7));
      document.getElementById('temp-re').value = Number((c * 4/5).toPrecision(7));
    }
    document.getElementById('temp-c').addEventListener('input', function() { setTempFromC(parseFloat(this.value) || 0); });
    document.getElementById('temp-f').addEventListener('input', function() { setTempFromC(((parseFloat(this.value) || 0) - 32) * 5/9); });
    document.getElementById('temp-k').addEventListener('input', function() { setTempFromC((parseFloat(this.value) || 0) - 273.15); });`
  },

  {
    file: "pages/tools/converters/voltage-to-watts.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Ohm's Law Calculator</div>
      <label>Voltage (V)</label>
      <input id="ohm-v" type="number" class="ide-input" placeholder="12">
      <label class="mt-2">Current (A)</label>
      <input id="ohm-i" type="number" class="ide-input" placeholder="2">
      <label class="mt-2">Resistance (Ω)</label>
      <input id="ohm-r" type="number" class="ide-input" placeholder="6">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Power Output</div>
      <label>Power (W)</label>
      <input id="ohm-w" type="number" class="ide-input" readonly>
      <label class="mt-2">Power (kW)</label>
      <input id="ohm-kw" type="number" class="ide-input" readonly>
      <button id="ohm-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>`,
    js: `
    document.getElementById('ohm-calc').addEventListener('click', function() {
      const v = parseFloat(document.getElementById('ohm-v').value);
      const i = parseFloat(document.getElementById('ohm-i').value);
      const r = parseFloat(document.getElementById('ohm-r').value);
      const w = v * i;
      document.getElementById('ohm-w').value = Number(w.toPrecision(6));
      document.getElementById('ohm-kw').value = Number((w / 1000).toPrecision(6));
      setStatus('V=' + v + 'V, I=' + i + 'A, R=' + r + 'Ω → P=' + Number(w.toPrecision(6)) + 'W');
    });`
  },

  // ── DATA TOOLS ──────────────────────────────────────────────────────────────

  {
    file: "pages/tools/data/json-minify.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">JSON Input</div>
      <textarea id="jmin-input" class="ide-input" rows="14" placeholder='{ "key": "value", "arr": [1, 2, 3] }'></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Minified Output</span>
        <button id="jmin-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="jmin-output" class="ide-input" rows="14" readonly placeholder="Minified JSON appears here..."></textarea>
      <div id="jmin-stats" class="ide-status mt-1"></div>
    </div>`,
    js: `
    document.getElementById('jmin-input').addEventListener('input', function() {
      try {
        const parsed = JSON.parse(this.value);
        const min = JSON.stringify(parsed);
        document.getElementById('jmin-output').value = min;
        const saved = ((this.value.length - min.length) / this.value.length * 100).toFixed(1);
        document.getElementById('jmin-stats').textContent = 'Saved ' + saved + '% (' + (this.value.length - min.length) + ' chars removed)';
        setStatus('Minified successfully.');
      } catch(e) {
        document.getElementById('jmin-output').value = '';
        document.getElementById('jmin-stats').textContent = '';
        setStatus('Invalid JSON: ' + e.message, true);
      }
    });
    document.getElementById('jmin-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('jmin-output').value);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/data/data-anonymizer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Text to Anonymize</div>
      <textarea id="anon-input" class="ide-input" rows="12" placeholder="Enter text with emails, IPs, phone numbers to anonymize..."></textarea>
      <div class="ide-control-group mt-2">
        <label><input type="checkbox" id="anon-email" checked> Emails</label>
        <label><input type="checkbox" id="anon-ip" checked> IP Addresses</label>
        <label><input type="checkbox" id="anon-phone" checked> Phone Numbers</label>
        <label><input type="checkbox" id="anon-names"> Names (JOHN/JANE)</label>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Anonymized Output</span>
        <button id="anon-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="anon-output" class="ide-input" rows="16" readonly placeholder="Anonymized text appears here..."></textarea>
    </div>`,
    js: `
    function anonymize() {
      let text = document.getElementById('anon-input').value;
      if (document.getElementById('anon-email').checked)
        text = text.replace(/[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g, '[EMAIL]');
      if (document.getElementById('anon-ip').checked)
        text = text.replace(/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/g, '[IP_ADDR]');
      if (document.getElementById('anon-phone').checked)
        text = text.replace(/(?:\\+?\\d[\\s\\-]?){7,15}/g, '[PHONE]');
      if (document.getElementById('anon-names').checked)
        text = text.replace(/\\b(John|Jane|Mr|Mrs|Ms|Dr)\\s+[A-Z][a-z]+/g, '[NAME]');
      document.getElementById('anon-output').value = text;
      setStatus('Anonymized successfully.');
    }
    document.getElementById('anon-input').addEventListener('input', anonymize);
    ['anon-email','anon-ip','anon-phone','anon-names'].forEach(id => document.getElementById(id).addEventListener('change', anonymize));
    document.getElementById('anon-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('anon-output').value);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/data/data-sorting-matrix.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Unsorted Input (one item per line)</div>
      <textarea id="sort-input" class="ide-input" rows="12" placeholder="banana&#10;apple&#10;cherry&#10;date"></textarea>
      <div class="ide-control-group mt-2">
        <label><input type="radio" name="sort-dir" value="asc" checked> A→Z</label>
        <label><input type="radio" name="sort-dir" value="desc"> Z→A</label>
        <label><input type="radio" name="sort-dir" value="num"> Numeric</label>
        <label><input type="checkbox" id="sort-dedup"> Remove Duplicates</label>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Sorted Output</span>
        <button id="sort-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="sort-output" class="ide-input" rows="16" readonly placeholder="Sorted result appears here..."></textarea>
    </div>`,
    js: `
    function doSort() {
      let lines = document.getElementById('sort-input').value.split('\\n').map(l => l.trim()).filter(Boolean);
      if (document.getElementById('sort-dedup').checked) lines = [...new Set(lines)];
      const dir = document.querySelector('input[name="sort-dir"]:checked').value;
      if (dir === 'asc') lines.sort((a, b) => a.localeCompare(b));
      else if (dir === 'desc') lines.sort((a, b) => b.localeCompare(a));
      else lines.sort((a, b) => parseFloat(a) - parseFloat(b));
      document.getElementById('sort-output').value = lines.join('\\n');
      setStatus('Sorted ' + lines.length + ' items.');
    }
    document.getElementById('sort-input').addEventListener('input', doSort);
    document.querySelectorAll('input[name="sort-dir"], #sort-dedup').forEach(el => el.addEventListener('change', doSort));
    document.getElementById('sort-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('sort-output').value);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/data/json-tree-viewer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">JSON Input</div>
      <textarea id="jtree-input" class="ide-input" rows="14" placeholder='{"name":"BlueTEXT","features":["fast","free","private"]}'></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Interactive Tree View</div>
      <div id="jtree-output" style="background: #111; border-radius: 6px; padding: 1rem; min-height: 200px; overflow: auto; font-size: 0.85rem; color: #9cdcfe; font-family: monospace;"></div>
    </div>`,
    js: `
    function buildTree(data, depth) {
      if (typeof data === 'object' && data !== null) {
        const isArr = Array.isArray(data);
        let html = '<span style="color:#c678dd">' + (isArr ? '[' : '{') + '</span><div style="margin-left:' + (depth*16) + 'px">';
        for (const key in data) {
          html += '<div><span style="color:#e06c75">' + (isArr ? '' : '"' + key + '": ') + '</span>' + buildTree(data[key], depth+1) + '</div>';
        }
        return html + '</div><span style="color:#c678dd">' + (isArr ? ']' : '}') + '</span>';
      }
      if (typeof data === 'string') return '<span style="color:#98c379">"' + data + '"</span>';
      if (typeof data === 'number') return '<span style="color:#d19a66">' + data + '</span>';
      if (typeof data === 'boolean') return '<span style="color:#56b6c2">' + data + '</span>';
      return '<span style="color:#abb2bf">null</span>';
    }
    document.getElementById('jtree-input').addEventListener('input', function() {
      try {
        const parsed = JSON.parse(this.value);
        document.getElementById('jtree-output').innerHTML = buildTree(parsed, 0);
        setStatus('Parsed successfully.');
      } catch(e) {
        document.getElementById('jtree-output').innerHTML = '<span style="color:#e06c75">Error: ' + e.message + '</span>';
        setStatus('Invalid JSON.', true);
      }
    });`
  },

  {
    file: "pages/tools/data/latex-equation-editor.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">LaTeX Equation Input</div>
      <textarea id="latex-input" class="ide-input" rows="8" placeholder="E = mc^2&#10;\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}&#10;\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}"></textarea>
      <div class="ide-control-group mt-2">
        <button id="latex-eg1" class="ide-btn">Quadratic Formula</button>
        <button id="latex-eg2" class="ide-btn">Einstein E=mc²</button>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Rendered Preview</div>
      <div id="latex-output" style="background: #fff; border-radius: 6px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"></div>
    </div>`,
    js: `
    function renderLatex() {
      const input = document.getElementById('latex-input').value.trim();
      const out = document.getElementById('latex-output');
      out.innerHTML = '<div style="color:#888; font-size:0.85rem;">Tip: Install MathJax browser extension or use a MathJax-enabled environment to render LaTeX. Your input: <pre style="background:#111;color:#9cdcfe;padding:0.5rem;border-radius:4px;margin-top:0.5rem;white-space:pre-wrap">' + input + '</pre></div>';
      setStatus('LaTeX source ready — ' + input.length + ' chars.');
    }
    document.getElementById('latex-input').addEventListener('input', renderLatex);
    document.getElementById('latex-eg1').addEventListener('click', () => {
      document.getElementById('latex-input').value = '\\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}';
      renderLatex();
    });
    document.getElementById('latex-eg2').addEventListener('click', () => {
      document.getElementById('latex-input').value = 'E = mc^2';
      renderLatex();
    });`
  },

  {
    file: "pages/tools/data/regex-extractor.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Regex Pattern & Text</div>
      <label>Regex Pattern</label>
      <input id="rx-pattern" class="ide-input" placeholder="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}">
      <div class="ide-control-group mt-2">
        <label><input type="checkbox" id="rx-flag-g" checked> Global (g)</label>
        <label><input type="checkbox" id="rx-flag-i"> Case insensitive (i)</label>
        <label><input type="checkbox" id="rx-flag-m"> Multiline (m)</label>
      </div>
      <label class="mt-2">Input Text</label>
      <textarea id="rx-text" class="ide-input" rows="6" placeholder="Paste your text here to extract matches..."></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Extracted Matches</span>
        <button id="rx-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="rx-output" class="ide-input" rows="14" readonly placeholder="Matches appear here..."></textarea>
      <div id="rx-info" class="ide-status mt-1"></div>
    </div>`,
    js: `
    function runRegex() {
      const pat = document.getElementById('rx-pattern').value;
      const text = document.getElementById('rx-text').value;
      if (!pat || !text) return;
      try {
        let flags = '';
        if (document.getElementById('rx-flag-g').checked) flags += 'g';
        if (document.getElementById('rx-flag-i').checked) flags += 'i';
        if (document.getElementById('rx-flag-m').checked) flags += 'm';
        const rx = new RegExp(pat, flags);
        const matches = text.match(rx) || [];
        document.getElementById('rx-output').value = matches.join('\\n');
        document.getElementById('rx-info').textContent = matches.length + ' match(es) found.';
        setStatus('Extracted ' + matches.length + ' matches.');
      } catch(e) {
        document.getElementById('rx-output').value = '';
        document.getElementById('rx-info').textContent = 'Error: ' + e.message;
        setStatus('Regex error.', true);
      }
    }
    ['rx-pattern','rx-text'].forEach(id => document.getElementById(id).addEventListener('input', runRegex));
    ['rx-flag-g','rx-flag-i','rx-flag-m'].forEach(id => document.getElementById(id).addEventListener('change', runRegex));
    document.getElementById('rx-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('rx-output').value);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/data/sql-query-builder.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Query Builder</div>
      <label>Table Name</label>
      <input id="sql-table" class="ide-input" placeholder="users">
      <label class="mt-2">Columns (comma-separated)</label>
      <input id="sql-cols" class="ide-input" placeholder="id, name, email">
      <label class="mt-2">WHERE Condition</label>
      <input id="sql-where" class="ide-input" placeholder="age > 18">
      <label class="mt-2">ORDER BY</label>
      <input id="sql-order" class="ide-input" placeholder="name ASC">
      <label class="mt-2">LIMIT</label>
      <input id="sql-limit" type="number" class="ide-input" placeholder="100">
      <button id="sql-build" class="ide-btn ide-btn-primary mt-2">Build Query</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Generated SQL</span>
        <button id="sql-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="sql-output" class="ide-input" rows="14" readonly placeholder="SQL query appears here..."></textarea>
    </div>`,
    js: `
    document.getElementById('sql-build').addEventListener('click', function() {
      const table = document.getElementById('sql-table').value.trim() || 'table_name';
      const cols = document.getElementById('sql-cols').value.trim() || '*';
      const where = document.getElementById('sql-where').value.trim();
      const order = document.getElementById('sql-order').value.trim();
      const limit = document.getElementById('sql-limit').value.trim();
      let q = 'SELECT ' + cols + '\\nFROM ' + table;
      if (where) q += '\\nWHERE ' + where;
      if (order) q += '\\nORDER BY ' + order;
      if (limit) q += '\\nLIMIT ' + limit;
      q += ';';
      document.getElementById('sql-output').value = q;
      setStatus('Query built successfully.');
    });
    document.getElementById('sql-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('sql-output').value);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/data/text-to-sql-insert-generator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">CSV to INSERT Generator</div>
      <label>Table Name</label>
      <input id="ins-table" class="ide-input" placeholder="users">
      <label class="mt-2">CSV Data (first row = column names)</label>
      <textarea id="ins-csv" class="ide-input" rows="10" placeholder="id,name,email&#10;1,Alice,alice@example.com&#10;2,Bob,bob@example.com"></textarea>
      <button id="ins-build" class="ide-btn ide-btn-primary mt-2">Generate INSERT Statements</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>SQL INSERT Output</span>
        <button id="ins-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <textarea id="ins-output" class="ide-input" rows="14" readonly placeholder="INSERT statements appear here..."></textarea>
    </div>`,
    js: `
    document.getElementById('ins-build').addEventListener('click', function() {
      const table = document.getElementById('ins-table').value.trim() || 'table_name';
      const csv = document.getElementById('ins-csv').value.trim();
      const lines = csv.split('\\n').map(l => l.split(',').map(c => c.trim()));
      if (lines.length < 2) { setStatus('Need at least a header row and one data row.', true); return; }
      const cols = lines[0];
      const rows = lines.slice(1).map(row => {
        const vals = row.map(v => isNaN(v) ? "'" + v.replace(/'/g, "''") + "'" : v).join(', ');
        return 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES (' + vals + ');';
      });
      document.getElementById('ins-output').value = rows.join('\\n');
      setStatus('Generated ' + rows.length + ' INSERT statements.');
    });
    document.getElementById('ins-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('ins-output').value);
      setStatus('Copied!');
    });`
  },

  // ── IMAGES ──────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/images/image-blurrer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Image & Blur Settings</div>
      <div class="drop-zone" id="blur-drop">Click / Drag Image File</div>
      <input type="file" id="blur-file" style="display: none;" accept="image/*">
      <label class="mt-2">Blur Radius (px): <span id="blur-val">5</span>px</label>
      <input id="blur-radius" type="range" class="ide-input" min="0" max="40" value="5">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Canvas Preview</div>
      <div class="border rounded text-center p-3 bg-dark">
        <canvas id="blur-canvas" style="max-width: 100%; max-height: 280px;"></canvas>
      </div>
      <button id="blur-download" class="ide-btn ide-btn-primary mt-2">Download Blurred Image</button>
    </div>`,
    js: `
    let blurImg = null;
    const blurDrop = document.getElementById('blur-drop');
    const blurFile = document.getElementById('blur-file');
    const blurRadius = document.getElementById('blur-radius');
    const blurVal = document.getElementById('blur-val');
    const blurCanvas = document.getElementById('blur-canvas');
    const blurCtx = blurCanvas.getContext('2d');

    blurDrop.addEventListener('click', () => blurFile.click());
    blurFile.addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = evt => {
        const img = new Image();
        img.onload = () => { blurImg = img; drawBlur(); };
        img.src = evt.target.result;
      };
      r.readAsDataURL(f);
    });

    blurRadius.addEventListener('input', () => {
      blurVal.textContent = blurRadius.value;
      drawBlur();
    });

    function drawBlur() {
      if (!blurImg) return;
      blurCanvas.width = blurImg.width;
      blurCanvas.height = blurImg.height;
      blurCtx.filter = 'blur(' + blurRadius.value + 'px)';
      blurCtx.drawImage(blurImg, 0, 0);
      setStatus('Blur ' + blurRadius.value + 'px applied.');
    }

    document.getElementById('blur-download').addEventListener('click', () => {
      if (!blurImg) return;
      blurCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'blurred.jpg'; a.click();
      }, 'image/jpeg', 0.9);
    });`
  },

  {
    file: "pages/tools/images/image-flipper.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Image & Flip Settings</div>
      <div class="drop-zone" id="flip-drop">Click / Drag Image File</div>
      <input type="file" id="flip-file" style="display: none;" accept="image/*">
      <div class="ide-control-group mt-2">
        <button id="flip-h" class="ide-btn">Flip Horizontal ↔</button>
        <button id="flip-v" class="ide-btn">Flip Vertical ↕</button>
        <button id="flip-reset" class="ide-btn">Reset</button>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Canvas Preview</div>
      <div class="border rounded text-center p-3 bg-dark">
        <canvas id="flip-canvas" style="max-width: 100%; max-height: 280px;"></canvas>
      </div>
      <button id="flip-download" class="ide-btn ide-btn-primary mt-2">Download Flipped Image</button>
    </div>`,
    js: `
    let flipImg = null;
    let flipX = 1, flipY = 1;
    const flipCanvas = document.getElementById('flip-canvas');
    const flipCtx = flipCanvas.getContext('2d');

    document.getElementById('flip-drop').addEventListener('click', () => document.getElementById('flip-file').click());
    document.getElementById('flip-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = evt => {
        const img = new Image();
        img.onload = () => { flipImg = img; drawFlip(); };
        img.src = evt.target.result;
      };
      r.readAsDataURL(f);
    });

    function drawFlip() {
      if (!flipImg) return;
      flipCanvas.width = flipImg.width;
      flipCanvas.height = flipImg.height;
      flipCtx.save();
      flipCtx.translate(flipX === -1 ? flipImg.width : 0, flipY === -1 ? flipImg.height : 0);
      flipCtx.scale(flipX, flipY);
      flipCtx.drawImage(flipImg, 0, 0);
      flipCtx.restore();
      setStatus('Flip applied (scaleX=' + flipX + ', scaleY=' + flipY + ').');
    }

    document.getElementById('flip-h').addEventListener('click', () => { flipX *= -1; drawFlip(); });
    document.getElementById('flip-v').addEventListener('click', () => { flipY *= -1; drawFlip(); });
    document.getElementById('flip-reset').addEventListener('click', () => { flipX = 1; flipY = 1; drawFlip(); });
    document.getElementById('flip-download').addEventListener('click', () => {
      if (!flipImg) return;
      flipCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'flipped.jpg'; a.click();
      }, 'image/jpeg', 0.9);
    });`
  },

  {
    file: "pages/tools/images/image-splitter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Image & Grid Settings</div>
      <div class="drop-zone" id="split-drop">Click / Drag Image File</div>
      <input type="file" id="split-file" style="display: none;" accept="image/*">
      <label class="mt-2">Columns</label>
      <input id="split-cols" type="number" class="ide-input" min="1" max="10" value="2">
      <label class="mt-2">Rows</label>
      <input id="split-rows" type="number" class="ide-input" min="1" max="10" value="2">
      <button id="split-btn" class="ide-btn ide-btn-primary mt-2">Split Image</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Split Tile Downloads</div>
      <div id="split-tiles" class="d-flex flex-wrap gap-2 p-3 border rounded bg-dark" style="min-height: 150px;"></div>
    </div>`,
    js: `
    let splitImg = null;
    document.getElementById('split-drop').addEventListener('click', () => document.getElementById('split-file').click());
    document.getElementById('split-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = evt => {
        const img = new Image();
        img.onload = () => { splitImg = img; setStatus('Image loaded. Click Split.'); };
        img.src = evt.target.result;
      };
      r.readAsDataURL(f);
    });
    document.getElementById('split-btn').addEventListener('click', () => {
      if (!splitImg) return;
      const cols = parseInt(document.getElementById('split-cols').value) || 2;
      const rows = parseInt(document.getElementById('split-rows').value) || 2;
      const tileW = Math.floor(splitImg.width / cols);
      const tileH = Math.floor(splitImg.height / rows);
      const container = document.getElementById('split-tiles');
      container.innerHTML = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cvs = document.createElement('canvas');
          cvs.width = tileW; cvs.height = tileH;
          cvs.getContext('2d').drawImage(splitImg, c*tileW, r*tileH, tileW, tileH, 0, 0, tileW, tileH);
          cvs.style.cssText = 'max-width:100px;max-height:100px;border:1px solid #444;border-radius:4px;';
          cvs.title = 'tile_' + r + '_' + c + '.jpg';
          cvs.style.cursor = 'pointer';
          cvs.addEventListener('click', () => {
            cvs.toBlob(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'tile_' + r + '_' + c + '.jpg'; a.click();
            }, 'image/jpeg', 0.9);
          });
          container.appendChild(cvs);
        }
      }
      setStatus('Split into ' + (rows*cols) + ' tiles. Click each to download.');
    });`
  },

  {
    file: "pages/tools/images/normal-map-generator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Source Image</div>
      <div class="drop-zone" id="nm-drop">Click / Drag Grayscale / Diffuse Map</div>
      <input type="file" id="nm-file" style="display: none;" accept="image/*">
      <label class="mt-2">Strength: <span id="nm-str-val">2</span></label>
      <input id="nm-strength" type="range" class="ide-input" min="1" max="10" value="2">
      <label class="mt-2"><input type="checkbox" id="nm-invert"> Invert Green Channel</label>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Normal Map Canvas</div>
      <div class="border rounded text-center p-3 bg-dark">
        <canvas id="nm-canvas" style="max-width: 100%; max-height: 280px;"></canvas>
      </div>
      <button id="nm-download" class="ide-btn ide-btn-primary mt-2">Download Normal Map</button>
    </div>`,
    js: `
    let nmImg = null;
    const nmCanvas = document.getElementById('nm-canvas');
    const nmCtx = nmCanvas.getContext('2d');

    document.getElementById('nm-drop').addEventListener('click', () => document.getElementById('nm-file').click());
    document.getElementById('nm-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = evt => {
        const img = new Image();
        img.onload = () => { nmImg = img; generateNormalMap(); };
        img.src = evt.target.result;
      };
      r.readAsDataURL(f);
    });

    document.getElementById('nm-strength').addEventListener('input', function() {
      document.getElementById('nm-str-val').textContent = this.value;
      generateNormalMap();
    });
    document.getElementById('nm-invert').addEventListener('change', generateNormalMap);

    function generateNormalMap() {
      if (!nmImg) return;
      const strength = parseInt(document.getElementById('nm-strength').value);
      const invertG = document.getElementById('nm-invert').checked;
      const w = nmImg.width, h = nmImg.height;
      nmCanvas.width = w; nmCanvas.height = h;
      nmCtx.drawImage(nmImg, 0, 0);
      const src = nmCtx.getImageData(0, 0, w, h);
      const out = nmCtx.createImageData(w, h);

      function gray(x, y) {
        const idx = (Math.min(Math.max(y,0),h-1)*w + Math.min(Math.max(x,0),w-1)) * 4;
        return (src.data[idx] + src.data[idx+1] + src.data[idx+2]) / 3;
      }

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dX = (gray(x+1,y) - gray(x-1,y)) * strength;
          let dY = (gray(x,y+1) - gray(x,y-1)) * strength;
          if (invertG) dY = -dY;
          const len = Math.sqrt(dX*dX + dY*dY + 1);
          const i = (y*w + x)*4;
          out.data[i]   = Math.floor((-dX/len * 0.5 + 0.5) * 255);
          out.data[i+1] = Math.floor((-dY/len * 0.5 + 0.5) * 255);
          out.data[i+2] = Math.floor((1/len * 0.5 + 0.5) * 255);
          out.data[i+3] = 255;
        }
      }
      nmCtx.putImageData(out, 0, 0);
      setStatus('Normal map generated (strength=' + strength + ').');
    }

    document.getElementById('nm-download').addEventListener('click', () => {
      nmCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'normal-map.png'; a.click();
      }, 'image/png');
    });`
  },

  {
    file: "pages/tools/images/qr-code-to-png.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">QR Code Generator</div>
      <label>URL / Text</label>
      <input id="qr-text" class="ide-input" placeholder="https://bluetext.in">
      <label class="mt-2">Module Size: <span id="qr-size-val">4</span>px</label>
      <input id="qr-size" type="range" class="ide-input" min="2" max="10" value="4">
      <label class="mt-2">Foreground Color</label>
      <input id="qr-fg" type="color" class="ide-input" value="#000000">
      <label class="mt-2">Background Color</label>
      <input id="qr-bg" type="color" class="ide-input" value="#ffffff">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">QR Code Preview</div>
      <div class="border rounded text-center p-3 bg-dark">
        <canvas id="qr-canvas" style="max-width: 100%; image-rendering: pixelated;"></canvas>
      </div>
      <button id="qr-download" class="ide-btn ide-btn-primary mt-2">Download QR PNG</button>
    </div>`,
    js: `
    // Minimal QR Code renderer using external library via CDN
    // We load qrcode-generator dynamically
    const qrScript = document.createElement('script');
    qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    qrScript.onload = () => setStatus('QR engine ready. Type URL to generate.');
    document.head.appendChild(qrScript);

    function generateQR() {
      const text = document.getElementById('qr-text').value.trim();
      if (!text) return;
      const size = parseInt(document.getElementById('qr-size').value);
      const fg = document.getElementById('qr-fg').value;
      const bg = document.getElementById('qr-bg').value;
      const canvas = document.getElementById('qr-canvas');
      try {
        const container = document.createElement('div');
        new QRCode(container, {
          text, width: 200, height: 200,
          colorDark: fg, colorLight: bg,
          correctLevel: QRCode.CorrectLevel.M
        });
        setTimeout(() => {
          const img = container.querySelector('img');
          if (img) {
            const tmpImg = new Image();
            tmpImg.onload = () => {
              const mod = size * 25;
              canvas.width = mod; canvas.height = mod;
              canvas.getContext('2d').drawImage(tmpImg, 0, 0, mod, mod);
              setStatus('QR code generated for: ' + text.slice(0,30));
            };
            tmpImg.src = img.src;
          }
        }, 200);
      } catch(e) {
        setStatus('QR error: ' + e.message, true);
      }
    }

    ['qr-text','qr-size','qr-fg','qr-bg'].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => {
        if (id === 'qr-size') document.getElementById('qr-size-val').textContent = el.value;
        generateQR();
      });
    });
    document.getElementById('qr-download').addEventListener('click', () => {
      const canvas = document.getElementById('qr-canvas');
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'qr-code.png'; a.click();
      }, 'image/png');
    });`
  },

  {
    file: "pages/tools/images/sprite-sheet-generator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Frame Images</div>
      <div class="drop-zone" id="ss-drop">Click / Drag Multiple Image Files</div>
      <input type="file" id="ss-file" style="display: none;" accept="image/*" multiple>
      <label class="mt-2">Padding (px): <span id="ss-pad-val">2</span></label>
      <input id="ss-padding" type="range" class="ide-input" min="0" max="20" value="2">
      <button id="ss-build" class="ide-btn ide-btn-primary mt-2">Generate Sprite Sheet</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Sprite Sheet Canvas</div>
      <div class="border rounded text-center p-3 bg-dark">
        <canvas id="ss-canvas" style="max-width: 100%;"></canvas>
      </div>
      <button id="ss-download" class="ide-btn ide-btn-primary mt-2">Download Sprite Sheet PNG</button>
    </div>`,
    js: `
    let ssImages = [];
    document.getElementById('ss-drop').addEventListener('click', () => document.getElementById('ss-file').click());
    document.getElementById('ss-padding').addEventListener('input', function() {
      document.getElementById('ss-pad-val').textContent = this.value;
    });
    document.getElementById('ss-file').addEventListener('change', e => {
      const files = Array.from(e.target.files);
      ssImages = []; let loaded = 0;
      files.forEach(f => {
        const r = new FileReader();
        r.onload = evt => {
          const img = new Image();
          img.onload = () => { ssImages.push(img); loaded++; if (loaded===files.length) setStatus(loaded+' frames loaded. Click Generate.'); };
          img.src = evt.target.result;
        };
        r.readAsDataURL(f);
      });
    });
    document.getElementById('ss-build').addEventListener('click', () => {
      if (!ssImages.length) return;
      const pad = parseInt(document.getElementById('ss-padding').value);
      const maxW = Math.max(...ssImages.map(i => i.width));
      const maxH = Math.max(...ssImages.map(i => i.height));
      const canvas = document.getElementById('ss-canvas');
      canvas.width = (maxW + pad) * ssImages.length;
      canvas.height = maxH + pad;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ssImages.forEach((img, idx) => ctx.drawImage(img, idx*(maxW+pad), 0));
      setStatus('Sprite sheet: ' + canvas.width + 'x' + canvas.height + 'px with ' + ssImages.length + ' frames.');
    });
    document.getElementById('ss-download').addEventListener('click', () => {
      document.getElementById('ss-canvas').toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'sprite-sheet.png'; a.click();
      }, 'image/png');
    });`
  },

  {
    file: "pages/tools/images/svg-optimizer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">SVG Source Input</div>
      <textarea id="svg-input" class="ide-input" rows="14" placeholder='&lt;svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"&gt;&#10;  &lt;circle cx="50" cy="50" r="40" fill="blue" /&gt;&#10;&lt;/svg&gt;'></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Optimized SVG Output</div>
      <div class="border rounded p-3 bg-dark" id="svg-preview" style="min-height:100px; display:flex;align-items:center;justify-content:center;"></div>
      <textarea id="svg-output" class="ide-input mt-2" rows="8" readonly placeholder="Optimized SVG appears here..."></textarea>
      <div class="ide-control-group mt-2">
        <button id="svg-copy" class="ide-btn">Copy SVG</button>
        <div id="svg-stats" class="ide-status"></div>
      </div>
    </div>`,
    js: `
    document.getElementById('svg-input').addEventListener('input', function() {
      let svg = this.value.trim();
      // Optimization passes
      svg = svg.replace(/<!--[\\s\\S]*?-->/g, '');                // strip comments
      svg = svg.replace(/\\s{2,}/g, ' ');                          // collapse whitespace
      svg = svg.replace(/> </g, '><');                            // remove whitespace between tags
      svg = svg.replace(/ (\\w+)=""/g, '');                       // remove empty attributes
      svg = svg.replace(/\\.0+(?=[^\\d])/g, '');                   // strip trailing .0 from numbers
      document.getElementById('svg-output').value = svg;
      document.getElementById('svg-preview').innerHTML = svg;
      const saved = ((this.value.length - svg.length) / this.value.length * 100).toFixed(1);
      document.getElementById('svg-stats').textContent = 'Saved ~' + saved + '% (' + (this.value.length - svg.length) + ' chars)';
      setStatus('Optimized SVG (' + svg.length + ' bytes).');
    });
    document.getElementById('svg-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('svg-output').value);
      setStatus('Copied!');
    });`
  },

  // ── LIFESTYLE ────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/lifestyle/biorhythm-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Biorhythm Input</div>
      <label>Date of Birth</label>
      <input id="bio-dob" type="date" class="ide-input">
      <label class="mt-2">Target Date</label>
      <input id="bio-target" type="date" class="ide-input">
      <button id="bio-calc" class="ide-btn ide-btn-primary mt-2">Calculate Biorhythm</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Biorhythm Levels</div>
      <div id="bio-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 150px;">
        <p class="text-muted">Select dates to see your biorhythm levels.</p>
      </div>
    </div>`,
    js: `
    document.getElementById('bio-calc').addEventListener('click', () => {
      const dob = new Date(document.getElementById('bio-dob').value);
      const target = new Date(document.getElementById('bio-target').value);
      if (isNaN(dob) || isNaN(target)) { setStatus('Select valid dates.', true); return; }
      const days = Math.floor((target - dob) / 86400000);
      const physical  = Math.sin(2 * Math.PI * days / 23);
      const emotional = Math.sin(2 * Math.PI * days / 28);
      const intellectual = Math.sin(2 * Math.PI * days / 33);
      function pct(v) { return Math.round((v + 1) / 2 * 100) + '%'; }
      function color(v) { return v > 0.2 ? '#98c379' : v < -0.2 ? '#e06c75' : '#d19a66'; }
      document.getElementById('bio-output').innerHTML = 
        '<div style="margin:0.5rem 0"><b style="color:#e06c75">Physical:</b> <span style="color:' + color(physical) + '">' + pct(physical) + '</span></div>' +
        '<div style="margin:0.5rem 0"><b style="color:#61afef">Emotional:</b> <span style="color:' + color(emotional) + '">' + pct(emotional) + '</span></div>' +
        '<div style="margin:0.5rem 0"><b style="color:#98c379">Intellectual:</b> <span style="color:' + color(intellectual) + '">' + pct(intellectual) + '</span></div>' +
        '<div style="margin-top:0.5rem;color:#abb2bf;font-size:0.8rem">Day ' + days + ' of your life cycle.</div>';
      setStatus('Biorhythm calculated for day ' + days + '.');
    });`
  },

  {
    file: "pages/tools/lifestyle/blood-alcohol-concentration-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">BAC Widmark Formula</div>
      <label>Gender</label>
      <select id="bac-gender" class="ide-input">
        <option value="0.68">Male (r = 0.68)</option>
        <option value="0.55">Female (r = 0.55)</option>
      </select>
      <label class="mt-2">Weight (kg)</label>
      <input id="bac-weight" type="number" class="ide-input" placeholder="70">
      <label class="mt-2">Alcohol Consumed (grams)</label>
      <input id="bac-grams" type="number" class="ide-input" placeholder="30">
      <label class="mt-2">Time Since First Drink (hours)</label>
      <input id="bac-hours" type="number" class="ide-input" placeholder="2">
      <button id="bac-calc" class="ide-btn ide-btn-primary mt-2">Calculate BAC</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">BAC Result</div>
      <div id="bac-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 150px; font-size: 1rem;"></div>
    </div>`,
    js: `
    document.getElementById('bac-calc').addEventListener('click', () => {
      const r = parseFloat(document.getElementById('bac-gender').value);
      const w = parseFloat(document.getElementById('bac-weight').value) || 0;
      const g = parseFloat(document.getElementById('bac-grams').value) || 0;
      const h = parseFloat(document.getElementById('bac-hours').value) || 0;
      if (!w || !g) { setStatus('Enter weight and alcohol grams.', true); return; }
      const bac = Math.max(0, (g / (w * r)) - (0.015 * h));
      let status = bac < 0.02 ? 'Sober / Sub-clinical' : bac < 0.05 ? 'Mild effects' : bac < 0.08 ? 'Impaired' : bac < 0.15 ? 'Drunk' : 'Severely impaired';
      let col = bac < 0.02 ? '#98c379' : bac < 0.08 ? '#d19a66' : '#e06c75';
      document.getElementById('bac-output').innerHTML =
        '<div style="font-size:2rem;font-weight:bold;color:' + col + '">' + bac.toFixed(4) + '%</div>' +
        '<div style="margin:0.5rem 0;color:' + col + '">' + status + '</div>' +
        '<div style="color:#abb2bf;font-size:0.8rem;margin-top:0.5rem">BAC = A / (W × r) - 0.015 × T<br>Legal limit: typically 0.08%</div>';
      setStatus('BAC: ' + bac.toFixed(4) + '% — ' + status);
    });`
  },

  {
    file: "pages/tools/lifestyle/digital-poker-chips-counter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Chip Counter</div>
      <div id="poker-ledger" style="background:#111;border-radius:6px;padding:1rem;min-height:200px;overflow-y:auto;"></div>
      <div class="ide-control-group mt-2">
        <input id="poker-name" class="ide-input" placeholder="Player name">
        <input id="poker-chips" type="number" class="ide-input" placeholder="Chips (e.g. +100 or -50)">
        <button id="poker-add" class="ide-btn ide-btn-primary">Add Entry</button>
      </div>
      <button id="poker-reset" class="ide-btn mt-2">Reset Ledger</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Standings Summary</div>
      <div id="poker-summary" style="background:#111;border-radius:6px;padding:1rem;min-height:200px;"></div>
    </div>`,
    js: `
    let pokerData = JSON.parse(localStorage.getItem('poker-ledger') || '{}');
    function savePoker() { localStorage.setItem('poker-ledger', JSON.stringify(pokerData)); }
    function renderPoker() {
      const ledger = document.getElementById('poker-ledger');
      const summary = document.getElementById('poker-summary');
      const entries = Object.entries(pokerData);
      if (!entries.length) {
        ledger.innerHTML = '<p class="text-muted">No entries yet.</p>';
        summary.innerHTML = '<p class="text-muted">Add players to see standings.</p>';
        return;
      }
      ledger.innerHTML = entries.map(([p,v]) => '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #333"><span>' + p + '</span><span style="color:' + (v>=0?'#98c379':'#e06c75') + '">' + (v>=0?'+':'') + v + '</span></div>').join('');
      const sorted = entries.sort((a,b) => b[1]-a[1]);
      summary.innerHTML = '<ol>' + sorted.map(([p,v]) => '<li style="margin:4px 0;color:' + (v>=0?'#98c379':'#e06c75') + '">' + p + ': ' + (v>=0?'+':'') + v + ' chips</li>').join('') + '</ol>';
    }
    document.getElementById('poker-add').addEventListener('click', () => {
      const name = document.getElementById('poker-name').value.trim();
      const chips = parseInt(document.getElementById('poker-chips').value) || 0;
      if (!name) return;
      pokerData[name] = (pokerData[name] || 0) + chips;
      savePoker(); renderPoker();
      setStatus('Added ' + chips + ' chips for ' + name + '.');
    });
    document.getElementById('poker-reset').addEventListener('click', () => { pokerData = {}; savePoker(); renderPoker(); });
    renderPoker();`
  },

  {
    file: "pages/tools/lifestyle/love-compatibility-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Names</div>
      <label>Your Name</label>
      <input id="love-a" class="ide-input" placeholder="Alice">
      <label class="mt-2">Partner's Name</label>
      <input id="love-b" class="ide-input" placeholder="Bob">
      <button id="love-calc" class="ide-btn ide-btn-primary mt-2">Calculate Compatibility ❤️</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Compatibility Result</div>
      <div id="love-output" style="padding: 1.5rem; background: #111; border-radius: 6px; text-align: center; min-height: 180px; display:flex; flex-direction:column; align-items:center; justify-content:center;"></div>
    </div>`,
    js: `
    document.getElementById('love-calc').addEventListener('click', () => {
      const a = document.getElementById('love-a').value.trim();
      const b = document.getElementById('love-b').value.trim();
      if (!a || !b) { setStatus('Enter both names.', true); return; }
      // Fun deterministic hash based on names
      const combined = (a + b).toLowerCase();
      let hash = 0;
      for (let i = 0; i < combined.length; i++) hash = (hash * 31 + combined.charCodeAt(i)) & 0xffffffff;
      const pct = Math.abs(hash % 41) + 60; // 60-100 range for positivity
      const emojis = ['💙','💛','❤️','💜','💚'];
      const emoji = emojis[Math.abs(hash) % emojis.length];
      const msgs = ['Great connection!','Amazing match!','True soulmates!','Perfect chemistry!','Wonderful bond!'];
      const msg = msgs[Math.abs(hash >> 4) % msgs.length];
      const col = pct > 80 ? '#e06c75' : pct > 70 ? '#d19a66' : '#98c379';
      document.getElementById('love-output').innerHTML =
        '<div style="font-size:3rem">' + emoji + '</div>' +
        '<div style="font-size:2.5rem;font-weight:bold;color:' + col + '">' + pct + '%</div>' +
        '<div style="color:#abb2bf;margin-top:0.5rem">' + a + ' + ' + b + '</div>' +
        '<div style="color:#98c379;margin-top:0.25rem">' + msg + '</div>';
      setStatus('Compatibility: ' + pct + '%');
    });`
  },

  {
    file: "pages/tools/lifestyle/military-time-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Time Input</div>
      <label>12-Hour Format (AM/PM)</label>
      <input id="mil-12h" type="text" class="ide-input" placeholder="2:30 PM">
      <label class="mt-2">24-Hour / Military Format</label>
      <input id="mil-24h" type="text" class="ide-input" placeholder="14:30">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Current Time</div>
      <div id="mil-clock" style="font-size:2.5rem;font-weight:bold;color:#61afef;background:#111;border-radius:8px;padding:1.5rem;text-align:center;"></div>
    </div>`,
    js: `
    document.getElementById('mil-12h').addEventListener('input', function() {
      const v = this.value.trim().toUpperCase();
      const m = v.match(/^(\\d{1,2}):(\\d{2})\\s*(AM|PM)$/);
      if (!m) return;
      let h = parseInt(m[1]);
      const min = m[2];
      if (m[3]==='AM' && h===12) h=0;
      else if (m[3]==='PM' && h<12) h+=12;
      document.getElementById('mil-24h').value = String(h).padStart(2,'0') + ':' + min;
      setStatus('Converted to military time.');
    });
    document.getElementById('mil-24h').addEventListener('input', function() {
      const v = this.value.trim();
      const m = v.match(/^(\\d{2}):(\\d{2})$/);
      if (!m) return;
      let h = parseInt(m[1]);
      const min = m[2];
      const ampm = h < 12 ? 'AM' : 'PM';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      document.getElementById('mil-12h').value = h + ':' + min + ' ' + ampm;
      setStatus('Converted to 12-hour format.');
    });
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      document.getElementById('mil-clock').textContent = h + ':' + m + ':' + s + ' MILITARY';
    }
    updateClock();
    setInterval(updateClock, 1000);`
  },

  {
    file: "pages/tools/lifestyle/one-rep-max-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">1RM Epley Formula</div>
      <label>Weight Lifted (kg)</label>
      <input id="orm-weight" type="number" class="ide-input" placeholder="100">
      <label class="mt-2">Reps Performed</label>
      <input id="orm-reps" type="number" class="ide-input" placeholder="5">
      <button id="orm-calc" class="ide-btn ide-btn-primary mt-2">Calculate 1RM</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Strength Standards</div>
      <div id="orm-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('orm-calc').addEventListener('click', () => {
      const w = parseFloat(document.getElementById('orm-weight').value) || 0;
      const r = parseFloat(document.getElementById('orm-reps').value) || 0;
      if (!w || !r) { setStatus('Enter weight and reps.', true); return; }
      const epley = w * (1 + r / 30);
      const pcts = [100,95,90,85,80,75,70,65,60,55];
      document.getElementById('orm-output').innerHTML =
        '<div style="font-size:1.5rem;color:#61afef;font-weight:bold">1RM: ' + epley.toFixed(1) + ' kg</div>' +
        '<div style="margin-top:0.5rem;font-size:0.85rem;color:#abb2bf">Training percentages:</div>' +
        pcts.map(p => '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #333"><span style="color:#abb2bf">' + p + '%</span><span style="color:#98c379">' + (epley*p/100).toFixed(1) + ' kg</span></div>').join('');
      setStatus('1RM: ' + epley.toFixed(1) + ' kg (Epley formula).');
    });`
  },

  {
    file: "pages/tools/lifestyle/sleep-cycle-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Sleep Calculator</div>
      <label>I want to wake up at</label>
      <input id="sleep-wakeup" type="time" class="ide-input" value="07:00">
      <label class="mt-2">OR: I plan to sleep at</label>
      <input id="sleep-bedtime" type="time" class="ide-input" value="23:00">
      <button id="sleep-calc-wake" class="ide-btn ide-btn-primary mt-2">When should I sleep?</button>
      <button id="sleep-calc-bed" class="ide-btn mt-2">When will I wake up?</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Optimal Times (5–6 Sleep Cycles)</div>
      <div id="sleep-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    function addMins(timeStr, mins) {
      const [h, m] = timeStr.split(':').map(Number);
      const total = (h * 60 + m + mins + 1440) % 1440;
      return String(Math.floor(total/60)).padStart(2,'0') + ':' + String(total%60).padStart(2,'0');
    }
    function sleepTimes(wakeupStr, direction) {
      const cycles = [3,4,5,6];
      return cycles.map(c => {
        const mins = direction === 'back' ? -(c * 90 + 15) : (c * 90 + 15);
        return addMins(wakeupStr, mins) + ' (' + c + ' cycles, ' + (c*1.5) + 'h)';
      });
    }
    document.getElementById('sleep-calc-wake').addEventListener('click', () => {
      const wakeup = document.getElementById('sleep-wakeup').value;
      const times = sleepTimes(wakeup, 'back');
      document.getElementById('sleep-output').innerHTML =
        '<p style="color:#abb2bf;font-size:0.85rem">To wake at ' + wakeup + ', go to sleep at:</p>' +
        times.map(t => '<div style="padding:4px;color:#98c379">' + t + '</div>').join('');
      setStatus('Sleep times calculated.');
    });
    document.getElementById('sleep-calc-bed').addEventListener('click', () => {
      const bedtime = document.getElementById('sleep-bedtime').value;
      const times = sleepTimes(bedtime, 'forward');
      document.getElementById('sleep-output').innerHTML =
        '<p style="color:#abb2bf;font-size:0.85rem">If you sleep at ' + bedtime + ', wake up at:</p>' +
        times.map(t => '<div style="padding:4px;color:#61afef">' + t + '</div>').join('');
      setStatus('Wake times calculated.');
    });`
  },

  {
    file: "pages/tools/lifestyle/step-to-distance-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Step Counter</div>
      <label>Steps Taken</label>
      <input id="step-count" type="number" class="ide-input" placeholder="10000">
      <label class="mt-2">Stride Length (cm)</label>
      <input id="step-stride" type="number" class="ide-input" value="75">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Distance Results</div>
      <label>Kilometers</label>
      <input id="step-km" class="ide-input" readonly>
      <label class="mt-2">Miles</label>
      <input id="step-miles" class="ide-input" readonly>
      <label class="mt-2">Calories Burned (est.)</label>
      <input id="step-cal" class="ide-input" readonly>
    </div>`,
    js: `
    function calcSteps() {
      const steps = parseFloat(document.getElementById('step-count').value) || 0;
      const stride = parseFloat(document.getElementById('step-stride').value) || 75;
      const meters = steps * stride / 100;
      document.getElementById('step-km').value = Number((meters/1000).toPrecision(5));
      document.getElementById('step-miles').value = Number((meters/1609.34).toPrecision(5));
      document.getElementById('step-cal').value = Math.round(steps * 0.04);
      setStatus(steps + ' steps = ' + (meters/1000).toFixed(2) + ' km');
    }
    ['step-count','step-stride'].forEach(id => document.getElementById(id).addEventListener('input', calcSteps));`
  },

  {
    file: "pages/tools/lifestyle/workout-interval-timer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Interval Settings</div>
      <label>Work Duration (seconds)</label>
      <input id="wt-work" type="number" class="ide-input" value="30">
      <label class="mt-2">Rest Duration (seconds)</label>
      <input id="wt-rest" type="number" class="ide-input" value="15">
      <label class="mt-2">Rounds</label>
      <input id="wt-rounds" type="number" class="ide-input" value="8">
      <div class="ide-control-group mt-2">
        <button id="wt-start" class="ide-btn ide-btn-primary">Start</button>
        <button id="wt-pause" class="ide-btn">Pause</button>
        <button id="wt-reset" class="ide-btn">Reset</button>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Timer Display</div>
      <div id="wt-display" style="text-align:center;padding:2rem;background:#111;border-radius:8px;">
        <div id="wt-phase" style="font-size:1.2rem;color:#abb2bf;margin-bottom:0.5rem">Ready</div>
        <div id="wt-time" style="font-size:4rem;font-weight:bold;color:#61afef">00:30</div>
        <div id="wt-round-info" style="font-size:1rem;color:#abb2bf;margin-top:0.5rem">Round 0 / 0</div>
      </div>
    </div>`,
    js: `
    let wtInterval = null, wtRunning = false, wtPhase = 'work', wtCurrent = 0, wtRound = 1, wtTotalRounds = 8, wtWorkTime = 30, wtRestTime = 15;
    const wtCtx = new (window.AudioContext || window.webkitAudioContext || function(){})();
    function beep(freq) {
      if (!wtCtx.createOscillator) return;
      try {
        const osc = wtCtx.createOscillator();
        osc.connect(wtCtx.destination);
        osc.frequency.value = freq;
        osc.start();
        osc.stop(wtCtx.currentTime + 0.2);
      } catch(e) {}
    }
    function wtUpdate() {
      const m = String(Math.floor(wtCurrent/60)).padStart(2,'0');
      const s = String(wtCurrent%60).padStart(2,'0');
      document.getElementById('wt-time').textContent = m + ':' + s;
      document.getElementById('wt-phase').textContent = wtPhase === 'work' ? '🔥 WORK' : '💤 REST';
      document.getElementById('wt-phase').style.color = wtPhase === 'work' ? '#e06c75' : '#98c379';
      document.getElementById('wt-round-info').textContent = 'Round ' + wtRound + ' / ' + wtTotalRounds;
    }
    document.getElementById('wt-start').addEventListener('click', () => {
      if (wtRunning) return;
      wtWorkTime = parseInt(document.getElementById('wt-work').value) || 30;
      wtRestTime = parseInt(document.getElementById('wt-rest').value) || 15;
      wtTotalRounds = parseInt(document.getElementById('wt-rounds').value) || 8;
      if (wtCurrent === 0) { wtPhase = 'work'; wtCurrent = wtWorkTime; wtRound = 1; }
      wtRunning = true;
      wtInterval = setInterval(() => {
        wtCurrent--;
        if (wtCurrent <= 0) {
          if (wtPhase === 'work') {
            wtPhase = 'rest'; wtCurrent = wtRestTime; beep(880);
          } else {
            wtRound++;
            if (wtRound > wtTotalRounds) { clearInterval(wtInterval); wtRunning = false; setStatus('Workout complete!'); return; }
            wtPhase = 'work'; wtCurrent = wtWorkTime; beep(440);
          }
        }
        wtUpdate();
      }, 1000);
      setStatus('Timer running...');
    });
    document.getElementById('wt-pause').addEventListener('click', () => { clearInterval(wtInterval); wtRunning = false; setStatus('Paused.'); });
    document.getElementById('wt-reset').addEventListener('click', () => {
      clearInterval(wtInterval); wtRunning = false; wtCurrent = 0; wtPhase = 'work'; wtRound = 1;
      document.getElementById('wt-time').textContent = '00:' + String(parseInt(document.getElementById('wt-work').value)||30).padStart(2,'0');
      document.getElementById('wt-phase').textContent = 'Ready';
      document.getElementById('wt-round-info').textContent = 'Round 0 / 0';
      setStatus('Timer reset.');
    });`
  },

  // ── MATH ────────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/math/percentage-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Percentage Calculations</div>
      <label>What is X% of Y?</label>
      <div class="d-flex gap-2 mt-1">
        <input id="pct-x" type="number" class="ide-input" placeholder="X %">
        <span class="pt-2">% of</span>
        <input id="pct-y" type="number" class="ide-input" placeholder="Y">
      </div>
      <div id="pct-result1" class="ide-status mt-1"></div>
      <label class="mt-2">X is what % of Y?</label>
      <div class="d-flex gap-2 mt-1">
        <input id="pct-a" type="number" class="ide-input" placeholder="X">
        <span class="pt-2">is what % of</span>
        <input id="pct-b" type="number" class="ide-input" placeholder="Y">
      </div>
      <div id="pct-result2" class="ide-status mt-1"></div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">More Percentage Tools</div>
      <label>Percentage Change from X to Y</label>
      <div class="d-flex gap-2 mt-1">
        <input id="pct-from" type="number" class="ide-input" placeholder="From">
        <span class="pt-2">→</span>
        <input id="pct-to" type="number" class="ide-input" placeholder="To">
      </div>
      <div id="pct-result3" class="ide-status mt-1"></div>
    </div>`,
    js: `
    ['pct-x','pct-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('pct-x').value);
      const y = parseFloat(document.getElementById('pct-y').value);
      if (isNaN(x) || isNaN(y)) return;
      document.getElementById('pct-result1').textContent = x + '% of ' + y + ' = ' + Number((x/100*y).toPrecision(6));
    }));
    ['pct-a','pct-b'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const a = parseFloat(document.getElementById('pct-a').value);
      const b = parseFloat(document.getElementById('pct-b').value);
      if (isNaN(a) || isNaN(b) || b === 0) return;
      document.getElementById('pct-result2').textContent = a + ' is ' + Number((a/b*100).toPrecision(6)) + '% of ' + b;
    }));
    ['pct-from','pct-to'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const from = parseFloat(document.getElementById('pct-from').value);
      const to = parseFloat(document.getElementById('pct-to').value);
      if (isNaN(from) || isNaN(to) || from === 0) return;
      const change = ((to - from) / Math.abs(from) * 100);
      document.getElementById('pct-result3').textContent = (change >= 0 ? '+' : '') + Number(change.toPrecision(4)) + '% change';
    }));`
  },

  {
    file: "pages/tools/math/scientific-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Scientific Calculator</div>
      <input id="sci-display" class="ide-input" style="font-size:1.5rem;text-align:right;" readonly value="0">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:0.5rem;">
        ${['C','±','%','←','÷','7','8','9','×','√','4','5','6','−','x²','1','2','3','+','1/x','0','.','π','=','eˣ'].map(b => `<button class="ide-btn sci-btn" data-val="${b}" style="padding:0.6rem;text-align:center;">${b}</button>`).join('')}
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Calculation History</div>
      <div id="sci-history" style="background:#111;border-radius:6px;padding:1rem;min-height:200px;overflow-y:auto;font-size:0.9rem;color:#abb2bf;"></div>
      <button id="sci-clrhist" class="ide-btn mt-2">Clear History</button>
    </div>`,
    js: `
    let sciVal = '0', sciOp = null, sciPrev = null, sciNewNum = true;
    const display = document.getElementById('sci-display');
    const history = document.getElementById('sci-history');
    const historyEntries = [];

    function updateDisplay() { display.value = sciVal; }

    document.querySelectorAll('.sci-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const v = this.dataset.val;
        if (v >= '0' && v <= '9' || v === '.') {
          if (sciNewNum) { sciVal = v; sciNewNum = false; }
          else sciVal = sciVal === '0' ? v : sciVal + v;
        } else if (v === 'C') {
          sciVal = '0'; sciOp = null; sciPrev = null; sciNewNum = true;
        } else if (v === '←') {
          sciVal = sciVal.length > 1 ? sciVal.slice(0,-1) : '0';
        } else if (v === '±') {
          sciVal = String(-parseFloat(sciVal));
        } else if (v === '%') {
          sciVal = String(parseFloat(sciVal) / 100);
        } else if (v === '√') {
          const result = Math.sqrt(parseFloat(sciVal));
          historyEntries.push('√(' + sciVal + ') = ' + result);
          sciVal = String(result); sciNewNum = true;
        } else if (v === 'x²') {
          const n = parseFloat(sciVal);
          historyEntries.push(n + '² = ' + n*n);
          sciVal = String(n*n); sciNewNum = true;
        } else if (v === '1/x') {
          const n = parseFloat(sciVal);
          sciVal = String(1/n); sciNewNum = true;
        } else if (v === 'π') {
          sciVal = String(Math.PI); sciNewNum = true;
        } else if (v === 'eˣ') {
          sciVal = String(Math.exp(parseFloat(sciVal))); sciNewNum = true;
        } else if (['+','−','×','÷'].includes(v)) {
          sciPrev = parseFloat(sciVal); sciOp = v; sciNewNum = true;
        } else if (v === '=') {
          if (sciOp && sciPrev !== null) {
            const cur = parseFloat(sciVal);
            let result;
            if (sciOp === '+') result = sciPrev + cur;
            else if (sciOp === '−') result = sciPrev - cur;
            else if (sciOp === '×') result = sciPrev * cur;
            else if (sciOp === '÷') result = cur !== 0 ? sciPrev / cur : NaN;
            historyEntries.push(sciPrev + ' ' + sciOp + ' ' + cur + ' = ' + result);
            sciVal = String(result); sciOp = null; sciPrev = null; sciNewNum = true;
          }
        }
        updateDisplay();
        history.innerHTML = historyEntries.slice(-15).reverse().map(e => '<div style="border-bottom:1px solid #333;padding:3px 0">' + e + '</div>').join('');
      });
    });
    document.getElementById('sci-clrhist').addEventListener('click', () => { historyEntries.length = 0; history.innerHTML = ''; });`
  },

  {
    file: "pages/tools/math/compound-interest-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Compound Interest Inputs</div>
      <label>Principal Amount (₹ / $)</label>
      <input id="ci-principal" type="number" class="ide-input" placeholder="100000">
      <label class="mt-2">Annual Interest Rate (%)</label>
      <input id="ci-rate" type="number" class="ide-input" placeholder="8">
      <label class="mt-2">Time Period (years)</label>
      <input id="ci-years" type="number" class="ide-input" placeholder="10">
      <label class="mt-2">Compounding Frequency</label>
      <select id="ci-freq" class="ide-input">
        <option value="1">Annually</option>
        <option value="2">Semi-annually</option>
        <option value="4" selected>Quarterly</option>
        <option value="12">Monthly</option>
        <option value="365">Daily</option>
      </select>
      <button id="ci-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <div id="ci-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('ci-calc').addEventListener('click', () => {
      const P = parseFloat(document.getElementById('ci-principal').value) || 0;
      const r = parseFloat(document.getElementById('ci-rate').value) / 100 || 0;
      const t = parseFloat(document.getElementById('ci-years').value) || 0;
      const n = parseInt(document.getElementById('ci-freq').value);
      if (!P || !r || !t) { setStatus('Enter all fields.', true); return; }
      const A = P * Math.pow(1 + r/n, n*t);
      const interest = A - P;
      document.getElementById('ci-output').innerHTML =
        '<div style="font-size:1.5rem;color:#61afef;font-weight:bold">Final Amount: ' + A.toLocaleString('en-IN', {maximumFractionDigits:2}) + '</div>' +
        '<div style="margin-top:0.5rem;color:#98c379">Interest Earned: ' + interest.toLocaleString('en-IN', {maximumFractionDigits:2}) + '</div>' +
        '<div style="margin-top:0.25rem;color:#abb2bf">Principal: ' + P.toLocaleString('en-IN') + '</div>' +
        '<div style="color:#abb2bf">A = P(1 + r/n)^(nt)</div>';
      setStatus('A = ' + A.toFixed(2));
    });`
  },

  {
    file: "pages/tools/math/discount-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Discount Calculator</div>
      <label>Original Price</label>
      <input id="disc-orig" type="number" class="ide-input" placeholder="1000">
      <label class="mt-2">Discount (%)</label>
      <input id="disc-pct" type="number" class="ide-input" placeholder="20">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <label>Discount Amount</label>
      <input id="disc-amount" class="ide-input" readonly>
      <label class="mt-2">Final Price</label>
      <input id="disc-final" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#98c379;">
      <label class="mt-2">Savings</label>
      <input id="disc-savings" class="ide-input" readonly>
    </div>`,
    js: `
    function calcDiscount() {
      const orig = parseFloat(document.getElementById('disc-orig').value) || 0;
      const pct = parseFloat(document.getElementById('disc-pct').value) || 0;
      const amount = Number((orig * pct / 100).toPrecision(8));
      const final = Number((orig - amount).toPrecision(8));
      document.getElementById('disc-amount').value = amount;
      document.getElementById('disc-final').value = final;
      document.getElementById('disc-savings').value = 'Save ' + amount + ' (' + pct + '% off)';
      setStatus('Final price: ' + final);
    }
    ['disc-orig','disc-pct'].forEach(id => document.getElementById(id).addEventListener('input', calcDiscount));`
  },

  {
    file: "pages/tools/math/tip-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Bill Details</div>
      <label>Bill Amount</label>
      <input id="tip-bill" type="number" class="ide-input" placeholder="500">
      <label class="mt-2">Tip Percentage (%)</label>
      <input id="tip-pct" type="range" class="ide-input" min="0" max="30" value="15">
      <div style="color:#abb2bf;font-size:0.9rem;text-align:center"><span id="tip-pct-val">15</span>%</div>
      <label class="mt-2">Split Between</label>
      <input id="tip-split" type="number" class="ide-input" value="1" min="1">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Tip Breakdown</div>
      <label>Tip Amount</label>
      <input id="tip-amount" class="ide-input" readonly>
      <label class="mt-2">Total Bill</label>
      <input id="tip-total" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#98c379;">
      <label class="mt-2">Per Person</label>
      <input id="tip-per" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#61afef;">
    </div>`,
    js: `
    function calcTip() {
      const bill = parseFloat(document.getElementById('tip-bill').value) || 0;
      const pct = parseInt(document.getElementById('tip-pct').value);
      const split = parseInt(document.getElementById('tip-split').value) || 1;
      document.getElementById('tip-pct-val').textContent = pct;
      const tip = Number((bill * pct / 100).toPrecision(6));
      const total = Number((bill + tip).toPrecision(6));
      const per = Number((total / split).toPrecision(6));
      document.getElementById('tip-amount').value = tip;
      document.getElementById('tip-total').value = total;
      document.getElementById('tip-per').value = per;
      setStatus('Tip: ' + tip + ' | Total: ' + total);
    }
    ['tip-bill','tip-pct','tip-split'].forEach(id => document.getElementById(id).addEventListener('input', calcTip));`
  },

  {
    file: "pages/tools/math/factorial-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Factorial Input</div>
      <label>Number (n)</label>
      <input id="fact-n" type="number" class="ide-input" placeholder="10" min="0" max="170">
      <button id="fact-calc" class="ide-btn ide-btn-primary mt-2">Calculate n!</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Result</div>
      <div id="fact-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 150px; word-break: break-all; color: #9cdcfe; font-family: monospace;"></div>
    </div>`,
    js: `
    document.getElementById('fact-calc').addEventListener('click', () => {
      const n = parseInt(document.getElementById('fact-n').value);
      if (isNaN(n) || n < 0) { setStatus('Enter a non-negative integer.', true); return; }
      if (n > 170) { document.getElementById('fact-output').innerHTML = '<span style="color:#e06c75">Too large (> 170). JavaScript numbers overflow.</span>'; return; }
      let result = 1n;
      for (let i = 2n; i <= BigInt(n); i++) result *= i;
      document.getElementById('fact-output').innerHTML = '<div style="color:#61afef;font-size:1.2rem">' + n + '! =</div><div style="margin-top:0.5rem">' + result.toString() + '</div><div style="color:#abb2bf;margin-top:0.5rem;font-size:0.8rem">' + result.toString().length + ' digits</div>';
      setStatus(n + '! computed (' + result.toString().length + ' digits).');
    });`
  },

  {
    file: "pages/tools/math/fraction-to-decimal.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Fraction Input</div>
      <label>Numerator</label>
      <input id="frac-num" type="number" class="ide-input" placeholder="3">
      <label class="mt-2">Denominator</label>
      <input id="frac-den" type="number" class="ide-input" placeholder="4">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <label>Decimal</label>
      <input id="frac-dec" class="ide-input" readonly>
      <label class="mt-2">Percentage</label>
      <input id="frac-pct" class="ide-input" readonly>
      <label class="mt-2">Simplified Fraction</label>
      <input id="frac-simp" class="ide-input" readonly>
    </div>`,
    js: `
    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
    function calcFrac() {
      const num = parseInt(document.getElementById('frac-num').value) || 0;
      const den = parseInt(document.getElementById('frac-den').value) || 0;
      if (!den) return;
      const dec = Number((num / den).toPrecision(10));
      const pct = Number((num / den * 100).toPrecision(6));
      const g = gcd(Math.abs(num), Math.abs(den));
      document.getElementById('frac-dec').value = dec;
      document.getElementById('frac-pct').value = pct + '%';
      document.getElementById('frac-simp').value = (num/g) + ' / ' + (den/g);
      setStatus(num + '/' + den + ' = ' + dec);
    }
    ['frac-num','frac-den'].forEach(id => document.getElementById(id).addEventListener('input', calcFrac));`
  },

  {
    file: "pages/tools/math/gcd-lcm-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Number Input</div>
      <label>Number A</label>
      <input id="gcd-a" type="number" class="ide-input" placeholder="48">
      <label class="mt-2">Number B</label>
      <input id="gcd-b" type="number" class="ide-input" placeholder="18">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <label>GCD (HCF)</label>
      <input id="gcd-result" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#98c379;">
      <label class="mt-2">LCM</label>
      <input id="lcm-result" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#61afef;">
    </div>`,
    js: `
    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
    function calcGcdLcm() {
      const a = parseInt(document.getElementById('gcd-a').value) || 0;
      const b = parseInt(document.getElementById('gcd-b').value) || 0;
      if (!a || !b) return;
      const g = gcd(Math.abs(a), Math.abs(b));
      const l = (Math.abs(a) * Math.abs(b)) / g;
      document.getElementById('gcd-result').value = g;
      document.getElementById('lcm-result').value = l;
      setStatus('GCD=' + g + ' LCM=' + l);
    }
    ['gcd-a','gcd-b'].forEach(id => document.getElementById(id).addEventListener('input', calcGcdLcm));`
  },

  {
    file: "pages/tools/math/prime-number-checker.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Number Input</div>
      <label>Check if Prime</label>
      <input id="prime-n" type="number" class="ide-input" placeholder="97">
      <label class="mt-2">Generate Primes up to N</label>
      <input id="prime-sieve" type="number" class="ide-input" placeholder="100">
      <button id="prime-sieve-btn" class="ide-btn mt-2">Generate Primes</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <div id="prime-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    function isPrime(n) {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
      return true;
    }
    document.getElementById('prime-n').addEventListener('input', function() {
      const n = parseInt(this.value);
      const result = isPrime(n);
      const factors = [];
      let temp = n;
      for (let i = 2; i <= temp; i++) { while (temp % i === 0) { factors.push(i); temp /= i; } }
      document.getElementById('prime-output').innerHTML =
        '<div style="font-size:1.5rem;color:' + (result ? '#98c379' : '#e06c75') + ';font-weight:bold">' + n + ' is ' + (result ? '✓ PRIME' : '✗ NOT PRIME') + '</div>' +
        (!result ? '<div style="margin-top:0.5rem;color:#abb2bf">Prime factors: ' + factors.join(' × ') + '</div>' : '');
      setStatus(n + ' is ' + (result ? 'prime.' : 'not prime.'));
    });
    document.getElementById('prime-sieve-btn').addEventListener('click', () => {
      const limit = parseInt(document.getElementById('prime-sieve').value) || 100;
      const primes = [];
      for (let i = 2; i <= limit; i++) if (isPrime(i)) primes.push(i);
      document.getElementById('prime-output').innerHTML =
        '<div style="color:#61afef">' + primes.length + ' primes up to ' + limit + ':</div>' +
        '<div style="margin-top:0.5rem;color:#9cdcfe;font-family:monospace;word-break:break-all">' + primes.join(', ') + '</div>';
      setStatus('Found ' + primes.length + ' primes.');
    });`
  },

  {
    file: "pages/tools/math/probability-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Probability Calculator</div>
      <label>P(A) — Probability of event A (0–1)</label>
      <input id="prob-a" type="number" class="ide-input" placeholder="0.5" min="0" max="1" step="0.01">
      <label class="mt-2">P(B) — Probability of event B (0–1)</label>
      <input id="prob-b" type="number" class="ide-input" placeholder="0.3" min="0" max="1" step="0.01">
      <button id="prob-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <div id="prob-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('prob-calc').addEventListener('click', () => {
      const a = parseFloat(document.getElementById('prob-a').value);
      const b = parseFloat(document.getElementById('prob-b').value);
      if (isNaN(a) || isNaN(b) || a < 0 || a > 1 || b < 0 || b > 1) { setStatus('Enter valid probabilities (0–1).', true); return; }
      const and = Number((a * b).toPrecision(4)); // P(A∩B) assuming independence
      const or  = Number((a + b - and).toPrecision(4)); // P(A∪B)
      const notA = Number((1 - a).toPrecision(4));
      const notB = Number((1 - b).toPrecision(4));
      document.getElementById('prob-output').innerHTML =
        '<div style="color:#abb2bf;font-size:0.8rem">Assuming A and B are independent:</div>' +
        '<div style="margin-top:0.5rem;padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>P(A)</span><span style="color:#61afef">' + a + '</span></div>' +
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>P(B)</span><span style="color:#61afef">' + b + '</span></div>' +
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>P(A and B)</span><span style="color:#98c379">' + and + '</span></div>' +
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>P(A or B)</span><span style="color:#98c379">' + or + '</span></div>' +
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>P(not A)</span><span style="color:#d19a66">' + notA + '</span></div>' +
        '<div style="padding:3px 0;display:flex;justify-content:space-between"><span>P(not B)</span><span style="color:#d19a66">' + notB + '</span></div>';
      setStatus('P(A∩B)=' + and + ' P(A∪B)=' + or);
    });`
  },

  {
    file: "pages/tools/math/random-number-generator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Random Number Settings</div>
      <label>Minimum Value</label>
      <input id="rng-min" type="number" class="ide-input" value="1">
      <label class="mt-2">Maximum Value</label>
      <input id="rng-max" type="number" class="ide-input" value="100">
      <label class="mt-2">Count</label>
      <input id="rng-count" type="number" class="ide-input" value="1" min="1" max="1000">
      <label class="mt-2"><input type="checkbox" id="rng-unique"> No Duplicates</label>
      <button id="rng-gen" class="ide-btn ide-btn-primary mt-2">Generate Numbers</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">
        <span>Generated Numbers</span>
        <button id="rng-copy" class="ide-btn" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
      </div>
      <div id="rng-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 200px; word-break: break-all; color: #9cdcfe; font-family: monospace;"></div>
    </div>`,
    js: `
    document.getElementById('rng-gen').addEventListener('click', () => {
      const min = parseInt(document.getElementById('rng-min').value);
      const max = parseInt(document.getElementById('rng-max').value);
      const count = parseInt(document.getElementById('rng-count').value) || 1;
      const unique = document.getElementById('rng-unique').checked;
      if (min >= max) { setStatus('Min must be less than Max.', true); return; }
      const nums = [];
      const range = max - min + 1;
      if (unique && count > range) { setStatus('Cannot generate ' + count + ' unique numbers in range ' + min + '–' + max + '.', true); return; }
      const pool = unique ? Array.from({length: range}, (_,i) => min + i) : null;
      for (let i = 0; i < count; i++) {
        if (unique) {
          const idx = Math.floor(Math.random() * pool.length);
          nums.push(pool.splice(idx,1)[0]);
        } else {
          nums.push(Math.floor(Math.random() * range) + min);
        }
      }
      document.getElementById('rng-output').innerHTML = nums.join(', ');
      setStatus('Generated ' + count + ' random number(s).');
    });
    document.getElementById('rng-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('rng-output').textContent);
      setStatus('Copied!');
    });`
  },

  {
    file: "pages/tools/math/standard-deviation-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Dataset Input</div>
      <label>Numbers (comma or space separated)</label>
      <textarea id="stddev-input" class="ide-input" rows="6" placeholder="2, 4, 4, 4, 5, 5, 7, 9"></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Statistical Results</div>
      <div id="stddev-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('stddev-input').addEventListener('input', function() {
      const vals = this.value.split(/[,\\s]+/).map(Number).filter(n => !isNaN(n) && this.value.trim());
      if (vals.length < 2) { document.getElementById('stddev-output').innerHTML = '<span style="color:#abb2bf">Enter at least 2 numbers.</span>'; return; }
      const n = vals.length;
      const mean = vals.reduce((a,b) => a+b, 0) / n;
      const variance = vals.reduce((a,b) => a + (b-mean)**2, 0) / n;
      const stddev = Math.sqrt(variance);
      const sampleVar = vals.reduce((a,b) => a + (b-mean)**2, 0) / (n-1);
      const sampleStd = Math.sqrt(sampleVar);
      const sorted = [...vals].sort((a,b)=>a-b);
      const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
      const rows = [
        ['Count', n],
        ['Sum', Number(vals.reduce((a,b)=>a+b,0).toPrecision(8))],
        ['Mean', Number(mean.toPrecision(6))],
        ['Median', median],
        ['Min', sorted[0]],
        ['Max', sorted[n-1]],
        ['Range', sorted[n-1]-sorted[0]],
        ['Population Variance', Number(variance.toPrecision(6))],
        ['Population Std Dev', Number(stddev.toPrecision(6))],
        ['Sample Std Dev', Number(sampleStd.toPrecision(6))]
      ];
      document.getElementById('stddev-output').innerHTML = rows.map(([k,v]) =>
        '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #333"><span style="color:#abb2bf">' + k + '</span><span style="color:#9cdcfe">' + v + '</span></div>'
      ).join('');
      setStatus('Std dev: ' + Number(stddev.toPrecision(4)));
    });`
  },

  {
    file: "pages/tools/math/statistics-mean-median-mode.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Dataset Input</div>
      <textarea id="stats-input" class="ide-input" rows="8" placeholder="1, 2, 2, 3, 4, 4, 4, 5"></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Mean · Median · Mode</div>
      <div id="stats-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('stats-input').addEventListener('input', function() {
      const vals = this.value.split(/[,\\s]+/).map(Number).filter((n, _, a) => !isNaN(n) && a.length);
      if (!vals.length) return;
      const mean = vals.reduce((a,b) => a+b, 0) / vals.length;
      const sorted = [...vals].sort((a,b) => a-b);
      const n = vals.length;
      const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
      const freq = {};
      vals.forEach(v => freq[v] = (freq[v]||0)+1);
      const maxFreq = Math.max(...Object.values(freq));
      const modes = Object.keys(freq).filter(k => freq[k]===maxFreq).map(Number);
      document.getElementById('stats-output').innerHTML =
        '<div style="margin:0.5rem 0;font-size:1.2rem"><b style="color:#61afef">Mean:</b> ' + Number(mean.toPrecision(8)) + '</div>' +
        '<div style="margin:0.5rem 0;font-size:1.2rem"><b style="color:#98c379">Median:</b> ' + median + '</div>' +
        '<div style="margin:0.5rem 0;font-size:1.2rem"><b style="color:#d19a66">Mode:</b> ' + modes.join(', ') + ' (freq: ' + maxFreq + ')</div>' +
        '<div style="color:#abb2bf;font-size:0.85rem;margin-top:0.5rem">N = ' + n + '</div>';
      setStatus('Mean=' + Number(mean.toPrecision(4)) + ' Median=' + median);
    });`
  },

  {
    file: "pages/tools/math/margin-markup-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Cost & Selling Price</div>
      <label>Cost Price</label>
      <input id="mm-cost" type="number" class="ide-input" placeholder="800">
      <label class="mt-2">Selling Price</label>
      <input id="mm-sell" type="number" class="ide-input" placeholder="1000">
      <button id="mm-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Margin & Markup</div>
      <div id="mm-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('mm-calc').addEventListener('click', () => {
      const cost = parseFloat(document.getElementById('mm-cost').value) || 0;
      const sell = parseFloat(document.getElementById('mm-sell').value) || 0;
      if (!cost || !sell) return;
      const profit = sell - cost;
      const margin = (profit / sell * 100);
      const markup = (profit / cost * 100);
      document.getElementById('mm-output').innerHTML =
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Profit</span><span style="color:#98c379">' + Number(profit.toPrecision(6)) + '</span></div>' +
        '<div style="padding:3px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Margin %</span><span style="color:#61afef">' + Number(margin.toPrecision(4)) + '%</span></div>' +
        '<div style="padding:3px 0;display:flex;justify-content:space-between"><span>Markup %</span><span style="color:#d19a66">' + Number(markup.toPrecision(4)) + '%</span></div>';
      setStatus('Margin: ' + Number(margin.toPrecision(4)) + '% | Markup: ' + Number(markup.toPrecision(4)) + '%');
    });`
  },

  {
    file: "pages/tools/math/roi-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Investment Details</div>
      <label>Initial Investment</label>
      <input id="roi-invest" type="number" class="ide-input" placeholder="50000">
      <label class="mt-2">Final Value / Returns</label>
      <input id="roi-return" type="number" class="ide-input" placeholder="75000">
      <button id="roi-calc" class="ide-btn ide-btn-primary mt-2">Calculate ROI</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">ROI Results</div>
      <div id="roi-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('roi-calc').addEventListener('click', () => {
      const invest = parseFloat(document.getElementById('roi-invest').value) || 0;
      const ret = parseFloat(document.getElementById('roi-return').value) || 0;
      if (!invest) return;
      const net = ret - invest;
      const roi = ((net / invest) * 100);
      const col = roi >= 0 ? '#98c379' : '#e06c75';
      document.getElementById('roi-output').innerHTML =
        '<div style="font-size:2rem;font-weight:bold;color:' + col + '">' + Number(roi.toPrecision(4)) + '%</div>' +
        '<div style="color:' + col + ';margin-bottom:0.5rem">Net Gain: ' + Number(net.toPrecision(6)) + '</div>' +
        '<div style="color:#abb2bf">ROI = (Return - Cost) / Cost × 100</div>';
      setStatus('ROI: ' + Number(roi.toPrecision(4)) + '%');
    });`
  },

  {
    file: "pages/tools/math/sales-tax-vat-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Price & Tax Rate</div>
      <label>Pre-tax Price</label>
      <input id="tax-price" type="number" class="ide-input" placeholder="1000">
      <label class="mt-2">Tax Rate (%)</label>
      <input id="tax-rate" type="number" class="ide-input" placeholder="18">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <label>Tax Amount</label>
      <input id="tax-amount" class="ide-input" readonly>
      <label class="mt-2">Total (with Tax)</label>
      <input id="tax-total" class="ide-input" readonly style="font-size:1.3rem;font-weight:bold;color:#98c379;">
      <label class="mt-2">Reverse: Price from tax-inclusive total</label>
      <input id="tax-inc" type="number" class="ide-input" placeholder="Tax-inclusive amount">
      <input id="tax-exc" class="ide-input" readonly placeholder="Pre-tax price">
    </div>`,
    js: `
    function calcTax() {
      const p = parseFloat(document.getElementById('tax-price').value) || 0;
      const r = parseFloat(document.getElementById('tax-rate').value) || 0;
      const amount = Number((p * r / 100).toPrecision(6));
      const total = Number((p + amount).toPrecision(6));
      document.getElementById('tax-amount').value = amount;
      document.getElementById('tax-total').value = total;
      setStatus('Tax: ' + amount + ' | Total: ' + total);
    }
    document.getElementById('tax-inc').addEventListener('input', function() {
      const inc = parseFloat(this.value) || 0;
      const r = parseFloat(document.getElementById('tax-rate').value) || 0;
      document.getElementById('tax-exc').value = Number((inc / (1 + r/100)).toPrecision(6));
    });
    ['tax-price','tax-rate'].forEach(id => document.getElementById(id).addEventListener('input', calcTax));`
  },

  {
    file: "pages/tools/math/inflation-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Inflation Calculator</div>
      <label>Initial Amount</label>
      <input id="inf-amount" type="number" class="ide-input" placeholder="100000">
      <label class="mt-2">Annual Inflation Rate (%)</label>
      <input id="inf-rate" type="number" class="ide-input" placeholder="6">
      <label class="mt-2">Number of Years</label>
      <input id="inf-years" type="number" class="ide-input" placeholder="10">
      <button id="inf-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Results</div>
      <div id="inf-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('inf-calc').addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('inf-amount').value) || 0;
      const rate = parseFloat(document.getElementById('inf-rate').value) / 100 || 0;
      const years = parseFloat(document.getElementById('inf-years').value) || 0;
      if (!amount || !rate || !years) return;
      const future = amount * Math.pow(1 + rate, years);
      const purchasing = amount / Math.pow(1 + rate, years);
      document.getElementById('inf-output').innerHTML =
        '<div style="color:#abb2bf;font-size:0.85rem">To buy ₹' + amount.toLocaleString('en-IN') + ' worth of goods today, you will need:</div>' +
        '<div style="font-size:1.5rem;font-weight:bold;color:#e06c75;margin-top:0.5rem">₹' + future.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' in ' + years + ' years</div>' +
        '<div style="margin-top:0.5rem;color:#abb2bf">Today\'s money will only be worth:</div>' +
        '<div style="font-size:1.2rem;color:#61afef">₹' + purchasing.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' in real terms</div>';
      setStatus('Future cost: ₹' + Math.round(future).toLocaleString('en-IN'));
    });`
  },

  {
    file: "pages/tools/math/depreciation-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Asset Details</div>
      <label>Initial Value</label>
      <input id="dep-init" type="number" class="ide-input" placeholder="500000">
      <label class="mt-2">Salvage Value (at end)</label>
      <input id="dep-salv" type="number" class="ide-input" placeholder="50000">
      <label class="mt-2">Useful Life (years)</label>
      <input id="dep-life" type="number" class="ide-input" placeholder="5">
      <label class="mt-2">Method</label>
      <select id="dep-method" class="ide-input">
        <option value="sl">Straight Line</option>
        <option value="db">Declining Balance</option>
      </select>
      <button id="dep-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Depreciation Schedule</div>
      <div id="dep-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px; overflow-y: auto;"></div>
    </div>`,
    js: `
    document.getElementById('dep-calc').addEventListener('click', () => {
      const init = parseFloat(document.getElementById('dep-init').value) || 0;
      const salv = parseFloat(document.getElementById('dep-salv').value) || 0;
      const life = parseInt(document.getElementById('dep-life').value) || 0;
      const method = document.getElementById('dep-method').value;
      if (!init || !life) return;
      let rows = '';
      let bookVal = init;
      for (let y = 1; y <= life; y++) {
        let dep;
        if (method === 'sl') dep = (init - salv) / life;
        else dep = bookVal * (2 / life);
        bookVal -= dep;
        if (bookVal < salv) { dep += bookVal - salv; bookVal = salv; }
        rows += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #333"><span style="color:#abb2bf">Year ' + y + '</span><span style="color:#e06c75">-' + Math.abs(dep).toFixed(0) + '</span><span style="color:#9cdcfe">BV: ' + bookVal.toFixed(0) + '</span></div>';
        if (bookVal <= salv) break;
      }
      document.getElementById('dep-output').innerHTML = rows;
      setStatus('Depreciation schedule generated.');
    });`
  },

  {
    file: "pages/tools/math/salary-paycheck-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Salary Details</div>
      <label>Annual CTC (₹)</label>
      <input id="sal-ctc" type="number" class="ide-input" placeholder="1200000">
      <label class="mt-2">Standard Deduction (%)</label>
      <input id="sal-deduct" type="number" class="ide-input" value="10">
      <label class="mt-2">Tax Regime</label>
      <select id="sal-regime" class="ide-input">
        <option value="new">New Tax Regime</option>
        <option value="old">Old Tax Regime</option>
      </select>
      <button id="sal-calc" class="ide-btn ide-btn-primary mt-2">Calculate Take-Home</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Salary Breakdown</div>
      <div id="sal-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('sal-calc').addEventListener('click', () => {
      const ctc = parseFloat(document.getElementById('sal-ctc').value) || 0;
      const deductPct = parseFloat(document.getElementById('sal-deduct').value) / 100;
      const pf = 21600; // standard 12% of basic (approx)
      const deductions = ctc * deductPct + pf;
      const taxable = ctc - deductions;
      let tax = 0;
      // New regime 2024
      if (taxable > 300000) tax = Math.min(taxable-300000, 300000) * 0.05;
      if (taxable > 600000) tax += Math.min(taxable-600000, 300000) * 0.10;
      if (taxable > 900000) tax += Math.min(taxable-900000, 300000) * 0.15;
      if (taxable > 1200000) tax += Math.min(taxable-1200000, 300000) * 0.20;
      if (taxable > 1500000) tax += (taxable - 1500000) * 0.30;
      const cess = tax * 0.04;
      const takeHome = ctc - pf - tax - cess;
      document.getElementById('sal-output').innerHTML =
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Annual CTC</span><span style="color:#61afef">₹' + ctc.toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Deductions</span><span style="color:#e06c75">-₹' + Math.round(deductions).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Income Tax</span><span style="color:#e06c75">-₹' + Math.round(tax).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Cess (4%)</span><span style="color:#e06c75">-₹' + Math.round(cess).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:4px 0;font-size:1.2rem;display:flex;justify-content:space-between;font-weight:bold"><span>Take-Home / year</span><span style="color:#98c379">₹' + Math.round(takeHome).toLocaleString('en-IN') + '</span></div>' +
        '<div style="color:#abb2bf">Monthly: ₹' + Math.round(takeHome/12).toLocaleString('en-IN') + '</div>';
      setStatus('Take-home: ₹' + Math.round(takeHome/12).toLocaleString('en-IN') + '/mo');
    });`
  },

  {
    file: "pages/tools/math/car-lease-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Car Lease Details</div>
      <label>Car Price (MSRP)</label>
      <input id="lease-price" type="number" class="ide-input" placeholder="1000000">
      <label class="mt-2">Residual Value (%)</label>
      <input id="lease-residual" type="number" class="ide-input" placeholder="55">
      <label class="mt-2">Money Factor (APR / 2400)</label>
      <input id="lease-mf" type="number" class="ide-input" placeholder="0.00175" step="0.00001">
      <label class="mt-2">Lease Term (months)</label>
      <input id="lease-term" type="number" class="ide-input" placeholder="36">
      <button id="lease-calc" class="ide-btn ide-btn-primary mt-2">Calculate Monthly Payment</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Lease Payment Breakdown</div>
      <div id="lease-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('lease-calc').addEventListener('click', () => {
      const price = parseFloat(document.getElementById('lease-price').value) || 0;
      const resPct = parseFloat(document.getElementById('lease-residual').value) / 100;
      const mf = parseFloat(document.getElementById('lease-mf').value) || 0;
      const term = parseInt(document.getElementById('lease-term').value) || 36;
      if (!price) return;
      const residual = price * resPct;
      const depreciation = (price - residual) / term;
      const finance = (price + residual) * mf;
      const monthly = depreciation + finance;
      document.getElementById('lease-output').innerHTML =
        '<div style="font-size:1.5rem;font-weight:bold;color:#61afef">Monthly: ₹' + Math.round(monthly).toLocaleString('en-IN') + '</div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between;margin-top:0.5rem"><span>Depreciation/mo</span><span style="color:#e06c75">₹' + Math.round(depreciation).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Finance charge/mo</span><span style="color:#e06c75">₹' + Math.round(finance).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;display:flex;justify-content:space-between"><span>Residual Value</span><span style="color:#98c379">₹' + Math.round(residual).toLocaleString('en-IN') + '</span></div>';
      setStatus('Monthly payment: ₹' + Math.round(monthly).toLocaleString('en-IN'));
    });`
  },

  {
    file: "pages/tools/math/crypto-profit-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Crypto Trade Details</div>
      <label>Investment Amount (₹/$)</label>
      <input id="crypto-invest" type="number" class="ide-input" placeholder="50000">
      <label class="mt-2">Buy Price (per coin)</label>
      <input id="crypto-buy" type="number" class="ide-input" placeholder="2000">
      <label class="mt-2">Sell Price (per coin)</label>
      <input id="crypto-sell" type="number" class="ide-input" placeholder="3500">
      <label class="mt-2">Exchange Fee (%)</label>
      <input id="crypto-fee" type="number" class="ide-input" value="0.2">
      <button id="crypto-calc" class="ide-btn ide-btn-primary mt-2">Calculate P&L</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Profit / Loss</div>
      <div id="crypto-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('crypto-calc').addEventListener('click', () => {
      const invest = parseFloat(document.getElementById('crypto-invest').value) || 0;
      const buy = parseFloat(document.getElementById('crypto-buy').value) || 0;
      const sell = parseFloat(document.getElementById('crypto-sell').value) || 0;
      const fee = parseFloat(document.getElementById('crypto-fee').value) / 100;
      if (!invest || !buy || !sell) return;
      const coins = invest / buy;
      const sellVal = coins * sell;
      const buyFee = invest * fee;
      const sellFee = sellVal * fee;
      const profit = sellVal - invest - buyFee - sellFee;
      const pct = (profit / invest * 100);
      const col = profit >= 0 ? '#98c379' : '#e06c75';
      document.getElementById('crypto-output').innerHTML =
        '<div style="font-size:1.5rem;font-weight:bold;color:' + col + '">' + (profit>=0?'+':'') + profit.toFixed(2) + ' (' + pct.toFixed(2) + '%)</div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between;margin-top:0.5rem"><span>Coins purchased</span><span style="color:#9cdcfe">' + coins.toFixed(6) + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Sell value</span><span style="color:#98c379">' + sellVal.toFixed(2) + '</span></div>' +
        '<div style="padding:2px 0;display:flex;justify-content:space-between"><span>Total fees</span><span style="color:#e06c75">' + (buyFee+sellFee).toFixed(2) + '</span></div>';
      setStatus('P&L: ' + profit.toFixed(2) + ' (' + pct.toFixed(2) + '%)');
    });`
  },

  {
    file: "pages/tools/math/retirement-planner.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Retirement Plan Inputs</div>
      <label>Current Age</label>
      <input id="ret-age" type="number" class="ide-input" placeholder="30">
      <label class="mt-2">Retirement Age</label>
      <input id="ret-retire" type="number" class="ide-input" placeholder="60">
      <label class="mt-2">Monthly Savings (₹)</label>
      <input id="ret-saving" type="number" class="ide-input" placeholder="15000">
      <label class="mt-2">Annual Return Rate (%)</label>
      <input id="ret-rate" type="number" class="ide-input" placeholder="12">
      <button id="ret-calc" class="ide-btn ide-btn-primary mt-2">Calculate Corpus</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Retirement Corpus Forecast</div>
      <div id="ret-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('ret-calc').addEventListener('click', () => {
      const age = parseInt(document.getElementById('ret-age').value) || 0;
      const retire = parseInt(document.getElementById('ret-retire').value) || 0;
      const monthly = parseFloat(document.getElementById('ret-saving').value) || 0;
      const annualRate = parseFloat(document.getElementById('ret-rate').value) / 100;
      if (!age || !retire || !monthly || retire <= age) return;
      const years = retire - age;
      const n = years * 12;
      const r = annualRate / 12;
      const corpus = monthly * ((Math.pow(1+r, n) - 1) / r) * (1+r);
      const totalInvested = monthly * n;
      const returns = corpus - totalInvested;
      document.getElementById('ret-output').innerHTML =
        '<div style="font-size:1.5rem;font-weight:bold;color:#61afef">Corpus: ₹' + Math.round(corpus).toLocaleString('en-IN') + '</div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between;margin-top:0.5rem"><span>Total Invested</span><span style="color:#abb2bf">₹' + Math.round(totalInvested).toLocaleString('en-IN') + '</span></div>' +
        '<div style="padding:2px 0;display:flex;justify-content:space-between"><span>Returns Earned</span><span style="color:#98c379">₹' + Math.round(returns).toLocaleString('en-IN') + '</span></div>' +
        '<div style="color:#abb2bf;margin-top:0.5rem;font-size:0.85rem">SIP for ' + years + ' years at ' + (annualRate*100) + '% p.a.</div>';
      setStatus('Corpus: ₹' + Math.round(corpus).toLocaleString('en-IN'));
    });`
  },

  {
    file: "pages/tools/math/gpa-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">GPA / CGPA Calculator</div>
      <div id="gpa-rows">
        <div class="gpa-row d-flex gap-2 mb-1">
          <input class="ide-input gpa-course" placeholder="Subject name" style="flex:2">
          <input class="ide-input gpa-grade" type="number" placeholder="Grade (0-10)" step="0.1" min="0" max="10" style="flex:1">
          <input class="ide-input gpa-credits" type="number" placeholder="Credits" min="1" max="6" value="3" style="flex:1">
        </div>
      </div>
      <button id="gpa-add" class="ide-btn mt-2">+ Add Subject</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">GPA Result</div>
      <div id="gpa-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
      <button id="gpa-calc" class="ide-btn ide-btn-primary mt-2">Calculate GPA</button>
    </div>`,
    js: `
    document.getElementById('gpa-add').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'gpa-row d-flex gap-2 mb-1';
      row.innerHTML = '<input class="ide-input gpa-course" placeholder="Subject name" style="flex:2"><input class="ide-input gpa-grade" type="number" placeholder="Grade (0-10)" step="0.1" min="0" max="10" style="flex:1"><input class="ide-input gpa-credits" type="number" placeholder="Credits" min="1" max="6" value="3" style="flex:1">';
      document.getElementById('gpa-rows').appendChild(row);
    });
    document.getElementById('gpa-calc').addEventListener('click', () => {
      const grades = document.querySelectorAll('.gpa-grade');
      const credits = document.querySelectorAll('.gpa-credits');
      let totalPoints = 0, totalCredits = 0;
      grades.forEach((g, i) => {
        const grade = parseFloat(g.value) || 0;
        const credit = parseInt(credits[i].value) || 0;
        totalPoints += grade * credit;
        totalCredits += credit;
      });
      if (!totalCredits) return;
      const gpa = totalPoints / totalCredits;
      const col = gpa >= 8 ? '#98c379' : gpa >= 6 ? '#d19a66' : '#e06c75';
      document.getElementById('gpa-output').innerHTML =
        '<div style="font-size:2rem;font-weight:bold;color:' + col + '">' + gpa.toFixed(2) + ' / 10.00</div>' +
        '<div style="color:#abb2bf;margin-top:0.25rem">Total Credits: ' + totalCredits + '</div>' +
        '<div style="color:#abb2bf">Letter Grade: ' + (gpa>=9?'O':gpa>=8?'A+':gpa>=7?'A':gpa>=6?'B+':gpa>=5.5?'B':gpa>=5?'C':'F') + '</div>';
      setStatus('GPA: ' + gpa.toFixed(2));
    });`
  },

  {
    file: "pages/tools/math/currency-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Currency Converter</div>
      <label>Amount</label>
      <input id="cur-amount" type="number" class="ide-input" placeholder="100">
      <label class="mt-2">From Currency</label>
      <select id="cur-from" class="ide-input">
        <option value="USD">USD - US Dollar</option>
        <option value="INR" selected>INR - Indian Rupee</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="JPY">JPY - Japanese Yen</option>
        <option value="AUD">AUD - Australian Dollar</option>
      </select>
      <label class="mt-2">To Currency</label>
      <select id="cur-to" class="ide-input">
        <option value="USD" selected>USD - US Dollar</option>
        <option value="INR">INR - Indian Rupee</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="JPY">JPY - Japanese Yen</option>
        <option value="AUD">AUD - Australian Dollar</option>
      </select>
      <button id="cur-calc" class="ide-btn ide-btn-primary mt-2">Convert (Estimated Rates)</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Conversion Result</div>
      <div id="cur-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
      <div style="color:#abb2bf;font-size:0.75rem;margin-top:0.5rem">⚠️ Uses approximate static rates. For live rates, connect to a currency API.</div>
    </div>`,
    js: `
    const rates = { USD:1, INR:83.5, EUR:0.92, GBP:0.79, JPY:149.5, AUD:1.53 };
    document.getElementById('cur-calc').addEventListener('click', () => {
      const amt = parseFloat(document.getElementById('cur-amount').value) || 0;
      const from = document.getElementById('cur-from').value;
      const to = document.getElementById('cur-to').value;
      const inUSD = amt / rates[from];
      const result = inUSD * rates[to];
      document.getElementById('cur-output').innerHTML =
        '<div style="font-size:1.8rem;font-weight:bold;color:#61afef">' + result.toFixed(2) + ' ' + to + '</div>' +
        '<div style="color:#abb2bf;margin-top:0.25rem">' + amt + ' ' + from + ' = ' + result.toFixed(4) + ' ' + to + '</div>' +
        '<div style="color:#abb2bf;font-size:0.85rem">Rate: 1 ' + from + ' = ' + (rates[to]/rates[from]).toFixed(4) + ' ' + to + '</div>';
      setStatus(amt + ' ' + from + ' ≈ ' + result.toFixed(2) + ' ' + to);
    });`
  },

  {
    file: "pages/tools/math/mortgage-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Mortgage Details</div>
      <label>Home Price (₹)</label>
      <input id="mort-price" type="number" class="ide-input" placeholder="5000000">
      <label class="mt-2">Down Payment (₹)</label>
      <input id="mort-down" type="number" class="ide-input" placeholder="1000000">
      <label class="mt-2">Annual Interest Rate (%)</label>
      <input id="mort-rate" type="number" class="ide-input" placeholder="8.5">
      <label class="mt-2">Loan Term (years)</label>
      <input id="mort-years" type="number" class="ide-input" placeholder="20">
      <button id="mort-calc" class="ide-btn ide-btn-primary mt-2">Calculate EMI</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">EMI & Amortization Summary</div>
      <div id="mort-output" style="padding: 1rem; background: #111; border-radius: 6px; overflow-y:auto; max-height:320px;"></div>
    </div>`,
    js: `
    document.getElementById('mort-calc').addEventListener('click', () => {
      const price = parseFloat(document.getElementById('mort-price').value) || 0;
      const down = parseFloat(document.getElementById('mort-down').value) || 0;
      const annualRate = parseFloat(document.getElementById('mort-rate').value) / 100 / 12;
      const n = parseInt(document.getElementById('mort-years').value) * 12;
      const P = price - down;
      if (!P || !annualRate || !n) return;
      const emi = P * annualRate * Math.pow(1+annualRate, n) / (Math.pow(1+annualRate, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - P;
      let rows = '<div style="font-size:1.3rem;font-weight:bold;color:#61afef;margin-bottom:0.5rem">EMI: ₹' + Math.round(emi).toLocaleString('en-IN') + '/month</div>';
      rows += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #333"><span style="color:#abb2bf">Total Payment</span><span>₹' + Math.round(totalPayment).toLocaleString('en-IN') + '</span></div>';
      rows += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #333"><span style="color:#abb2bf">Total Interest</span><span style="color:#e06c75">₹' + Math.round(totalInterest).toLocaleString('en-IN') + '</span></div>';
      rows += '<div style="display:flex;justify-content:space-between;padding:2px 0;margin-bottom:0.5rem"><span style="color:#abb2bf">Principal</span><span style="color:#98c379">₹' + Math.round(P).toLocaleString('en-IN') + '</span></div>';
      rows += '<div style="color:#abb2bf;font-size:0.8rem;margin-bottom:0.25rem">Yearly Summary:</div>';
      let balance = P;
      for (let y = 1; y <= parseInt(document.getElementById('mort-years').value); y++) {
        let yInterest = 0, yPrincipal = 0;
        for (let m = 0; m < 12; m++) {
          const i = balance * annualRate;
          const p = emi - i;
          yInterest += i; yPrincipal += p;
          balance -= p;
        }
        rows += '<div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #222;font-size:0.8rem"><span style="color:#abb2bf">Y' + y + '</span><span style="color:#e06c75">-₹' + Math.round(yInterest).toLocaleString('en-IN') + ' int</span><span style="color:#9cdcfe">BV: ₹' + Math.round(Math.max(0,balance)).toLocaleString('en-IN') + '</span></div>';
      }
      document.getElementById('mort-output').innerHTML = rows;
      setStatus('EMI: ₹' + Math.round(emi).toLocaleString('en-IN') + '/month');
    });`
  },

  {
    file: "pages/tools/math/stock-average-calculator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Stock Purchase History</div>
      <div id="stock-rows">
        <div class="stock-row d-flex gap-2 mb-1">
          <input class="ide-input stock-qty" type="number" placeholder="Qty (shares)" min="1" style="flex:1">
          <input class="ide-input stock-price" type="number" placeholder="Buy Price (₹)" step="0.01" style="flex:1">
        </div>
      </div>
      <button id="stock-add" class="ide-btn mt-2">+ Add Purchase</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Average Cost & P&L</div>
      <div id="stock-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 180px;"></div>
      <label class="mt-2">Current Market Price (₹)</label>
      <input id="stock-current" type="number" class="ide-input" placeholder="Current price">
      <button id="stock-calc" class="ide-btn ide-btn-primary mt-2">Calculate</button>
    </div>`,
    js: `
    document.getElementById('stock-add').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'stock-row d-flex gap-2 mb-1';
      row.innerHTML = '<input class="ide-input stock-qty" type="number" placeholder="Qty (shares)" min="1" style="flex:1"><input class="ide-input stock-price" type="number" placeholder="Buy Price (₹)" step="0.01" style="flex:1">';
      document.getElementById('stock-rows').appendChild(row);
    });
    document.getElementById('stock-calc').addEventListener('click', () => {
      const qtys = document.querySelectorAll('.stock-qty');
      const prices = document.querySelectorAll('.stock-price');
      let totalQty = 0, totalCost = 0;
      qtys.forEach((q, i) => {
        const qty = parseFloat(q.value) || 0;
        const price = parseFloat(prices[i].value) || 0;
        totalQty += qty;
        totalCost += qty * price;
      });
      if (!totalQty) return;
      const avg = totalCost / totalQty;
      const current = parseFloat(document.getElementById('stock-current').value) || 0;
      const pnl = (current - avg) * totalQty;
      const pnlPct = ((current - avg) / avg * 100);
      const col = pnl >= 0 ? '#98c379' : '#e06c75';
      document.getElementById('stock-output').innerHTML =
        '<div style="font-size:1.3rem;font-weight:bold;color:#61afef">Avg. Cost: ₹' + avg.toFixed(2) + '</div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between;margin-top:0.5rem"><span>Total Shares</span><span>' + totalQty + '</span></div>' +
        '<div style="padding:2px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between"><span>Total Investment</span><span>₹' + totalCost.toFixed(2) + '</span></div>' +
        (current ? '<div style="font-size:1.2rem;color:' + col + ';margin-top:0.5rem">P&L: ' + (pnl>=0?'+':'') + '₹' + pnl.toFixed(2) + ' (' + pnlPct.toFixed(2) + '%)</div>' : '');
      setStatus('Avg: ₹' + avg.toFixed(2) + ' | P&L: ₹' + pnl.toFixed(2));
    });`
  },

  // ── MISCELLANEOUS ────────────────────────────────────────────────────────────

  {
    file: "pages/tools/miscellaneous/dice-roll-simulator.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Dice Settings</div>
      <label>Number of Dice</label>
      <input id="dice-count" type="number" class="ide-input" value="2" min="1" max="10">
      <label class="mt-2">Sides per Die</label>
      <select id="dice-sides" class="ide-input">
        <option value="4">D4</option>
        <option value="6" selected>D6</option>
        <option value="8">D8</option>
        <option value="10">D10</option>
        <option value="12">D12</option>
        <option value="20">D20</option>
        <option value="100">D100</option>
      </select>
      <button id="dice-roll" class="ide-btn ide-btn-primary mt-2">🎲 Roll Dice</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Roll Result</div>
      <div id="dice-output" style="padding: 1.5rem; background: #111; border-radius: 8px; text-align: center; min-height: 180px;"></div>
    </div>`,
    js: `
    document.getElementById('dice-roll').addEventListener('click', () => {
      const count = parseInt(document.getElementById('dice-count').value) || 1;
      const sides = parseInt(document.getElementById('dice-sides').value) || 6;
      const rolls = [];
      for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
      const total = rolls.reduce((a,b) => a+b, 0);
      document.getElementById('dice-output').innerHTML =
        '<div style="font-size:1rem;color:#abb2bf;margin-bottom:0.5rem">Rolling ' + count + 'd' + sides + '</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
        rolls.map(r => '<div style="width:50px;height:50px;border:2px solid #61afef;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;color:#61afef">' + r + '</div>').join('') +
        '</div>' +
        '<div style="font-size:2rem;font-weight:bold;color:#98c379;margin-top:1rem">Total: ' + total + '</div>';
      setStatus('Rolled ' + count + 'd' + sides + ' = ' + total);
    });`
  },

  {
    file: "pages/tools/miscellaneous/digital-tally-counter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Tally Counters</div>
      <div id="tally-counters" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
      <button id="tally-add" class="ide-btn mt-2">+ Add Counter</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Total Tally</div>
      <div id="tally-total" style="font-size:3rem;font-weight:bold;color:#61afef;text-align:center;padding:2rem;background:#111;border-radius:8px;">0</div>
    </div>`,
    js: `
    let tallyData = JSON.parse(localStorage.getItem('tally-data') || '[{"name":"Counter 1","count":0}]');
    function saveTally() { localStorage.setItem('tally-data', JSON.stringify(tallyData)); }
    function renderTally() {
      const container = document.getElementById('tally-counters');
      container.innerHTML = '';
      let total = 0;
      tallyData.forEach((t, i) => {
        total += t.count;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;background:#111;border-radius:6px;padding:0.5rem;';
        row.innerHTML = '<input value="' + t.name + '" style="flex:1;background:transparent;border:none;color:#d4d4d4;font-family:monospace;font-size:0.9rem;">' +
          '<button data-i="' + i + '" class="tally-dec ide-btn" style="padding:0.25rem 0.5rem">−</button>' +
          '<span style="color:#61afef;font-weight:bold;min-width:40px;text-align:center">' + t.count + '</span>' +
          '<button data-i="' + i + '" class="tally-inc ide-btn ide-btn-primary" style="padding:0.25rem 0.5rem">+</button>' +
          '<button data-i="' + i + '" class="tally-del ide-btn" style="padding:0.25rem 0.5rem;color:#e06c75">×</button>';
        row.querySelector('input').addEventListener('input', e => { tallyData[i].name = e.target.value; saveTally(); });
        container.appendChild(row);
      });
      container.querySelectorAll('.tally-inc').forEach(b => b.addEventListener('click', () => { tallyData[b.dataset.i].count++; saveTally(); renderTally(); }));
      container.querySelectorAll('.tally-dec').forEach(b => b.addEventListener('click', () => { tallyData[b.dataset.i].count = Math.max(0, tallyData[b.dataset.i].count-1); saveTally(); renderTally(); }));
      container.querySelectorAll('.tally-del').forEach(b => b.addEventListener('click', () => { tallyData.splice(b.dataset.i,1); saveTally(); renderTally(); }));
      document.getElementById('tally-total').textContent = total;
    }
    document.getElementById('tally-add').addEventListener('click', () => { tallyData.push({name:'Counter ' + (tallyData.length+1), count:0}); saveTally(); renderTally(); });
    renderTally();`
  },

  {
    file: "pages/tools/miscellaneous/password-strength-meter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Password Strength Analyzer</div>
      <label>Enter Password</label>
      <input id="pwd-input" type="password" class="ide-input" placeholder="Type your password...">
      <label class="mt-2"><input type="checkbox" id="pwd-show"> Show Password</label>
      <div id="pwd-bar-wrap" class="mt-2" style="height:8px;background:#333;border-radius:4px;">
        <div id="pwd-bar" style="height:100%;width:0%;border-radius:4px;transition:width 0.3s,background 0.3s;"></div>
      </div>
      <div id="pwd-strength" class="ide-status mt-1">Enter password to analyze.</div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Security Checklist</div>
      <div id="pwd-checks" style="padding:1rem;background:#111;border-radius:6px;min-height:180px;"></div>
    </div>`,
    js: `
    document.getElementById('pwd-show').addEventListener('change', function() {
      document.getElementById('pwd-input').type = this.checked ? 'text' : 'password';
    });
    document.getElementById('pwd-input').addEventListener('input', function() {
      const p = this.value;
      const checks = [
        {label: 'At least 8 characters', ok: p.length >= 8},
        {label: 'At least 12 characters', ok: p.length >= 12},
        {label: 'Contains uppercase (A-Z)', ok: /[A-Z]/.test(p)},
        {label: 'Contains lowercase (a-z)', ok: /[a-z]/.test(p)},
        {label: 'Contains numbers (0-9)', ok: /[0-9]/.test(p)},
        {label: 'Contains special chars (!@#$...)', ok: /[!@#$%^&*()_+\\-=\\[\\]{};:,.<>?]/.test(p)},
        {label: 'No common patterns (123, abc)', ok: !/(?:123|abc|password|qwerty)/i.test(p)}
      ];
      const score = checks.filter(c => c.ok).length;
      const pct = Math.round(score / checks.length * 100);
      const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong','Excellent'];
      const colors = ['#e06c75','#e06c75','#d19a66','#d19a66','#61afef','#98c379','#98c379'];
      const idx = Math.floor(score / checks.length * 6);
      document.getElementById('pwd-bar').style.width = pct + '%';
      document.getElementById('pwd-bar').style.background = colors[idx];
      document.getElementById('pwd-strength').textContent = labels[idx] + ' (' + score + '/' + checks.length + ' checks passed)';
      document.getElementById('pwd-strength').style.color = colors[idx];
      document.getElementById('pwd-checks').innerHTML = checks.map(c =>
        '<div style="display:flex;align-items:center;gap:0.5rem;padding:3px 0"><span style="color:' + (c.ok?'#98c379':'#e06c75') + '">' + (c.ok?'✓':'✗') + '</span><span style="color:' + (c.ok?'#d4d4d4':'#abb2bf') + '">' + c.label + '</span></div>'
      ).join('');
    });`
  },

  {
    file: "pages/tools/miscellaneous/pomodoro-focus-timer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Pomodoro Settings</div>
      <label>Focus Duration (min)</label>
      <input id="pom-work" type="number" class="ide-input" value="25">
      <label class="mt-2">Short Break (min)</label>
      <input id="pom-short" type="number" class="ide-input" value="5">
      <label class="mt-2">Long Break (min)</label>
      <input id="pom-long" type="number" class="ide-input" value="15">
      <div class="ide-control-group mt-2">
        <button id="pom-start" class="ide-btn ide-btn-primary">Start Focus</button>
        <button id="pom-break" class="ide-btn">Short Break</button>
        <button id="pom-reset" class="ide-btn">Reset</button>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Timer Display</div>
      <div style="text-align:center;padding:2rem;background:#111;border-radius:8px;">
        <div id="pom-phase" style="font-size:1rem;color:#abb2bf;margin-bottom:0.5rem">FOCUS</div>
        <div id="pom-time" style="font-size:4.5rem;font-weight:bold;color:#61afef;letter-spacing:4px">25:00</div>
        <div id="pom-count" style="font-size:0.9rem;color:#abb2bf;margin-top:0.5rem">Pomodoro #1</div>
      </div>
    </div>`,
    js: `
    let pomTimer = null, pomSecs = 0, pomRunning = false, pomPomodoros = 0;
    const pomDisplay = document.getElementById('pom-time');
    const pomPhase = document.getElementById('pom-phase');
    const pomCount = document.getElementById('pom-count');
    function pomFmt(s) { return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
    function startTimer(seconds, phase, color) {
      clearInterval(pomTimer); pomSecs = seconds; pomRunning = true;
      pomPhase.textContent = phase; pomPhase.style.color = color;
      pomDisplay.style.color = color;
      pomTimer = setInterval(() => {
        pomSecs--;
        pomDisplay.textContent = pomFmt(pomSecs);
        if (pomSecs <= 0) {
          clearInterval(pomTimer); pomRunning = false;
          if (phase === '🍅 FOCUS') { pomPomodoros++; pomCount.textContent = 'Pomodoro #' + (pomPomodoros+1); }
          setStatus(phase + ' complete!');
        }
      }, 1000);
      pomDisplay.textContent = pomFmt(seconds);
    }
    document.getElementById('pom-start').addEventListener('click', () => {
      const mins = parseInt(document.getElementById('pom-work').value) || 25;
      startTimer(mins * 60, '🍅 FOCUS', '#61afef');
      setStatus('Focus session started...');
    });
    document.getElementById('pom-break').addEventListener('click', () => {
      const mins = parseInt(document.getElementById('pom-short').value) || 5;
      startTimer(mins * 60, '☕ BREAK', '#98c379');
      setStatus('Break started...');
    });
    document.getElementById('pom-reset').addEventListener('click', () => {
      clearInterval(pomTimer); pomRunning = false;
      pomDisplay.textContent = '25:00'; pomPhase.textContent = 'FOCUS';
      setStatus('Timer reset.');
    });`
  },

  // ── NETWORK ─────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/network/email-header-analyzer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Email Header Input</div>
      <textarea id="eh-input" class="ide-input" rows="14" placeholder="Paste raw email header here...&#10;&#10;Received: from mail.example.com...&#10;From: Alice &lt;alice@example.com&gt;&#10;To: Bob &lt;bob@example.com&gt;&#10;Subject: Hello World"></textarea>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Parsed Header Fields</div>
      <div id="eh-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 250px; overflow-y:auto;"></div>
    </div>`,
    js: `
    document.getElementById('eh-input').addEventListener('input', function() {
      const raw = this.value;
      const fields = [
        {label:'From',      rx: /^From:\s*(.+)/im},
        {label:'To',        rx: /^To:\s*(.+)/im},
        {label:'Subject',   rx: /^Subject:\s*(.+)/im},
        {label:'Date',      rx: /^Date:\s*(.+)/im},
        {label:'Message-ID',rx: /^Message-ID:\s*(.+)/im},
        {label:'Reply-To',  rx: /^Reply-To:\s*(.+)/im},
        {label:'Return-Path',rx: /^Return-Path:\s*(.+)/im},
        {label:'X-Mailer',  rx: /^X-Mailer:\s*(.+)/im},
        {label:'MIME-Version',rx: /^MIME-Version:\s*(.+)/im},
        {label:'Content-Type',rx: /^Content-Type:\s*(.+)/im},
        {label:'SPF Result', rx: /spf=(\\S+)/i},
        {label:'DKIM Result',rx: /dkim=(\\S+)/i},
        {label:'DMARC Result',rx: /dmarc=(\\S+)/i},
      ];
      const received = (raw.match(/^Received:.+/gim) || []);
      let html = fields.map(f => {
        const m = raw.match(f.rx);
        return m ? '<div style="display:flex;gap:0.5rem;padding:3px 0;border-bottom:1px solid #333;font-size:0.85rem"><span style="color:#61afef;min-width:120px;font-weight:bold">' + f.label + '</span><span style="color:#d4d4d4;word-break:break-all">' + (m[1]||m[0]).trim() + '</span></div>' : '';
      }).filter(Boolean).join('');
      if (received.length) html += '<div style="margin-top:0.5rem;color:#abb2bf;font-size:0.8rem">' + received.length + ' Received header(s) found (routing hops).</div>';
      document.getElementById('eh-output').innerHTML = html || '<span style="color:#abb2bf">No recognized headers found. Paste full raw email header.</span>';
      setStatus('Parsed ' + fields.filter(f => raw.match(f.rx)).length + ' header fields.');
    });`
  },

  // ── OFFICE ──────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/office/presentation-maker.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Presentation Slide Builder</div>
      <label>Presentation Title</label>
      <input id="pres-title" class="ide-input" placeholder="My Presentation">
      <label class="mt-2">Slide Content (one bullet per line)</label>
      <textarea id="pres-content" class="ide-input" rows="8" placeholder="• Introduction&#10;• Key points&#10;• Data analysis&#10;• Conclusion"></textarea>
      <label class="mt-2">Theme</label>
      <select id="pres-theme" class="ide-input">
        <option value="dark">Dark Professional</option>
        <option value="blue">Corporate Blue</option>
        <option value="green">Fresh Green</option>
      </select>
      <button id="pres-preview" class="ide-btn ide-btn-primary mt-2">Preview Slide</button>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Slide Preview</div>
      <div id="pres-slide" style="border-radius:8px;padding:2rem;min-height:250px;border:1px solid #444;display:flex;flex-direction:column;justify-content:center;"></div>
    </div>`,
    js: `
    const themes = {
      dark: {bg:'#1e1e1e',title:'#61afef',text:'#d4d4d4'},
      blue: {bg:'#003366',title:'#ffffff',text:'#cce0ff'},
      green: {bg:'#1a3d20',title:'#98ff98',text:'#d4f5d4'}
    };
    document.getElementById('pres-preview').addEventListener('click', () => {
      const title = document.getElementById('pres-title').value || 'Untitled Slide';
      const content = document.getElementById('pres-content').value;
      const theme = themes[document.getElementById('pres-theme').value];
      const bullets = content.split('\\n').filter(l => l.trim()).map(l => '<div style="padding:4px 0;color:' + theme.text + '">' + l.trim() + '</div>').join('');
      document.getElementById('pres-slide').style.background = theme.bg;
      document.getElementById('pres-slide').innerHTML =
        '<div style="font-size:1.5rem;font-weight:bold;color:' + theme.title + ';border-bottom:2px solid ' + theme.title + ';padding-bottom:0.5rem;margin-bottom:1rem">' + title + '</div>' + bullets;
      setStatus('Slide preview rendered.');
    });`
  },

  // ── UTILITIES ────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/utilities/palette-extractor.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Image Palette Extractor</div>
      <div class="drop-zone" id="pe-drop">Click / Drag Image</div>
      <input type="file" id="pe-file" style="display: none;" accept="image/*">
      <label class="mt-2">Colors to Extract</label>
      <input id="pe-count" type="range" class="ide-input" min="4" max="12" value="6">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Extracted Palette</div>
      <div id="pe-swatches" class="d-flex flex-wrap gap-2 p-3 border rounded bg-dark" style="min-height: 150px;"></div>
    </div>`,
    js: `
    let peImg = null;
    document.getElementById('pe-drop').addEventListener('click', () => document.getElementById('pe-file').click());
    document.getElementById('pe-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = evt => {
        const img = new Image();
        img.onload = () => { peImg = img; extractPalette(); };
        img.src = evt.target.result;
      };
      r.readAsDataURL(f);
    });
    document.getElementById('pe-count').addEventListener('input', extractPalette);
    function extractPalette() {
      if (!peImg) return;
      const count = parseInt(document.getElementById('pe-count').value);
      const cvs = document.createElement('canvas');
      cvs.width = 60; cvs.height = 60;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(peImg, 0, 0, 60, 60);
      const d = ctx.getImageData(0, 0, 60, 60).data;
      const step = Math.floor(d.length / 4 / count);
      const colors = [];
      for (let i = 0; i < count; i++) {
        const idx = i * step * 4;
        colors.push('#' + ((1<<24)+(d[idx]<<16)+(d[idx+1]<<8)+d[idx+2]).toString(16).slice(1));
      }
      const container = document.getElementById('pe-swatches');
      container.innerHTML = '';
      colors.forEach(hex => {
        const s = document.createElement('div');
        s.style.cssText = 'flex:1 1 70px;height:50px;background:' + hex + ';border-radius:6px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:2px;font-size:10px;color:#fff;text-shadow:0 1px 2px #000;font-weight:bold;';
        s.textContent = hex; s.title = 'Click to copy';
        s.addEventListener('click', () => { navigator.clipboard.writeText(hex); setStatus('Copied ' + hex + '!'); });
        container.appendChild(s);
      });
      setStatus('Extracted ' + count + ' colors.');
    }`
  },

  // ── VIDEOS ──────────────────────────────────────────────────────────────────

  {
    file: "pages/tools/videos/midi-visualizer.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">MIDI Visualizer</div>
      <div class="drop-zone" id="midi-drop">Drop MIDI File Here</div>
      <input type="file" id="midi-file" style="display: none;" accept=".mid,.midi">
      <div class="mt-2 p-3 border rounded" style="background:#111;font-size:0.85rem;color:#abb2bf;">
        <p>🎵 MIDI visualization requires the <a href="https://magenta.github.io/magenta-js/music/" target="_blank" style="color:#61afef">Magenta.js</a> or <a href="https://cifkao.github.io/html-midi-player/" target="_blank" style="color:#61afef">html-midi-player</a> library for full playback.</p>
        <p>Upload a MIDI file to see file metadata and note count analysis.</p>
      </div>
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">MIDI File Info</div>
      <div id="midi-output" style="padding: 1rem; background: #111; border-radius: 6px; min-height: 200px;"></div>
    </div>`,
    js: `
    document.getElementById('midi-drop').addEventListener('click', () => document.getElementById('midi-file').click());
    document.getElementById('midi-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      document.getElementById('midi-output').innerHTML =
        '<div style="color:#61afef;font-weight:bold">' + f.name + '</div>' +
        '<div style="color:#abb2bf;margin-top:0.5rem">Size: ' + (f.size/1024).toFixed(1) + ' KB</div>' +
        '<div style="color:#abb2bf">Type: ' + (f.type || 'audio/midi') + '</div>' +
        '<div style="margin-top:1rem;color:#d19a66">⚠️ Full MIDI playback/visualization requires a MIDI parsing library.<br>Integrate html-midi-player or Tone.js for interactive piano roll display.</div>';
      setStatus('Loaded: ' + f.name);
    });`
  },

  {
    file: "pages/tools/videos/mp3-volume-booster.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Audio File Input</div>
      <div class="drop-zone" id="vol-drop">Drop MP3 / WAV / OGG File</div>
      <input type="file" id="vol-file" style="display: none;" accept="audio/*">
      <label class="mt-2">Gain Boost (dB): <span id="vol-db-val">+6</span> dB</label>
      <input id="vol-db" type="range" class="ide-input" min="-20" max="20" value="6">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Volume Processing</div>
      <audio id="vol-player" controls style="width:100%;margin-bottom:0.5rem;"></audio>
      <div id="vol-info" class="ide-status" style="font-size:0.85rem;color:#abb2bf;">Load a file to apply gain.</div>
      <div class="mt-2 p-3 border rounded" style="background:#111;font-size:0.85rem;color:#abb2bf;">Note: This preview applies gain via Web Audio API's GainNode. True volume-modified export requires server-side processing or the WebCodecs API.</div>
    </div>`,
    js: `
    let volCtx = null, volSource = null, volGain = null;
    const volPlayer = document.getElementById('vol-player');
    const volDb = document.getElementById('vol-db');
    const volDbVal = document.getElementById('vol-db-val');
    const volInfo = document.getElementById('vol-info');

    volDb.addEventListener('input', function() {
      volDbVal.textContent = (this.value >= 0 ? '+' : '') + this.value;
      if (volGain) {
        const linear = Math.pow(10, parseInt(this.value) / 20);
        volGain.gain.value = linear;
        setStatus('Gain set to ' + this.value + ' dB (×' + linear.toFixed(2) + ')');
      }
    });

    document.getElementById('vol-drop').addEventListener('click', () => document.getElementById('vol-file').click());
    document.getElementById('vol-file').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      volPlayer.src = url;

      // Web Audio API processing
      try {
        volCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = volCtx.createMediaElementSource(volPlayer);
        volGain = volCtx.createGain();
        const linear = Math.pow(10, parseInt(volDb.value) / 20);
        volGain.gain.value = linear;
        source.connect(volGain).connect(volCtx.destination);
        volInfo.textContent = 'Loaded: ' + f.name + ' — Gain active via Web Audio GainNode.';
        setStatus('Loaded ' + f.name + ' — gain applied.');
      } catch(err) {
        volInfo.textContent = 'Error: ' + err.message;
        setStatus('Audio error.', true);
      }
    });`
  },

  {
    file: "pages/tools/videos/wav-to-mp3-converter.html",
    html: `
    <div class="ide-panel">
      <div class="ide-panel-title">Audio File Input</div>
      <div class="drop-zone" id="wav-drop">Drop WAV / OGG / FLAC File</div>
      <input type="file" id="wav-file" style="display: none;" accept="audio/*">
    </div>
    <div class="ide-panel">
      <div class="ide-panel-title">Audio Player & Info</div>
      <audio id="wav-player" controls style="width:100%;margin-bottom:0.5rem;"></audio>
      <div id="wav-info" style="padding:1rem;background:#111;border-radius:6px;font-size:0.85rem;color:#abb2bf;min-height:100px;">
        Load an audio file to preview it here.
        <br><br>
        <strong style="color:#d19a66">⚠️ True WAV→MP3 encoding</strong> requires the <a href="https://github.com/nicktindall/lamejs" target="_blank" style="color:#61afef">lamejs</a> library or a server-side FFmpeg process.
        <br>Integrate lamejs for pure client-side MP3 encoding.
      </div>
    </div>`,
    js: `
    document.getElementById('wav-drop').addEventListener('click', () => document.getElementById('wav-file').click());
    document.getElementById('wav-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      document.getElementById('wav-player').src = url;
      document.getElementById('wav-info').innerHTML =
        '<strong style="color:#61afef">File:</strong> ' + f.name + '<br>' +
        '<strong style="color:#61afef">Size:</strong> ' + (f.size/1024/1024).toFixed(2) + ' MB<br>' +
        '<strong style="color:#61afef">Type:</strong> ' + f.type + '<br><br>' +
        '<span style="color:#d19a66">⚠️ Full MP3 encoding requires lamejs library integration.</span>';
      setStatus('Loaded: ' + f.name);
    });`
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// HTML template: builds a complete, standalone page from parts
// ─────────────────────────────────────────────────────────────────────────────

const IDE_CSS = `
  .ide-container { display:flex;flex-direction:column;gap:1.5rem;background:#1e1e1e;color:#d4d4d4;border-radius:12px;padding:1.5rem;font-family:'Fira Code',monospace,Consolas,Courier;border:1px solid #333;box-shadow:0 10px 30px rgba(0,0,0,.3); }
  .ide-header { display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #333;padding-bottom:.8rem;margin-bottom:1rem; }
  .ide-title { font-size:1.25rem;color:#61afef;font-weight:bold;display:flex;align-items:center;gap:.5rem; }
  .ide-body { display:grid;grid-template-columns:1fr 1fr;gap:1.5rem; }
  @media(max-width:992px){ .ide-body{ grid-template-columns:1fr; } }
  .ide-panel { display:flex;flex-direction:column;gap:1rem;background:#252526;border-radius:8px;padding:1.2rem;border:1px solid #3c3c3c; }
  .ide-panel-title { font-size:.95rem;text-transform:uppercase;letter-spacing:.05em;color:#abb2bf;border-bottom:1px solid #3c3c3c;padding-bottom:.5rem;margin-bottom:.5rem;display:flex;justify-content:space-between;align-items:center; }
  .ide-input { width:100%;background:#1e1e1e;color:#9cdcfe;border:1px solid #3c3c3c;border-radius:6px;padding:.8rem;font-family:inherit;font-size:.9rem;resize:vertical; }
  .ide-input:focus { outline:none;border-color:#61afef; }
  .ide-control-group { display:flex;flex-wrap:wrap;gap:.6rem; }
  .ide-btn { background:#3a3d41;color:#fff;border:1px solid #4b4e52;border-radius:6px;padding:.5rem 1rem;cursor:pointer;font-family:inherit;font-size:.85rem;transition:background .2s; }
  .ide-btn:hover { background:#4b4e52; }
  .ide-btn-primary { background:#007acc;border-color:#0062a3; }
  .ide-btn-primary:hover { background:#0062a3; }
  .ide-status { font-size:.8rem;color:#98c379; }
  .ide-error { color:#e06c75; }
  .drop-zone { border:2px dashed #4b4e52;border-radius:6px;padding:1.5rem;text-align:center;cursor:pointer;background:#1e1e1e;transition:border-color .2s; }
`;

function buildPage(title, desc, bodyHtml, scriptJs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${desc}">
  <meta name="robots" content="index,follow">
  <title>${title} | BlueTEXT</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/assets/css/main.css">
  <style>${IDE_CSS}</style>
  <script src="/assets/js/app.js" defer></script>
</head>
<body>
  <div id="header-component"><!-- HEADER_START --><!-- HEADER_END --></div>
  <!-- MODALS_START --><!-- MODALS_END -->
  <main class="container py-4" id="main-content">
    <div class="ide-container">
      <div class="ide-header">
        <div class="ide-title">🔧 ${title}</div>
        <div class="ide-status" id="global-status">Ready</div>
      </div>
      <div class="ide-body">${bodyHtml}</div>
    </div>
  </main>
  <div id="footer-component"><!-- FOOTER_START --><!-- FOOTER_END --></div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script>
  (function(){
    "use strict";
    function setStatus(text, isError) {
      const el = document.getElementById('global-status');
      if (el) { el.textContent = text; el.className = isError ? 'ide-status ide-error' : 'ide-status'; }
    }
    ${scriptJs}
  })();
  </script>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main executor
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  let written = 0;
  for (const tool of TOOLS) {
    const absPath = path.join(ROOT, tool.file);
    const filename = path.basename(absPath, ".html");
    const title = filename.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
    const html = buildPage(title, tool.description || title + " — free client-side tool on BlueTEXT.in.", tool.html, tool.js);
    await fs.writeFile(absPath, html, "utf8");
    written++;
    console.log(`[${written}/${TOOLS.length}] ✓ ${tool.file}`);
  }
  console.log(`\nAll ${written} tools written successfully.`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exitCode = 1;
});
