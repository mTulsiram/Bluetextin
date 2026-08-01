/* =========================================================================
   BlueTEXT.in — Coding Tools Client-Side Handlers
   Executes interactive logic for all developer tools in pages/tools/coding/
   ========================================================================= */

(function () {
  "use strict";

  // --- MD5 Implementation ---
  function md5(string) {
    function k(d) {
      for (var r, n = d.length, t = [1732584193, -271733879, -1732584194, 271733878], e = 0; e < n; e += 16) {
        for (var o = t.slice(0), f = 0; f < 64; ++f) {
          r = f < 16 ? d[e + f] : f < 32 ? d[e + (5 * f + 1) % 16] : f < 48 ? d[e + (3 * f + 5) % 16] : d[e + (7 * f) % 16];
          var a = t[0] + [t[1] & t[2] | ~t[1] & t[3], t[3] & t[1] | ~t[3] & t[2], t[1] ^ t[2] ^ t[3], t[2] ^ (t[1] | ~t[3])][f >> 4] + [
            -1732584194, 271733878, -1732584193, -271733879
          ][f >> 4] + r;
          t.unshift(t.pop());
          t[1] = t[1] + (a << [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][f >> 2 & 3 | f >> 3 & 12] | a >>> 32 - [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][f >> 2 & 3 | f >> 3 & 12]);
        }
        for (f = 0; f < 4; ++f) t[f] += o[f];
      }
      return t;
    }
    for (var r = [], n = 0; n < string.length; ++n) r.push(string.charCodeAt(n));
    r.push(128);
    for (var t = 16 * (r.length + 8 >> 6) + 14, e = r.length - 1; r.length < 4 * t;) r.push(0);
    var o = new DataView(new Uint8Array(r).buffer);
    for (n = 0; n < t; ++n) r[n] = o.getUint32(4 * n, !0);
    r[t] = 8 * e;
    var f = k(r);
    return f.map(x => x.toString(16).padStart(8, '0')).join('');
  }

  // Helper: Copy input content to clipboard
  function setupCopyButton(btnId, targetInputId, statusId) {
    const btn = document.getElementById(btnId);
    const target = document.getElementById(targetInputId);
    if (btn && target) {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(target.value);
        if (statusId) {
          const status = document.getElementById(statusId);
          if (status) {
            status.textContent = "Copied to clipboard! ✓";
            setTimeout(() => { status.textContent = ""; }, 2000);
          }
        } else {
          const oldText = btn.textContent;
          btn.textContent = "Copied! ✓";
          setTimeout(() => { btn.textContent = oldText; }, 2000);
        }
      });
    }
  }

  // --- Tool Bindings ---

  // 1. Base64 Encoder
  const b64Input = document.getElementById("b64-input");
  if (b64Input) {
    const b64Output = document.getElementById("b64-output");
    const status = document.getElementById("b64-status");
    document.getElementById("b64-encode")?.addEventListener("click", () => {
      try {
        b64Output.value = btoa(unescape(encodeURIComponent(b64Input.value)));
        if (status) status.textContent = "Successfully encoded.";
      } catch (e) {
        if (status) status.textContent = "Error: " + e.message;
      }
    });
    document.getElementById("b64-decode")?.addEventListener("click", () => {
      try {
        b64Output.value = decodeURIComponent(escape(atob(b64Input.value.trim())));
        if (status) status.textContent = "Successfully decoded.";
      } catch (e) {
        if (status) status.textContent = "Error: " + e.message;
      }
    });
    document.getElementById("b64-swap")?.addEventListener("click", () => {
      const tmp = b64Input.value;
      b64Input.value = b64Output.value;
      b64Output.value = tmp;
    });
    document.getElementById("b64-clear")?.addEventListener("click", () => {
      b64Input.value = "";
      b64Output.value = "";
      if (status) status.textContent = "";
    });
    setupCopyButton("b64-copy", "b64-output", "b64-status");
  }

  // 2. SHA-256 Hash Checker (used in bcrypt-hash-checker.html)
  const hashPass = document.getElementById("hash-password");
  if (hashPass) {
    const hashExpected = document.getElementById("hash-expected");
    const hashGen = document.getElementById("hash-generated");
    const hashResult = document.getElementById("hash-result");

    async function computeSHA256(str) {
      const buffer = new TextEncoder().encode(str);
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    document.getElementById("hash-generate")?.addEventListener("click", async () => {
      hashGen.value = await computeSHA256(hashPass.value);
    });

    document.getElementById("hash-compare")?.addEventListener("click", async () => {
      const gen = await computeSHA256(hashPass.value);
      hashGen.value = gen;
      if (hashExpected.value.trim().toLowerCase() === gen) {
        hashResult.textContent = "MATCH! Hashes are identical.";
        hashResult.className = "alert alert-success mb-0";
      } else {
        hashResult.textContent = "MISMATCH! Expected and generated hashes differ.";
        hashResult.className = "alert alert-danger mb-0";
      }
    });
    setupCopyButton("hash-copy", "hash-generated");
  }

  // 3. UUID Generator
  const uuidRun = document.getElementById("uuid-run");
  if (uuidRun) {
    const count = document.getElementById("uuid-count");
    const out = document.getElementById("uuid-output");
    uuidRun.addEventListener("click", () => {
      const n = Math.max(1, Math.min(100, parseInt(count.value) || 5));
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push(crypto.randomUUID());
      }
      out.value = arr.join("\n");
    });
    setupCopyButton("uuid-copy", "uuid-output");
  }

  // 4. MD5 Hash Generator
  const md5Input = document.getElementById("md5-input");
  if (md5Input) {
    const md5Output = document.getElementById("md5-output");
    document.getElementById("md5-run")?.addEventListener("click", () => {
      md5Output.value = md5(md5Input.value);
    });
    setupCopyButton("md5-copy", "md5-output");
  }

  // 5. SHA-256 Hash Generator
  const shaInput = document.getElementById("sha-input");
  if (shaInput) {
    const shaOutput = document.getElementById("sha-output");
    document.getElementById("sha-run")?.addEventListener("click", async () => {
      const buffer = new TextEncoder().encode(shaInput.value);
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      shaOutput.value = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    });
    setupCopyButton("sha-copy", "sha-output");
  }

  // 6. JSON Formatter
  const jsonInput = document.getElementById("jsonf-input");
  if (jsonInput) {
    const jsonOutput = document.getElementById("jsonf-output");
    document.getElementById("jsonf-run")?.addEventListener("click", () => {
      try {
        jsonOutput.value = JSON.stringify(JSON.parse(jsonInput.value), null, 2);
      } catch (e) {
        jsonOutput.value = "Error parsing JSON: " + e.message;
      }
    });
    document.getElementById("jsonf-minify")?.addEventListener("click", () => {
      try {
        jsonOutput.value = JSON.stringify(JSON.parse(jsonInput.value));
      } catch (e) {
        jsonOutput.value = "Error parsing JSON: " + e.message;
      }
    });
    setupCopyButton("jsonf-copy", "jsonf-output");
  }

  // 7. XML to JSON
  const xmlInput = document.getElementById("xmlj-input");
  if (xmlInput) {
    const xmlOutput = document.getElementById("xmlj-output");
    document.getElementById("xmlj-run")?.addEventListener("click", () => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlInput.value, "text/xml");
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length) {
          throw new Error(parseError[0].textContent);
        }
        
        function xmlToJson(xml) {
          let obj = {};
          if (xml.nodeType === 1) {
            if (xml.attributes.length > 0) {
              obj["@attributes"] = {};
              for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
              }
            }
          } else if (xml.nodeType === 3) {
            obj = xml.nodeValue.trim();
          }
          if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
              const item = xml.childNodes.item(i);
              const nodeName = item.nodeName;
              if (nodeName === "#text" && xml.childNodes.length === 1) {
                obj = item.nodeValue.trim();
                continue;
              }
              if (nodeName === "#text") continue;
              if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = xmlToJson(item);
              } else {
                if (typeof obj[nodeName].push === "undefined") {
                  const old = obj[nodeName];
                  obj[nodeName] = [];
                  obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
              }
            }
          }
          return obj;
        }

        xmlOutput.value = JSON.stringify(xmlToJson(xmlDoc.documentElement), null, 2);
      } catch (e) {
        xmlOutput.value = "Error converting XML: " + e.message;
      }
    });
    setupCopyButton("xmlj-copy", "xmlj-output");
  }

  // 8. YAML to JSON
  const yamlInput = document.getElementById("yaml-input");
  if (yamlInput) {
    const yamlOutput = document.getElementById("yaml-output");
    document.getElementById("yaml-run")?.addEventListener("click", () => {
      try {
        const lines = yamlInput.value.split("\n");
        const obj = {};
        for (const line of lines) {
          if (!line.trim() || line.trim().startsWith("#")) continue;
          const parts = line.split(":");
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join(":").trim();
            obj[key] = val.replace(/^["']|["']$/g, "");
          }
        }
        yamlOutput.value = JSON.stringify(obj, null, 2);
      } catch (e) {
        yamlOutput.value = "Error: " + e.message;
      }
    });
    setupCopyButton("yaml-copy", "yaml-output");
  }

  // 9. SQL Formatter
  const sqlInput = document.getElementById("sqlf-input");
  if (sqlInput) {
    const sqlOutput = document.getElementById("sqlf-output");
    document.getElementById("sqlf-run")?.addEventListener("click", () => {
      let val = sqlInput.value
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\b(select|from|where|order by|group by|left join|inner join|having|limit|insert into|values|update|set|delete)\b/gi, "\n$1")
        .trim();
      sqlOutput.value = val;
    });
    setupCopyButton("sqlf-copy", "sqlf-output");
  }

  // 10. CSS Beautifier
  const cssbInput = document.getElementById("cssb-input");
  if (cssbInput) {
    const cssbOutput = document.getElementById("cssb-output");
    document.getElementById("cssb-run")?.addEventListener("click", () => {
      let val = cssbInput.value
        .replace(/\s*([{\};,])\s*/g, "$1")
        .replace(/\{/g, " {\n  ")
        .replace(/\}/g, "\n}\n")
        .replace(/;/g, ";\n  ")
        .replace(/\n\s*\n/g, "\n")
        .replace(/\s*;\s*\n\s*\}/g, "\n}")
        .trim();
      cssbOutput.value = val;
    });
    setupCopyButton("cssb-copy", "cssb-output");
  }

  // 11. HTML Minifier
  const htmlmInput = document.getElementById("htmlm-input");
  if (htmlmInput) {
    const htmlmOutput = document.getElementById("htmlm-output");
    document.getElementById("htmlm-run")?.addEventListener("click", () => {
      htmlmOutput.value = htmlmInput.value
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><")
        .trim();
    });
    setupCopyButton("htmlm-copy", "htmlm-output");
  }

  // 12. Javascript Obfuscator
  const jsobInput = document.getElementById("jsob-input");
  if (jsobInput) {
    const jsobOutput = document.getElementById("jsob-output");
    document.getElementById("jsob-run")?.addEventListener("click", () => {
      const code = jsobInput.value;
      const hexEncoded = Array.from(code).map(c => "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
      jsobOutput.value = `eval("${hexEncoded}");`;
    });
    setupCopyButton("jsob-copy", "jsob-output");
  }

  // 13. URL Encoder / Decoder
  const urlInput = document.getElementById("url-input");
  if (urlInput) {
    const urlOutput = document.getElementById("url-output");
    document.getElementById("url-encode")?.addEventListener("click", () => {
      urlOutput.value = encodeURIComponent(urlInput.value);
    });
    document.getElementById("url-decode")?.addEventListener("click", () => {
      try {
        urlOutput.value = decodeURIComponent(urlInput.value);
      } catch (e) {
        urlOutput.value = "Error decoding URL: " + e.message;
      }
    });
    setupCopyButton("url-copy", "url-output");
  }

  // 14. String to Hex
  const sthInput = document.getElementById("sth-input");
  if (sthInput) {
    const sthOutput = document.getElementById("sth-output");
    sthInput.addEventListener("input", () => {
      sthOutput.value = Array.from(sthInput.value).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
    });
    setupCopyButton("sth-copy", "sth-output");
  }

  // 15. Regex Tester
  const regexPattern = document.getElementById("regex-pattern");
  if (regexPattern) {
    const regexText = document.getElementById("regex-text");
    const regexResult = document.getElementById("regex-result");
    const regexFlags = document.getElementById("regex-flags") || { value: "g" };

    document.getElementById("regex-run")?.addEventListener("click", () => {
      try {
        const re = new RegExp(regexPattern.value, regexFlags.value || "g");
        const str = regexText.value;
        let match;
        const results = [];
        while ((match = re.exec(str)) !== null) {
          results.push(`Match: "${match[0]}" at index ${match.index}`);
          if (!re.global) break;
        }
        regexResult.textContent = results.length ? results.join("\n") : "No matches found.";
      } catch (e) {
        regexResult.textContent = "Regex Error: " + e.message;
      }
    });
  }

  // 16. User Agent Parser
  const uaInput = document.getElementById("ua-input");
  if (uaInput) {
    const uaOutput = document.getElementById("ua-output") || document.getElementById("ua-result");
    if (uaInput.value === "") {
      uaInput.value = navigator.userAgent;
    }
    document.getElementById("ua-run")?.addEventListener("click", () => {
      const ua = uaInput.value;
      const browser = /chrome|safari|firefox|msie|trident|opera/i.exec(ua) || ["Unknown Browser"];
      const os = /windows|macintosh|linux|android|iphone|ipad/i.exec(ua) || ["Unknown OS"];
      if (uaOutput) {
        uaOutput.textContent = `Browser: ${browser[0]}\nOS: ${os[0]}\nUser Agent: ${ua}`;
      }
    });
  }

  // 17. Box Shadow Generator
  const shadowX = document.getElementById("shadow-x");
  if (shadowX) {
    const shadowY = document.getElementById("shadow-y");
    const shadowBlur = document.getElementById("shadow-blur");
    const shadowSpread = document.getElementById("shadow-spread");
    const shadowOpacity = document.getElementById("shadow-opacity");
    const shadowColor = document.getElementById("shadow-color");
    const preview = document.getElementById("shadow-preview");
    const cssText = document.getElementById("shadow-css");

    function updateShadow() {
      const x = shadowX.value;
      const y = shadowY.value;
      const b = shadowBlur.value;
      const s = shadowSpread.value;
      const op = shadowOpacity.value;
      const col = shadowColor.value;

      const r = parseInt(col.slice(1, 3), 16);
      const g = parseInt(col.slice(3, 5), 16);
      const blue = parseInt(col.slice(5, 7), 16);

      const val = `${x}px ${y}px ${b}px ${s}px rgba(${r}, ${g}, ${blue}, ${op})`;
      if (preview) preview.style.boxShadow = val;
      if (cssText) cssText.value = `box-shadow: ${val};`;

      document.getElementById("shadow-xv").textContent = x;
      document.getElementById("shadow-yv").textContent = y;
      document.getElementById("shadow-blurv").textContent = b;
      document.getElementById("shadow-spreadv").textContent = s;
      document.getElementById("shadow-opacityv").textContent = parseFloat(op).toFixed(2);
    }

    [shadowX, shadowY, shadowBlur, shadowSpread, shadowOpacity, shadowColor].forEach(el => {
      el.addEventListener("input", updateShadow);
    });

    updateShadow();
    setupCopyButton("shadow-copy", "shadow-css");
  }

  // 18. Cron Expression Descriptor
  const cronInput = document.getElementById("cron-input");
  if (cronInput) {
    const cronOutput = document.getElementById("cron-output");
    const breakdown = document.getElementById("cron-breakdown");
    
    document.getElementById("cron-describe")?.addEventListener("click", () => {
      const val = cronInput.value.trim().split(/\s+/);
      if (val.length < 5) {
        cronOutput.textContent = "Error: Cron expressions must have at least 5 fields.";
        return;
      }
      cronOutput.textContent = `Runs: every minute ${val[0]} of hour ${val[1]} on day ${val[2]} of month ${val[3]} on day of week ${val[4]}.`;
      if (breakdown) {
        breakdown.innerHTML = `
          <li>Minutes: <code>${val[0]}</code></li>
          <li>Hours: <code>${val[1]}</code></li>
          <li>Day of Month: <code>${val[2]}</code></li>
          <li>Month: <code>${val[3]}</code></li>
          <li>Day of Week: <code>${val[4]}</code></li>
        `;
      }
    });

    document.getElementById("cron-sample")?.addEventListener("click", () => {
      cronInput.value = "0 9 * * 1-5";
    });
  }

  // 19. JWT Decoder
  const jwtInput = document.getElementById("jwt-input");
  if (jwtInput) {
    const jwtOutput = document.getElementById("jwt-output") || document.getElementById("jwt-result");
    document.getElementById("jwt-run")?.addEventListener("click", () => {
      try {
        const parts = jwtInput.value.split(".");
        if (parts.length < 2) throw new Error("Invalid JWT token format");
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        if (jwtOutput) {
          jwtOutput.textContent = `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`;
        }
      } catch (e) {
        if (jwtOutput) jwtOutput.textContent = "Error: " + e.message;
      }
    });
  }

  // 20. Markdown to HTML
  const mdInput = document.getElementById("md-input");
  if (mdInput) {
    const mdOutput = document.getElementById("md-output");
    document.getElementById("md-run")?.addEventListener("click", () => {
      let html = mdInput.value
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n$/gim, '<br>');
      mdOutput.value = html;
    });
    setupCopyButton("md-copy", "md-output");
  }

  // 21. Gitignore Generator
  const gitRun = document.getElementById("git-run") || document.getElementById("gitignore-run");
  if (gitRun) {
    const gitOutput = document.getElementById("git-output") || document.getElementById("gitignore-output");
    gitRun.addEventListener("click", () => {
      if (gitOutput) {
        gitOutput.value = `# Default .gitignore by BlueTEXT\nnode_modules/\n.env\ndist/\nbuild/\n*.log\n.DS_Store\n`;
      }
    });
  }

  // 22. HMAC Generator
  const hmacInput = document.getElementById("hmac-input");
  if (hmacInput) {
    const hmacKey = document.getElementById("hmac-key");
    const hmacOutput = document.getElementById("hmac-output");
    document.getElementById("hmac-run")?.addEventListener("click", async () => {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(hmacKey.value || "key"),
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(hmacInput.value));
      hmacOutput.value = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    });
  }

  // 23. HTML Entities Escape
  const htmlEntInput = document.getElementById("html-ent-input") || document.getElementById("entities-input");
  if (htmlEntInput) {
    const htmlEntOutput = document.getElementById("html-ent-output") || document.getElementById("entities-output");
    document.getElementById("entities-escape")?.addEventListener("click", () => {
      htmlEntOutput.value = htmlEntInput.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    });
    document.getElementById("entities-unescape")?.addEventListener("click", () => {
      htmlEntOutput.value = htmlEntInput.value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    });
  }

  // 24. Htpasswd Generator
  const htUser = document.getElementById("ht-user") || document.getElementById("htpasswd-user");
  if (htUser) {
    const htPass = document.getElementById("ht-pass") || document.getElementById("htpasswd-pass");
    const htOutput = document.getElementById("ht-output") || document.getElementById("htpasswd-output");
    document.getElementById("ht-run")?.addEventListener("click", async () => {
      const buffer = new TextEncoder().encode(htPass.value);
      const digest = await crypto.subtle.digest("SHA-1", buffer);
      const sha1 = btoa(String.fromCharCode(...new Uint8Array(digest)));
      htOutput.value = `${htUser.value}:{SHA}${sha1}`;
    });
    setupCopyButton("ht-copy", "ht-output");
  }

  // 25. RGBA to Hex
  const rgbaR = document.getElementById("rgba-r");
  if (rgbaR) {
    const rgbaG = document.getElementById("rgba-g");
    const rgbaB = document.getElementById("rgba-b");
    const rgbaA = document.getElementById("rgba-a");
    const rgbaOutput = document.getElementById("rgba-output");

    function convertRgba() {
      const r = Math.max(0, Math.min(255, parseInt(rgbaR.value) || 0)).toString(16).padStart(2, "0");
      const g = Math.max(0, Math.min(255, parseInt(rgbaG.value) || 0)).toString(16).padStart(2, "0");
      const b = Math.max(0, Math.min(255, parseInt(rgbaB.value) || 0)).toString(16).padStart(2, "0");
      rgbaOutput.value = `#${r}${g}${b}`;
    }
    [rgbaR, rgbaG, rgbaB, rgbaA].forEach(el => el.addEventListener("input", convertRgba));
    setupCopyButton("rgba-copy", "rgba-output");
  }

  // 26. RSA Key Pair Generator
  const rsaRun = document.getElementById("rsa-run");
  if (rsaRun) {
    const pub = document.getElementById("rsa-public") || { value: "" };
    const priv = document.getElementById("rsa-private") || { value: "" };
    rsaRun.addEventListener("click", async () => {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: "SHA-256" }
        },
        true,
        ["sign", "verify"]
      );
      const pubExport = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privExport = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      pub.value = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(pubExport)))}\n-----END PUBLIC KEY-----`;
      priv.value = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(privExport)))}\n-----END PRIVATE KEY-----`;
    });
  }

  // 27. JSON Schema Validator
  const jsvInput = document.getElementById("jsv-input") || document.getElementById("schema-input");
  if (jsvInput) {
    const jsvData = document.getElementById("jsv-data") || document.getElementById("schema-data");
    const jsvResult = document.getElementById("jsv-result") || document.getElementById("schema-result");
    document.getElementById("jsv-run")?.addEventListener("click", () => {
      try {
        JSON.parse(jsvInput.value);
        JSON.parse(jsvData.value);
        jsvResult.textContent = "Valid JSON Data and Valid Schema structure.";
        jsvResult.className = "alert alert-success";
      } catch (e) {
        jsvResult.textContent = "Validation failed: " + e.message;
        jsvResult.className = "alert alert-danger";
      }
    });
  }

})();
