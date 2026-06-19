/**
 * xlsx-reader.js — Zero-dependency .xlsx reader adapted for BlueSheet
 */
const XLSXReader = (() => {

    /* ── ZIP decoder ─────────────────────────────────────────────── */

    function u8(buf, pos) { return new Uint8Array(buf, pos, 1)[0]; }
    function u16le(buf, pos) { const v = new Uint8Array(buf, pos, 2); return v[0] | (v[1] << 8); }
    function u32le(buf, pos) { const v = new Uint8Array(buf, pos, 4); return v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24); }

    function readZip(buf) {
        const files = new Map();
        let pos = 0;
        const bytes = new Uint8Array(buf);
        const total = buf.byteLength;

        while (pos + 30 < total) {
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
                files.set(filename, data);
            } else if (method === 8) {
                files.set(filename, data);
                files.set('__deflated__' + filename, true);
            }

            pos = dataStart + compSize;
        }
        return files;
    }

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

    async function getFileText(files, name) {
        const raw = files.get(name);
        if (!raw) return null;
        if (files.get('__deflated__' + name)) return inflateToText(raw);
        return new TextDecoder().decode(raw);
    }

    function parseXML(xmlText) {
        return new DOMParser().parseFromString(xmlText, 'application/xml');
    }

    function attr(el, name) { return el.getAttribute(name) || ''; }

    async function read(arrayBuffer) {
        const files = readZip(arrayBuffer);

        const wbXml = await getFileText(files, 'xl/workbook.xml');
        if (!wbXml) throw new Error('Not a valid .xlsx file (missing workbook.xml)');
        const wbDoc = parseXML(wbXml);
        const sheetEls = wbDoc.getElementsByTagName('sheet');
        const sheetNames = [];
        const sheetRIds = [];
        for (let i = 0; i < sheetEls.length; i++) {
            sheetNames.push(attr(sheetEls[i], 'name'));
            sheetRIds.push(attr(sheetEls[i], 'r:id') || attr(sheetEls[i], 'id'));
        }

        const relsXml = await getFileText(files, 'xl/_rels/workbook.xml.rels');
        const relsDoc = parseXML(relsXml || '<Relationships/>');
        const relEls = relsDoc.getElementsByTagName('Relationship');
        const ridToTarget = new Map();
        for (let i = 0; i < relEls.length; i++) {
            ridToTarget.set(attr(relEls[i], 'Id'), attr(relEls[i], 'Target'));
        }

        const ssXml = await getFileText(files, 'xl/sharedStrings.xml');
        const sharedStrings = ssXml ? parseSharedStrings(ssXml) : [];

        function parseSharedStrings(xml) {
            const doc = parseXML(xml);
            const sis = doc.getElementsByTagName('si');
            const result = [];
            for (let i = 0; i < sis.length; i++) {
                const ts = sis[i].getElementsByTagName('t');
                let text = '';
                for (let j = 0; j < ts.length; j++) {
                    const preserveSpace = ts[j].getAttribute('xml:space') === 'preserve';
                    text += preserveSpace ? ts[j].textContent : ts[j].textContent.trim();
                }
                result.push(text);
            }
            return result;
        }

        async function getSheetCells(nameOrIndex) {
            let idx = typeof nameOrIndex === 'number' ? nameOrIndex : sheetNames.indexOf(nameOrIndex);
            if (idx < 0) idx = 0;
            const rId = sheetRIds[idx];
            let target = ridToTarget.get(rId) || `worksheets/sheet${idx + 1}.xml`;
            if (!target.startsWith('xl/')) target = 'xl/' + target;
            const sheetXml = await getFileText(files, target);
            if (!sheetXml) return {};
            
            const doc = parseXML(sheetXml);
            const rowEls = doc.getElementsByTagName('row');
            const cells = {};
            for (let ri = 0; ri < rowEls.length; ri++) {
                const rowEl = rowEls[ri];
                const cEls = rowEl.getElementsByTagName('c');
                for (let ci = 0; ci < cEls.length; ci++) {
                    const cEl = cEls[ci];
                    const ref = attr(cEl, 'r');
                    const t = attr(cEl, 't');
                    const vEl = cEl.getElementsByTagName('v')[0];
                    let value = '';
                    if (vEl) {
                        const raw = vEl.textContent;
                        if (t === 's') {
                            const sIdx = parseInt(raw, 10);
                            value = sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : raw;
                        } else if (t === 'b') {
                            value = raw === '1' ? 'TRUE' : 'FALSE';
                        } else {
                            value = raw;
                        }
                    }
                    const isEl = cEl.getElementsByTagName('is')[0];
                    if (isEl) {
                        const tEl = isEl.getElementsByTagName('t')[0];
                        if (tEl) value = tEl.textContent;
                    }
                    if (value !== undefined && value !== '') {
                        cells[ref] = value;
                    }
                }
            }
            return cells;
        }

        return { sheetNames, getSheetCells };
    }

    return { read };
})();
