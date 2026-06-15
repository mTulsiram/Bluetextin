/**
 * csv-parser.js — Zero-dependency CSV/TSV parser
 *
 * Handles: quoted fields, escaped quotes (""), newlines inside quotes,
 *          auto-detect delimiter (comma vs tab), header row extraction.
 *
 * API:
 *   CSVParser.parse(text, { delimiter, header, limit }) → { fields, rows }
 *   - fields: string[]          — column names (from header row or col0,col1,…)
 *   - rows:   object[]|string[][] — array of objects (header=true) or arrays
 */
const CSVParser = (() => {
    /**
     * Tokenise one CSV/TSV text into a 2D array of raw strings.
     * Handles RFC-4180 quoting.
     * Supports limit to prevent loading too many rows into memory.
     */
    function tokenise(text, delim, limit = Infinity) {
        const rows = [];
        let row = [];
        let inQuote = false;
        let cell = '';
        let i = 0;
        const n = text.length;

        // If we have a header, we need to parse the header row plus the limit.
        const maxRows = limit === Infinity ? Infinity : limit + 1;

        while (i < n) {
            const ch = text[i];

            if (inQuote) {
                if (ch === '"') {
                    // peek: escaped quote?
                    if (i + 1 < n && text[i + 1] === '"') { cell += '"'; i += 2; continue; }
                    inQuote = false; i++; continue;
                }
                cell += ch; i++;
                continue;
            }

            if (ch === '"') { inQuote = true; i++; continue; }

            if (ch === delim) { row.push(cell); cell = ''; i++; continue; }

            if (ch === '\r') {
                row.push(cell); cell = ''; rows.push(row); row = [];
                if (rows.length >= maxRows) break;
                if (i + 1 < n && text[i + 1] === '\n') i++;
                i++; continue;
            }

            if (ch === '\n') {
                row.push(cell); cell = ''; rows.push(row); row = [];
                if (rows.length >= maxRows) break;
                i++; continue;
            }

            cell += ch; i++;
        }

        // flush last cell / row
        if (rows.length < maxRows && (cell !== '' || row.length > 0)) {
            row.push(cell); rows.push(row);
        }
        // remove trailing blank row
        if (rows.length > 0 && rows[rows.length - 1].every(c => c.trim() === '')) rows.pop();
        return rows;
    }

    /**
     * Auto-detect delimiter from first line.
     * If tab count >= comma count, it's TSV.
     */
    function detectDelimiter(text) {
        const firstLine = text.slice(0, text.indexOf('\n') + 1 || 500);
        const tabs = (firstLine.match(/\t/g) || []).length;
        const commas = (firstLine.match(/,/g) || []).length;
        return tabs >= commas ? '\t' : ',';
    }

    function parse(text, opts = {}) {
        const delim = opts.delimiter || detectDelimiter(text);
        const useHeader = opts.header !== false; // default true
        const limit = opts.limit !== undefined ? opts.limit : Infinity;
        
        const grid = tokenise(text, delim, limit);
        if (grid.length === 0) return { fields: [], rows: [] };

        let fields;
        let dataRows;

        if (useHeader) {
            fields = grid[0].map(f => f.trim());
            dataRows = grid.slice(1);
        } else {
            const colCount = Math.max(...grid.map(r => r.length));
            fields = Array.from({ length: colCount }, (_, i) => `col${i}`);
            dataRows = grid;
        }

        const rows = dataRows.map(r => {
            const obj = {};
            fields.forEach((f, i) => { obj[f] = r[i] !== undefined ? r[i] : ''; });
            return obj;
        });

        return { fields, rows };
    }

    return { parse };
})();

// Export for Node.js / Deno / ES modules if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = CSVParser;
}
