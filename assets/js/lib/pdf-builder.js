/**
 * pdf-builder.js — Streaming, zero-dependency PDF 1.4 writer
 *
 * This version supports:
 *   - Bold columns (/F2 Helvetica-Bold)
 *   - Cell alignment (Left, Center, Right)
 *   - Auto column width sizing and scaling
 *   - Memory-efficient binary chunk streaming
 */
const PDFBuilder = (() => {

    /* ── Page sizes (pt, portrait) ── */
    const PAGE_SIZES = {
        a0:[2384,3370], a1:[1684,2384], a2:[1191,1684],
        a3:[842,1191],  a4:[595,842],   a5:[420,595],
        letter:[612,792], legal:[612,1008]
    };

    /* Round to 3 decimal places for clean PDF numbers */
    const r3 = v => Math.round(v * 1000) / 1000;

    /* ── PDF literal string encoder (ASCII-safe output) ── */
    function ps(s) {
        let o = '(';
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            if      (c === 40)  o += '\\(';
            else if (c === 41)  o += '\\)';
            else if (c === 92)  o += '\\\\';
            else if (c >= 32 && c <= 126) o += s[i];               // printable ASCII
            else if (c >= 160 && c <= 255) o += '\\' + c.toString(8).padStart(3,'0'); // Latin-1
            else o += ' ';                                           // non-printable → space
        }
        return o + ')';
    }

    /* ── Helvetica proportional widths (1/1000 em, Adobe AFM simplified) ── */
    const HW = (() => {
        const m = {};
        const set = (chars, w) => chars.split('').forEach(c => { m[c.charCodeAt(0)] = w; });
        set(' !(),.:;[]{}|', 278);
        set('filrt\'"', 222);
        set('jJ', 278);
        set('r', 333);
        set('acdeghnopqusvxyz', 556);
        set('bkmw', 611);
        set('ABCDEFGHIKLNOPQRSTUVXYZ', 667);
        set('HMW', 778);
        set('0123456789', 556);
        set('+-=<>', 584);
        set('-/', 333);
        return m;
    })();

    /* Measure text width in pt at given fontSize */
    function tw(str, fs) {
        let w = 0;
        for (let i = 0; i < str.length; i++) w += ((HW[str.charCodeAt(i)] || 556) / 1000) * fs;
        return w;
    }

    /* Truncate string with ellipsis to fit maxW */
    function truncate(s, fs, maxW) {
        if (!s || maxW <= 0) return '';
        if (tw(s, fs) <= maxW) return s;
        const ellipsisW = tw('...', fs);
        let lo = 0, hi = s.length;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (tw(s.slice(0, mid), fs) + ellipsisW <= maxW) lo = mid; else hi = mid - 1;
        }
        return lo > 0 ? s.slice(0, lo) + '...' : '...';
    }

    /* Word-wrap text into array of lines fitting maxW */
    function wrapLines(s, fs, maxW) {
        if (!s || maxW <= 0) return [''];
        if (tw(s, fs) <= maxW) return [s];
        const words = s.split(' ');
        const lines = [];
        let cur = '';
        for (const word of words) {
            const test = cur ? cur + ' ' + word : word;
            if (tw(test, fs) <= maxW) { cur = test; continue; }
            if (cur) lines.push(cur);
            if (tw(word, fs) > maxW) {
                let seg = '';
                for (const ch of word) {
                    if (tw(seg + ch, fs) > maxW) { if (seg) lines.push(seg); seg = ch; }
                    else seg += ch;
                }
                cur = seg;
            } else {
                cur = word;
            }
        }
        if (cur) lines.push(cur);
        return lines.length ? lines : [''];
    }

    /* ── Streaming PDF writer ── */
    class PDFBuilder {
        /**
         * @param {object} opts
         *   pageSize    'a4'|'a3'|'a2'|'a1'|'letter'|'legal'
         *   orientation 'p' (portrait) | 'l' (landscape)
         *   fontSize    number in pt (default 9)
         *   margin      number in pt (default 28)
         *   layout      'fit' | 'wide'   (default 'fit')
         *   minColWidth number in pt (default 80; applies in 'wide' mode)
         *   wrapText    boolean (default false — truncate with …)
         *   colWidths   number[] — explicit per-column widths (overrides auto)
         *   boldFields  string[] — list of fields to render bold
         *   alignFields object — map of field -> 'l'|'c'|'r'
         */
        constructor(opts = {}) {
            this._o  = opts;
            const sz = (opts.pageSize || 'a4').toLowerCase();
            const [bw, bh] = PAGE_SIZES[sz] || PAGE_SIZES.a4;
            this._bW = opts.orientation === 'l' ? bh : bw;
            this._bH = opts.orientation === 'l' ? bw : bh;
            this.fs  = Math.max(5, Math.min(24, parseInt(opts.fontSize, 10) || 9));
            this.mg  = Math.max(10, opts.margin || 28);

            /* ── Streaming state ── */
            this._enc   = new TextEncoder();   // all strings are ASCII
            this._parts = [];                  // Uint8Array chunks
            this._off   = 0;                   // running byte offset
            this._xref  = new Map();           // objId → byte offset
            
            // Note: 1=catalog, 2=pages, 3=Helvetica, 4=Helvetica-Bold, 5=Helvetica-Oblique, 6=Helvetica-BoldOblique
            this._nid   = 6;                   // next free ID
            this._pids  = [];                  // page-object IDs

            this._w('%PDF-1.4\n');
        }

        /* Encode string → Uint8Array → push to _parts, advance _off */
        _w(str) {
            const b = this._enc.encode(str);
            this._parts.push(b);
            this._off += b.byteLength;
        }

        /* Push raw bytes → push to _parts, advance _off */
        _wb(u8) {
            this._parts.push(u8);
            this._off += u8.byteLength;
        }

        /* Allocate next object ID */
        _oid() { return ++this._nid; }

        /* Write a stream object */
        _writeStream(id, content) {
            const bytes = typeof content === 'string' ? this._enc.encode(content) : content;
            this._xref.set(id, this._off);
            this._w(`${id} 0 obj\n<< /Length ${bytes.byteLength} >>\nstream\n`);
            this._wb(bytes);
            this._w(`\nendstream\nendobj\n`);
        }

        /* Encode content and page */
        _commitPage(lines, pageW, pageH) {
            const content = lines.join('\n');
            const sid = this._oid();
            const pid = this._oid();
            this._writeStream(sid, content);
            this._xref.set(pid, this._off);
            this._w(
                `${pid} 0 obj\n` +
                `<< /Type /Page /Parent 2 0 R\n` +
                `   /MediaBox [0 0 ${r3(pageW)} ${r3(pageH)}]\n` +
                `   /Contents ${sid} 0 R\n` +
                `   /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >>\n` +
                `>>\nendobj\n`
            );
            this._pids.push(pid);
        }

        /* ═══════════════════════════════════════════════════════════
         * addTableData — render rows+fields to PDF pages
         * ═══════════════════════════════════════════════════════════ */
        addTableData(fields, rows, onProgress) {
            return new Promise(resolve => {
                const o    = this._o;
                const fs   = this.fs;
                const mg   = this.mg;
                const wrap = !!o.wrapText;
                const wide = (o.layout === 'wide');
                const minCW = Math.max(20, o.minColWidth || 80);
                const pH   = this._bH;
                const cp   = 3;         // cell padding
                const lh   = fs + 3;    // line height
                const hh   = lh + cp * 2; // header row height

                const boldFields = o.boldFields || [];
                const alignFields = o.alignFields || {};
                const cellStylesState = o.cellStylesState || {};
                const showGridlines = o.gridlines !== false;

                function hexToRgb(hex) {
                    if (!hex) return null;
                    hex = hex.replace('#', '');
                    if (hex.length === 3) {
                        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                    }
                    const num = parseInt(hex, 16);
                    if (isNaN(num)) return null;
                    return [
                        r3(((num >> 16) & 255) / 255),
                        r3(((num >> 8) & 255) / 255),
                        r3((num & 255) / 255)
                    ];
                }

                function getStrokeParams(style, colorHex) {
                    const rgb = hexToRgb(colorHex) || [0.8, 0.8, 0.8];
                    let width = 0.5;
                    let dash = '';
                    if (style === 'medium') {
                        width = 1.0;
                    } else if (style === 'thick') {
                        width = 1.8;
                    } else if (style === 'dashed') {
                        width = 0.75;
                        dash = '[3 2] 0 d';
                    } else if (style === 'dotted') {
                        width = 0.75;
                        dash = '[1 1] 0 d';
                    } else if (style === 'double') {
                        width = 2.0;
                    }
                    return { rgb, width, dash };
                }

                /* Column widths */
                let colW;
                if (Array.isArray(o.colWidths) && o.colWidths.length === fields.length) {
                    colW = o.colWidths.slice();
                } else {
                    colW = fields.map(f => Math.max(minCW, tw(String(f), fs) + cp * 6));
                }

                const totalColW = colW.reduce((s, w) => s + w, 0);

                /* Page width */
                let pW;
                if (wide) {
                    pW = totalColW + mg * 2;
                } else {
                    pW = this._bW;
                    const usable = pW - mg * 2;
                    if (totalColW > usable) {
                        const scale = usable / totalColW;
                        colW = colW.map(w => Math.max(8, w * scale));
                    }
                }

                const finalTotalW = colW.reduce((s, w) => s + w, 0);

                /* Page state */
                let pgLines = [];
                let curY    = mg;

                const drawHeader = () => {
                    const y = pH - curY - hh;
                    // Dark header fill
                    pgLines.push(`q 0.118 0.161 0.231 rg ${r3(mg)} ${r3(y)} ${r3(finalTotalW)} ${r3(hh)} re f Q`);
                    let cx = mg + cp;
                    fields.forEach((f, i) => {
                        const cellStyles = cellStylesState[f] || {};
                        const align = cellStyles.align || alignFields[f] || 'l';
                        const line = truncate(String(f), fs, colW[i] - cp * 2);
                        
                        if (showGridlines) {
                            pgLines.push(`q 0.8 0.8 0.8 RG 0.5 w ${r3(cx - cp)} ${r3(y)} ${r3(colW[i])} ${r3(hh)} re s Q`);
                        }

                        // Switch to Bold Font (/F2) for headers, white color
                        pgLines.push(`BT /F2 ${r3(fs)} Tf 1 1 1 rg`);
                        
                        let alignOffset = 0;
                        if (align === 'c') {
                            const cellW = colW[i] - cp * 2;
                            const lineW = tw(line, fs);
                            alignOffset = Math.max(0, (cellW - lineW) / 2);
                        } else if (align === 'r') {
                            const cellW = colW[i] - cp * 2;
                            const lineW = tw(line, fs);
                            alignOffset = Math.max(0, cellW - lineW);
                        }
                        
                        pgLines.push('1 0 0 1 ' + r3(cx + alignOffset) + ' ' + r3(y + cp) + ' Tm ' + ps(line) + ' Tj');
                        pgLines.push('ET');
                        cx += colW[i];
                    });
                };

                const startPage = () => {
                    pgLines = [];
                    curY = mg;
                    drawHeader();
                    curY += hh;
                };

                const flushPage = () => {
                    this._commitPage(pgLines, pW, pH);
                };

                startPage();

                const total = rows.length;
                let   done  = 0;
                const CHUNK = 400;

                const tick = () => {
                    const end = Math.min(done + CHUNK, total);

                    for (let i = done; i < end; i++) {
                        const row = rows[i];

                        /* Render each cell */
                        const cells = fields.map((f, ci) => {
                            let v = row[f] !== undefined && row[f] !== null ? row[f] : '';
                            if (typeof v === 'object') v = JSON.stringify(v);
                            const str = String(v).replace(/[\r\n\t]+/g, ' ');
                            const cw  = Math.max(4, colW[ci] - cp * 2);
                            return wrap ? wrapLines(str, fs, cw) : [truncate(str, fs, cw)];
                        });

                        const maxL = Math.max(1, ...cells.map(c => c.length));
                        const rowH = maxL * lh + cp * 2;

                        /* Page break */
                        if (curY + rowH > pH - mg) {
                            flushPage();
                            startPage();
                        }

                        const y = pH - curY - rowH;

                        /* Zebra row fill */
                        if (o.alternatingRows !== false && i % 2 === 0) {
                            pgLines.push(`q 0.973 0.980 0.992 rg ${r3(mg)} ${r3(y)} ${r3(finalTotalW)} ${r3(rowH)} re f Q`);
                        }

                        /* Cell text rendering */
                        let cx = mg + cp;
                        fields.forEach((f, ci) => {
                            const cellStyles = cellStylesState[f] || {};
                            const isBold = cellStyles.bold || boldFields.includes(f);
                            const isItalic = !!cellStyles.italic;
                            const align = cellStyles.align || alignFields[f] || 'l';
                            const vAlign = cellStyles.vAlign || 't';
                            const cellLeft = cx - cp;
                            const cellW = colW[ci];

                            // Background fill overrides zebra
                            const fillRgb = hexToRgb(cellStyles.fill);
                            if (fillRgb) {
                                pgLines.push(`q ${fillRgb.join(' ')} rg ${r3(cellLeft)} ${r3(y)} ${r3(cellW)} ${r3(rowH)} re f Q`);
                            }

                            // Borders
                            if (cellStyles.border) {
                                const b = cellStyles.border;
                                const { rgb, width, dash } = getStrokeParams(b.style, b.color);
                                pgLines.push(`q ${rgb.join(' ')} RG ${width} w ${dash || ''}`);
                                if (b.left)   pgLines.push(`${r3(cellLeft)} ${r3(y)} m ${r3(cellLeft)} ${r3(y+rowH)} l s`);
                                if (b.right)  pgLines.push(`${r3(cellLeft+cellW)} ${r3(y)} m ${r3(cellLeft+cellW)} ${r3(y+rowH)} l s`);
                                if (b.top)    pgLines.push(`${r3(cellLeft)} ${r3(y+rowH)} m ${r3(cellLeft+cellW)} ${r3(y+rowH)} l s`);
                                if (b.bottom) pgLines.push(`${r3(cellLeft)} ${r3(y)} m ${r3(cellLeft+cellW)} ${r3(y)} l s`);
                                pgLines.push('Q');
                            } else if (showGridlines) {
                                pgLines.push(`q 0.8 0.8 0.8 RG 0.5 w ${r3(cellLeft)} ${r3(y)} ${r3(cellW)} ${r3(rowH)} re s Q`);
                            }

                            // Font toggle: F1=Regular, F2=Bold, F3=Italic, F4=BoldItalic
                            let fontRef = '/F1';
                            if (isBold && isItalic) {
                                fontRef = '/F4';
                            } else if (isBold) {
                                fontRef = '/F2';
                            } else if (isItalic) {
                                fontRef = '/F3';
                            }

                            const txtRgb = hexToRgb(cellStyles.color) || [0.2, 0.255, 0.337];
                            pgLines.push(`BT ${fontRef} ${r3(fs)} Tf ${txtRgb.join(' ')} rg`);
                            
                            const textH = cells[ci].length * lh;
                            let startY = y + rowH - cp;
                            if (vAlign === 'm') {
                                startY = y + rowH - (rowH - textH) / 2;
                            } else if (vAlign === 'b') {
                                startY = y + textH + cp;
                            }

                            cells[ci].forEach((line, li) => {
                                const ty = startY - lh * (li + 1);
                                
                                let alignOffset = 0;
                                if (align === 'c') {
                                    const usableW = cellW - cp * 2;
                                    const lineW = tw(line, fs);
                                    alignOffset = Math.max(0, (usableW - lineW) / 2);
                                } else if (align === 'r') {
                                    const usableW = cellW - cp * 2;
                                    const lineW = tw(line, fs);
                                    alignOffset = Math.max(0, usableW - lineW);
                                }
                                
                                let matrix = '1 0 0 1';
                                let tx = cx + alignOffset;
                                let tyRotated = ty;
                                if (cellStyles.rotation && cellStyles.rotation !== 0) {
                                    const rad = cellStyles.rotation * Math.PI / 180;
                                    const cos = Math.cos(rad);
                                    const sin = Math.sin(rad);
                                    matrix = `${r3(cos)} ${r3(sin)} ${r3(-sin)} ${r3(cos)}`;
                                }

                                pgLines.push(`${matrix} ${r3(tx)} ${r3(tyRotated)} Tm ${ps(line)} Tj`);

                                if (cellStyles.strike) {
                                    const lineY = ty + fs * 0.3;
                                    const lineW = tw(line, fs);
                                    let strikeStartX = cx + alignOffset;
                                    pgLines.push(`q ${txtRgb.join(' ')} RG 0.75 w ${r3(strikeStartX)} ${r3(lineY)} m ${r3(strikeStartX + lineW)} ${r3(lineY)} l s Q`);
                                }
                            });
                            pgLines.push('ET');
                            cx += colW[ci];
                        });

                        curY += rowH;
                    }

                    done = end;
                    if (onProgress) onProgress(
                        Math.floor(done / total * 95),
                        `${done.toLocaleString()} / ${total.toLocaleString()} rows`
                    );

                    if (done < total) {
                        setTimeout(tick, 0);
                    } else {
                        if (pgLines.length) flushPage();
                        resolve();
                    }
                };

                setTimeout(tick, 0);
            });
        }

        /* ═══════════════════════════════════════════════════════════
         * addImagePage — embed one image as a PDF page
         * ═══════════════════════════════════════════════════════════ */
        async addImagePage(img, fitMode = 'fit', quality = 0.92, dpi = 96) {
            const pW = this._bW, pH = this._bH, mg = this.mg;
            const uw = pW - mg * 2, uh = pH - mg * 2;
            const iw = img.naturalWidth  * 72 / dpi;
            const ih = img.naturalHeight * 72 / dpi;
            let dw = iw, dh = ih;
            if (fitMode === 'fit')     { const s = Math.min(uw/iw, uh/ih, 1); dw = iw*s; dh = ih*s; }
            else if (fitMode === 'stretch') { dw = uw; dh = uh; }
            const x = mg + (uw - dw) / 2;
            const y = mg + (uh - dh) / 2;

            /* Render canvas → JPEG bytes */
            const cv  = document.createElement('canvas');
            cv.width  = Math.max(1, Math.round(dw * dpi / 72));
            cv.height = Math.max(1, Math.round(dh * dpi / 72));
            const ctx = cv.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, 0, 0, cv.width, cv.height);

            const b64 = cv.toDataURL('image/jpeg', quality).split(',')[1];
            if (!b64) throw new Error('Canvas encode failed');
            const raw      = atob(b64);
            const jpgBytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) jpgBytes[i] = raw.charCodeAt(i);

            /* Image XObject */
            const xoId = this._oid();
            this._xref.set(xoId, this._off);
            this._w(
                `${xoId} 0 obj\n` +
                `<< /Type /XObject /Subtype /Image\n` +
                `   /Width ${cv.width} /Height ${cv.height}\n` +
                `   /ColorSpace /DeviceRGB /BitsPerComponent 8\n` +
                `   /Filter /DCTDecode /Length ${jpgBytes.byteLength}\n>>\nstream\n`
            );
            this._wb(jpgBytes);
            this._w(`\nendstream\nendobj\n`);

            /* Content stream */
            const content = `q\n${r3(dw)} 0 0 ${r3(dh)} ${r3(x)} ${r3(y)} cm\n/Im${xoId} Do\nQ\n`;
            const sid = this._oid();
            const pid = this._oid();
            const cb  = this._enc.encode(content);
            this._xref.set(sid, this._off);
            this._w(`${sid} 0 obj\n<< /Length ${cb.byteLength} >>\nstream\n`);
            this._wb(cb);
            this._w(`\nendstream\nendobj\n`);

            /* Page object */
            this._xref.set(pid, this._off);
            this._w(
                `${pid} 0 obj\n` +
                `<< /Type /Page /Parent 2 0 R\n` +
                `   /MediaBox [0 0 ${r3(pW)} ${r3(pH)}]\n` +
                `   /Contents ${sid} 0 R\n` +
                `   /Resources << /ProcSet [/PDF /ImageC]\n` +
                `      /XObject << /Im${xoId} ${xoId} 0 R >> >>\n` +
                `>>\nendobj\n`
            );
            this._pids.push(pid);
        }

        /* ═══════════════════════════════════════════════════════════
         * getBlob — finalize and return Blob (zero-copy assembly)
         * ═══════════════════════════════════════════════════════════ */
        getBlob() {
            if (!this._pids.length) {
                this._commitPage([], this._bW, this._bH);
            }

            // Font Helvetica (id = 3)
            this._xref.set(3, this._off);
            this._w(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);

            // Font Helvetica-Bold (id = 4)
            this._xref.set(4, this._off);
            this._w(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

            // Font Helvetica-Oblique (id = 5)
            this._xref.set(5, this._off);
            this._w(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n`);

            // Font Helvetica-BoldOblique (id = 6)
            this._xref.set(6, this._off);
            this._w(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>\nendobj\n`);

            // Pages dictionary (id = 2)
            this._xref.set(2, this._off);
            this._w(`2 0 obj\n<< /Type /Pages /Kids [${this._pids.map(id => `${id} 0 R`).join(' ')}] /Count ${this._pids.length} >>\nendobj\n`);

            // Catalog (id = 1)
            this._xref.set(1, this._off);
            this._w(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

            /* xref table */
            const xrefPos = this._off;
            let maxId = 0;
            this._xref.forEach((_, id) => { if (id > maxId) maxId = id; });

            let xr = `xref\n0 ${maxId + 1}\n`;
            xr += `0000000000 65535 f \n`;
            for (let id = 1; id <= maxId; id++) {
                const off = this._xref.get(id);
                xr += off !== undefined
                    ? String(off).padStart(10, '0') + ' 00000 n \n'
                    : '0000000000 65535 f \n';
            }
            this._w(xr);
            this._w(`trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

            return new Blob(this._parts, { type: 'application/pdf' });
        }

        save(filename) {
            const blob = this.getBlob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = filename || `export_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
        }
    }

    return PDFBuilder;
})();

// Export for Node.js / Deno
if (typeof module !== "undefined" && module.exports) {
    module.exports = PDFBuilder;
}
