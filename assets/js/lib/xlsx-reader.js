/**
 * xlsx-reader.js — Zero-dependency, memory-optimized .xlsx reader
 *
 * This version uses a custom regex-based streaming parser instead of DOMParser
 * and implements streaming decompression to prevent Out of Memory (OOM) errors
 * on large sheet XML files.
 *
 * API:
 *   XLSXReader.read(arrayBuffer) → { sheetNames, getSheet(name|index, limit) }
 *   getSheet(nameOrIndex, limit) → { fields: string[], rows: object[] }
 */
const XLSXReader = (() => {

    /* ── ZIP decoder ─────────────────────────────────────────────── */

    function u8(buf, pos) { return new Uint8Array(buf, pos, 1)[0]; }
    function u16le(buf, pos) { const v = new Uint8Array(buf, pos, 2); return v[0] | (v[1] << 8); }
    function u32le(buf, pos) { const v = new Uint8Array(buf, pos, 4); return v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24); }

    /**
     * Read all ZIP local-file entries from arrayBuffer.
     * Returns Map<filename, Uint8Array> — compressed or stored.
     */
    function readZip(buf) {
        const files = new Map();
        let pos = 0;
        const bytes = new Uint8Array(buf);
        const total = buf.byteLength;

        while (pos + 30 < total) {
            // Local file header signature = 0x04034b50
            if (u32le(buf, pos) !== 0x04034b50) break;

            const method    = u16le(buf, pos + 8);
            const compSize  = u32le(buf, pos + 18);
            const fnLen     = u16le(buf, pos + 26);
            const extraLen  = u16le(buf, pos + 28);
            const fnBytes   = bytes.slice(pos + 30, pos + 30 + fnLen);
            const filename  = new TextDecoder().decode(fnBytes);
            const dataStart = pos + 30 + fnLen + extraLen;
            const data      = bytes.slice(dataStart, dataStart + compSize);

            if (method === 0) {
                // STORE — raw bytes
                files.set(filename, data);
            } else if (method === 8) {
                // DEFLATE
                files.set(filename, data);
                files.set('__deflated__' + filename, true);
            }

            pos = dataStart + compSize;
        }
        return files;
    }

    /**
     * Decompress a DEFLATE-compressed Uint8Array fully.
     */
    async function inflateToText(bytes) {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const chunks = [];
        const reader = ds.readable.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        const total = chunks.reduce((s, c) => s + c.length, 0);
        const out = new Uint8Array(total);
        let offset = 0;
        chunks.forEach(c => { out.set(c, offset); offset += c.length; });
        return new TextDecoder().decode(out);
    }

    /**
     * Streaming decompression to stop early once we have reached the row limit.
     * Prevents decompressing hundreds of megabytes if only 1,000 rows are needed.
     */
    async function inflateSheetToText(bytes, limit = Infinity) {
        if (limit === Infinity) {
            return inflateToText(bytes);
        }

        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();

        const reader = ds.readable.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let rowCount = 0;
        const targetRowCount = limit + 1; // Limit + 1 for header

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunkText = decoder.decode(value, { stream: true });
                accumulatedText += chunkText;

                // Count row tag occurrences in the newly decompressed text block
                let pos = 0;
                while ((pos = chunkText.indexOf('</row>', pos)) !== -1) {
                    rowCount++;
                    pos += 6;
                }

                if (rowCount >= targetRowCount) {
                    // Stop decompression early
                    await reader.cancel();
                    break;
                }
            }
        } catch (e) {
            // reader.cancel() may abort writer which throws in catch, which we ignore
        }

        return accumulatedText;
    }

    async function getFileText(files, name) {
        const raw = files.get(name);
        if (!raw) return null;
        if (files.get('__deflated__' + name)) return inflateToText(raw);
        return new TextDecoder().decode(raw);
    }

    /* ── Fast XML Entity Decoder ── */
    function decodeXmlEntities(str) {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    }

    /* ── XLSX parser ─────────────────────────────────────────────── */

    function colLetterToIdx(letter) {
        let col = 0;
        for (let i = 0; i < letter.length; i++) {
            col = col * 26 + (letter.charCodeAt(i) - 64);
        }
        return col - 1;
    }

    /**
     * Parse sharedStrings.xml using fast regex streaming (no DOMParser)
     */
    function parseSharedStrings(xmlText) {
        if (!xmlText) return [];
        const result = [];
        const siRegex = /<si>([\s\S]*?)<\/si>/g;
        let siMatch;
        while ((siMatch = siRegex.exec(xmlText)) !== null) {
            const siContent = siMatch[1];
            const tRegex = /<t[^>]*>([^<]*)<\/t>/g;
            let tMatch;
            let text = '';
            while ((tMatch = tRegex.exec(siContent)) !== null) {
                text += tMatch[1];
            }
            result.push(decodeXmlEntities(text));
        }
        return result;
    }

    /**
     * Parse sheet.xml using fast regex streaming (no DOMParser)
     * Supports early termination using the limit parameter.
     */
    function parseSheet(xmlText, sharedStrings, limit = Infinity) {
        const rawRows = new Map();
        let maxCol = 0;

        // Match each row element: <row r="N" ...>...</row>
        const rowRegex = /<row\s+([^>]+)>([\s\S]*?)<\/row>/g;
        let rowMatch;
        const maxRows = limit === Infinity ? Infinity : limit + 1; // limit + header row

        while ((rowMatch = rowRegex.exec(xmlText)) !== null) {
            const rowAttrs = rowMatch[1];
            const rowContent = rowMatch[2];

            // Get row number r="N"
            const rMatch = /r="(\d+)"/.exec(rowAttrs);
            if (!rMatch) continue;
            const rowIdx = parseInt(rMatch[1], 10) - 1;

            const colMap = new Map();

            // Match each cell: <c r="A1" ...>...</c> or self-closing <c r="A1" .../>
            const cellRegex = /<c\s+([^>]+?)(?:\/>|>([\s\S]*?)<\/c>)/g;
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                const cellAttrs = cellMatch[1];
                const cellContent = cellMatch[2] || '';

                // Get cell column reference r="A1"
                const refMatch = /r="([A-Z]+)(\d+)"/.exec(cellAttrs);
                if (!refMatch) continue;
                const colLetter = refMatch[1];
                const col = colLetterToIdx(colLetter);

                // Get type t="s"
                const tMatch = /t="([^"]+)"/.exec(cellAttrs);
                const t = tMatch ? tMatch[1] : '';

                let value = '';

                // Try to get value from <v> or inline string <is><t>
                const vMatch = /<v>([^<]*)<\/v>/.exec(cellContent);
                if (vMatch) {
                    const raw = vMatch[1];
                    if (t === 's') {
                        const idx = parseInt(raw, 10);
                        value = sharedStrings[idx] !== undefined ? sharedStrings[idx] : raw;
                    } else if (t === 'b') {
                        value = raw === '1' ? 'TRUE' : 'FALSE';
                    } else {
                        value = raw;
                    }
                } else {
                    const isMatch = /<is>\s*<t>([^<]*)<\/t>/.exec(cellContent);
                    if (isMatch) {
                        value = isMatch[1];
                    }
                }

                if (value && typeof value === 'string') {
                    value = decodeXmlEntities(value);
                }

                colMap.set(col, value);
                if (col > maxCol) maxCol = col;
            }

            rawRows.set(rowIdx, colMap);
            if (rawRows.size >= maxRows) {
                break;
            }
        }

        if (rawRows.size === 0) return { fields: [], rows: [] };

        const sortedRowKeys = Array.from(rawRows.keys()).sort((a, b) => a - b);
        const headerRowIdx = sortedRowKeys[0];
        const headerMap = rawRows.get(headerRowIdx);

        // Build fields
        const fields = [];
        for (let c = 0; c <= maxCol; c++) {
            const val = headerMap.get(c);
            fields.push(val !== undefined && val !== '' ? val : `col${c}`);
        }

        // Build rows
        const rows = [];
        for (let k = 1; k < sortedRowKeys.length; k++) {
            const rowIdx = sortedRowKeys[k];
            const colMap = rawRows.get(rowIdx);
            const obj = {};
            fields.forEach((f, c) => {
                obj[f] = colMap.has(c) ? colMap.get(c) : '';
            });
            rows.push(obj);
        }

        return { fields, rows };
    }

    /* ── Public API ──────────────────────────────────────────────── */

    async function read(arrayBuffer) {
        const files = readZip(arrayBuffer);

        // Read workbook.xml to get sheet names
        const wbXml = await getFileText(files, 'xl/workbook.xml');
        if (!wbXml) throw new Error('Not a valid .xlsx file (missing workbook.xml)');
        
        const sheetNames = [];
        const sheetRIds = [];
        
        // Extract sheet tags using regex
        const sheetRegex = /<sheet\s+([^>]+)>/g;
        let sheetMatch;
        while ((sheetMatch = sheetRegex.exec(wbXml)) !== null) {
            const attrs = sheetMatch[1];
            const nameMatch = /name="([^"]+)"/.exec(attrs);
            const rIdMatch = /r:id="([^"]+)"/.exec(attrs) || /id="([^"]+)"/.exec(attrs);
            if (nameMatch && rIdMatch) {
                sheetNames.push(nameMatch[1]);
                sheetRIds.push(rIdMatch[1]);
            }
        }

        // Read workbook.xml.rels relationships
        const relsXml = await getFileText(files, 'xl/_rels/workbook.xml.rels');
        const ridToTarget = new Map();
        if (relsXml) {
            const relRegex = /<Relationship\s+([^>]+)>/g;
            let relMatch;
            while ((relMatch = relRegex.exec(relsXml)) !== null) {
                const attrs = relMatch[1];
                const idMatch = /Id="([^"]+)"/.exec(attrs);
                const targetMatch = /Target="([^"]+)"/.exec(attrs);
                if (idMatch && targetMatch) {
                    ridToTarget.set(idMatch[1], targetMatch[1]);
                }
            }
        }

        // Shared strings
        const ssXml = await getFileText(files, 'xl/sharedStrings.xml');
        const sharedStrings = ssXml ? parseSharedStrings(ssXml) : [];

        // Lazy sheet reader
        async function getSheet(nameOrIndex, limit = Infinity) {
            let idx = typeof nameOrIndex === 'number' ? nameOrIndex : sheetNames.indexOf(nameOrIndex);
            if (idx < 0) idx = 0;
            const rId = sheetRIds[idx];
            let target = ridToTarget.get(rId) || `worksheets/sheet${idx + 1}.xml`;
            if (!target.startsWith('xl/')) target = 'xl/' + target;
            
            const raw = files.get(target);
            if (!raw) return { fields: [], rows: [] };
            
            let sheetXml;
            if (files.get('__deflated__' + target)) {
                sheetXml = await inflateSheetToText(raw, limit);
            } else {
                sheetXml = new TextDecoder().decode(raw);
            }
            
            return parseSheet(sheetXml, sharedStrings, limit);
        }

        return { sheetNames, getSheet };
    }

    return { read };
})();

// Export for Node.js / Deno / ES modules if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = XLSXReader;
}
