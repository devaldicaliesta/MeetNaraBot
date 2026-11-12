/*! Nara widget v2: <tanyasaya-chat> web component (shadow DOM, no dependencies). */
(function () {
  "use strict";

  // Where this script was loaded from → default API base and stylesheet location.
  var SCRIPT = document.currentScript;
  var SCRIPT_ORIGIN = (function () {
    try { return new URL(SCRIPT && SCRIPT.src ? SCRIPT.src : location.href).origin; } catch (e) { return ""; }
  })();

  var STR = {
    id: {
      loading: "Memuat…", newChat: "Mulai percakapan baru", close: "Tutup chat", closeShort: "Tutup",
      askLabel: "Tulis pertanyaan", placeholder: "Tulis pertanyaanmu…", send: "Kirim pertanyaan",
      note: "Jawaban disusun dari dokumen dan bisa keliru. Cek sumbernya.", launcher: "Tanya dokumen",
      copied: "Tersalin", copyFailed: "Gagal menyalin", copy: "Salin", offline: "Tidak bisa terhubung ke server", cite: "Lihat sumber ",
      sources: "Sumber dari dokumen", preparing: "Menyiapkan asisten…", tryAsking: "Coba tanyakan", retry: "Coba lagi",
      typing: "Sedang menyusun jawaban", noResponse: "Server tidak merespons ({n}).",
      network: "Koneksi terputus. Periksa internetmu lalu coba lagi.", switchTo: "Switch to English", langBtn: "EN"
    },
    en: {
      loading: "Loading…", newChat: "Start a new conversation", close: "Close chat", closeShort: "Close",
      askLabel: "Type a question", placeholder: "Type your question…", send: "Send question",
      note: "Answers come from the document and can be wrong. Check the sources.", launcher: "Ask the document",
      copied: "Copied", copyFailed: "Couldn't copy", copy: "Copy", offline: "Can't reach the server", cite: "Show source ",
      sources: "Sources from the document", preparing: "Getting the assistant ready…", tryAsking: "Try asking", retry: "Try again",
      typing: "Composing an answer", noResponse: "The server didn't respond ({n}).",
      network: "Connection lost. Check your internet, then try again.", switchTo: "Ganti ke Bahasa Indonesia", langBtn: "ID"
    }
  };
  var CITE_LABEL = STR.id.cite;

  var ICONS = {
    chat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 11h7M8.5 14.5h4"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    retry: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var FILE_NAME = /\.(md|markdown|txt|csv|json|html?|pdf|docx?)$/i;
  /** "Section › Subsection" for a source. File names (the document, or a heading that is a file name) are never shown. */
  function shortLabel(s) {
    var parts = String(s.label || "").split(" › ").filter(function (p) {
      p = p.trim();
      return p && p !== s.document && !FILE_NAME.test(p);
    });
    return parts.slice(-2).join(" › ");
  }

  /** Picks white or near-black text for a given hex background (WCAG relative luminance). */
  function inkFor(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#ffffff";
    var n = parseInt(m[1], 16);
    var lin = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    return (1.05 / (L + 0.05)) >= 4.5 ? "#ffffff" : "#14202b";
  }

  /* ---------- Tiny, safe markdown renderer (escape first, then format) ---------- */
  function inline(text, sourceCount) {
    var codes = [];
    var html = esc(text).replace(/`([^`]+)`/g, function (_, c) { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>")
      .replace(/\s?\[(\d{1,2})\]/g, function (m, n) {
        var i = Number(n);
        if (!sourceCount || i < 1 || i > sourceCount) return "";
        return '<button type="button" class="cite" data-cite="' + i + '" aria-label="' + CITE_LABEL + i + '" aria-expanded="false">' + i + "</button>";
      });
    return html.replace(/\u0000(\d+)\u0000/g, function (_, i) { return "<code>" + codes[Number(i)] + "</code>"; });
  }

  function markdown(text, sourceCount) {
    var out = "", para = [], list = null;
    function flush() { if (para.length) { out += "<p>" + para.join("<br>") + "</p>"; para = []; } }
    function close() { if (list) { out += "</" + list + ">"; list = null; } }
    String(text).replace(/\r/g, "").split("\n").forEach(function (line) {
      var ol = /^\s*(\d+)[.)]\s+(.*)$/.exec(line);
      var ul = /^\s*[-*•]\s+(.*)$/.exec(line);
      var h = /^\s*#{1,6}\s+(.*)$/.exec(line);
      if (ol || ul) {
        flush();
        var type = ol ? "ol" : "ul";
        if (list !== type) { close(); out += ol ? '<ol start="' + Number(ol[1]) + '">' : "<ul>"; list = type; }
        out += "<li>" + inline(ol ? ol[2] : ul[1], sourceCount) + "</li>";
      } else if (h) {
        flush(); close(); out += "<h4>" + inline(h[1], sourceCount) + "</h4>";
      } else if (!line.trim()) {
        flush(); close();
      } else {
        close(); para.push(inline(line.trim(), sourceCount));
      }
    });
    flush(); close();
    return out;
  }

  /* ---------- Component ---------- */
  class TanyaSayaChat extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.base = (this.getAttribute("api-base") || SCRIPT_ORIGIN || "").replace(/\/$/, "");
      // Which bot to talk to (multi-user platform). Without the attribute: the platform's own bot.
      // mode="inline": fills its container (full-page/iframe use), always open, no launcher or close.
      this.inline = this.getAttribute("mode") === "inline";
      this.bot = String(this.getAttribute("bot") || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 32);
      this.q = this.bot ? "bot=" + this.bot + "&" : "";
      this.storeKey = "tanyasaya:" + this.base + (this.bot ? ":" + this.bot : "");
      this.lang = this.pickLang();
      this.info = null;
      this.busy = false;
      this.history = this.load();
      this.root = this.attachShadow({ mode: "open" });
      this.style.visibility = "hidden"; // avoid a flash of unstyled markup

      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = (this.getAttribute("css") || this.base + "/widget.css");
      var self = this;
      link.onload = link.onerror = function () { self.style.visibility = ""; };
      this.root.appendChild(link);
      this.applyTheme();
      this.render();
      this.fetchInfo();
      window.addEventListener("tanyasaya:refresh", function () { self.fetchInfo(true); });
    }

    /** Saved choice → explicit lang attribute → browser language → Indonesian. */
    pickLang() {
      try { var saved = localStorage.getItem("tanyasaya:lang"); if (saved === "id" || saved === "en") return saved; } catch (e) {}
      var attr = (this.getAttribute("lang") || "auto").toLowerCase();
      if (attr === "id" || attr === "en") return attr;
      var nav = (navigator.language || "").toLowerCase();
      if (/^(id|ms)/.test(nav)) return "id";
      if (/^en/.test(nav)) return "en";
      return "id";
    }

    t(key, vars) {
      var str = (STR[this.lang] || STR.id)[key] || key;
      return vars ? str.replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; }) : str;
    }

    /** Re-labels every static string in the shell for the current language. */
    applyLang() {
      var t = this.t.bind(this), $ = this.$;
      CITE_LABEL = t("cite");
      this.setAttribute("lang", this.lang);
      $(".reset").setAttribute("aria-label", t("newChat")); $(".reset").title = t("newChat");
      $(".close").setAttribute("aria-label", t("close")); $(".close").title = t("closeShort");
      this.el.input.setAttribute("aria-label", t("askLabel")); this.el.input.placeholder = t("placeholder");
      this.el.send.setAttribute("aria-label", t("send"));
      $(".note").textContent = t("note");
      var lb = $(".lang");
      lb.textContent = t("langBtn"); lb.setAttribute("aria-label", t("switchTo")); lb.title = t("switchTo");
      if (!this.info) { this.el.sub.textContent = t("loading"); $(".launcher-label").textContent = t("launcher"); }
    }

    setLang(lang) {
      if (lang === this.lang) return;
      this.lang = lang;
      try { localStorage.setItem("tanyasaya:lang", lang); } catch (e) {}
      this.applyLang();
      this.fetchInfo(false);
      window.dispatchEvent(new CustomEvent("tanyasaya:lang", { detail: lang }));
    }

    applyTheme() {
      var t = this.getAttribute("theme") || "light";
      var dark = t === "dark" || (t === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      this.setAttribute("data-theme", dark ? "dark" : "light");
    }

    load() {
      try { var v = JSON.parse(sessionStorage.getItem(this.storeKey) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
    }
    save() {
      this.history = this.history.slice(-40);
      try { sessionStorage.setItem(this.storeKey, JSON.stringify(this.history)); } catch (e) {}
    }

    render() {
      var wrap = document.createElement("div");
      wrap.innerHTML =
        '<section class="panel" role="dialog" aria-modal="false" aria-labelledby="ts-title">' +
          '<header class="head">' +
            '<div class="avatar" aria-hidden="true">N</div>' +
            '<div class="title"><strong id="ts-title">Nara</strong><span class="sub"></span></div>' +
            '<button type="button" class="icon-btn lang"></button>' +
            '<button type="button" class="icon-btn reset">' + ICONS.reset + "</button>" +
            '<button type="button" class="icon-btn close">' + ICONS.close + "</button>" +
          "</header>" +
          '<div class="log" aria-live="polite" aria-relevant="additions"></div>' +
          '<form class="compose" autocomplete="off">' +
            '<div class="field">' +
              '<textarea rows="1"></textarea>' +
              '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
              '<button type="submit" class="send" disabled>' + ICONS.send + "</button>" +
            "</div>" +
            '<div class="foot"><span class="note"></span><span class="count"></span></div>' +
          "</form>" +
        "</section>" +
        '<button type="button" class="launcher" aria-expanded="false"><span class="launcher-mark" aria-hidden="true">' + ICONS.chat + '</span><span class="launcher-label"></span></button>';
      while (wrap.firstChild) this.root.appendChild(wrap.firstChild);

      var $ = this.$ = function (s) { return this.root.querySelector(s); }.bind(this);
      this.el = {
        panel: $(".panel"), log: $(".log"), input: $("textarea"), send: $(".send"), hp: $(".hp"),
        launcher: $(".launcher"), count: $(".count"), title: $("#ts-title"), sub: $(".sub"), avatar: $(".avatar")
      };
      var self = this, el = this.el;
      this.applyLang();
      $(".lang").addEventListener("click", function () { if (!self.busy) self.setLang(self.lang === "id" ? "en" : "id"); });

      el.launcher.addEventListener("click", function () { self.setOpen(true); });
      $(".close").addEventListener("click", function () { if (!self.inline) { self.setOpen(false); el.launcher.focus(); } });
      $(".reset").addEventListener("click", function () { if (!self.busy) { self.history = []; self.save(); self.paintAll(); el.input.focus(); } });
      $("form").addEventListener("submit", function (e) { e.preventDefault(); self.ask(el.input.value); });
      el.input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); self.ask(el.input.value); }
      });
      el.input.addEventListener("input", function () { self.syncInput(); });
      this.root.addEventListener("keydown", function (e) { if (e.key === "Escape" && !self.inline) { self.setOpen(false); el.launcher.focus(); } });

      // Delegated clicks: suggestions, citations, sources, tools.
      el.log.addEventListener("click", function (e) {
        var t = e.target.closest("button");
        if (!t) return;
        if (t.classList.contains("chip")) return self.ask(t.textContent);
        if (t.dataset.cite) return self.focusSource(t.closest(".msg"), Number(t.dataset.cite));
        if (t.classList.contains("source")) return t.classList.toggle("is-active");
        if (t.dataset.action === "copy") {
          var txt = t.closest(".msg").dataset.raw || "";
          // Say "copied" only once the browser confirms it; a denied clipboard gets its own message.
          var done = function (ok) {
            t.lastChild.textContent = self.t(ok ? "copied" : "copyFailed");
            setTimeout(function () { t.lastChild.textContent = self.t("copy"); }, 1400);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt.replace(/\s?\[\d+\]/g, "")).then(function () { done(true); }, function () { done(false); });
          } else done(false);
        }
        if (t.dataset.action === "reload-info") { self.el.sub.textContent = self.t("loading"); return self.fetchInfo(); }
        if (t.dataset.action === "retry") {
          var last = self.history.filter(function (h) { return h.role === "user"; }).pop();
          self.history = self.history.filter(function (h) { return h.role !== "error"; });
          if (last) { self.history.pop(); self.save(); self.paintAll(); self.ask(last.text); }
        }
      });

      this.paintAll();
      if (this.inline) {
        el.panel.setAttribute("role", "region");
        el.panel.removeAttribute("aria-modal");
        this.setOpen(true);
        return;
      }
      try { if (sessionStorage.getItem(this.storeKey + ":open") === "1") this.setOpen(true); } catch (e) {}
    }

    fetchInfo(resetChat) {
      var self = this;
      fetch(this.base + "/api/public/info?" + this.q + "lang=" + this.lang, { credentials: "omit" })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (info) {
          self.info = info;
          var accent = info.themeColor || "#5b3fe0";
          self.style.setProperty("--ts-accent", accent);
          self.style.setProperty("--ts-accent-ink", inkFor(accent));
          self.el.title.textContent = info.name;
          self.el.avatar.textContent = (info.name || "T").trim().charAt(0).toUpperCase();
          self.el.sub.textContent = info.subtitle || "";
          self.root.querySelector(".launcher-label").textContent = info.launcherLabel || self.t("launcher");
          self.el.input.maxLength = info.maxQuestionLength || 500;
          if (resetChat) { self.history = []; self.save(); }
          self.paintAll();
          self.syncInput();
        })
        .catch(function () {
          self.el.sub.textContent = self.t("offline");
          if (self.info) return;
          // Say what went wrong and offer the next step instead of "getting ready" forever.
          var greet = self.el.log.querySelector(".msg.bot .bubble");
          if (greet) greet.innerHTML = "<p>" + esc(self.t("network")) + '</p><div class="msg-tools"><button type="button" class="tool" data-action="reload-info">' + ICONS.retry + "<span>" + esc(self.t("retry")) + "</span></button></div>";
        });
    }

    setOpen(open) {
      this.classList.toggle("open", open);
      this.el.launcher.setAttribute("aria-expanded", String(open));
      try { sessionStorage.setItem(this.storeKey + ":open", open ? "1" : "0"); } catch (e) {}
      if (open) {
        this.scroll(false);
        var input = this.el.input;
        if (window.matchMedia && matchMedia("(pointer: fine)").matches) setTimeout(function () { input.focus({ preventScroll: true }); }, 200);
      }
    }

    syncInput() {
      var el = this.el, max = (this.info && this.info.maxQuestionLength) || 500, len = el.input.value.length;
      el.input.style.height = "auto";
      el.input.style.height = Math.min(el.input.scrollHeight, 120) + "px";
      el.send.disabled = this.busy || !el.input.value.trim() || (this.info && !this.info.ready);
      el.count.textContent = len > max * 0.8 ? len + "/" + max : "";
      el.count.classList.toggle("warn", len >= max);
    }

    scroll(smooth) {
      var log = this.el.log;
      if (smooth === false) log.style.scrollBehavior = "auto";
      log.scrollTop = log.scrollHeight;
      log.style.scrollBehavior = "";
    }

    bubble(role) {
      var msg = document.createElement("div");
      msg.className = "msg " + role;
      var b = document.createElement("div");
      b.className = "bubble";
      msg.appendChild(b);
      this.el.log.appendChild(msg);
      return { msg: msg, bubble: b };
    }

    paintBot(view, text, sources, final, refused) {
      sources = sources || [];
      view.msg.dataset.raw = text;
      var maxNum = sources.reduce(function (m, s) { return Math.max(m, Number(s.number) || 0); }, 0);
      var html = markdown(text, maxNum);
      if (final && sources.length && !refused) {
        var cited = {};
        text.replace(/\[(\d{1,2})\]/g, function (_, n) { cited[n] = true; });
        var list = sources.filter(function (s) { return cited[s.number]; });
        if (!list.length) list = sources.slice(0, 3);
        html += '<div class="sources"><div class="sources-label">' + this.t("sources") + "</div>" + list.map(function (s) {
          return '<button type="button" class="source" data-num="' + (Number(s.number) || 0) + '">' +
            '<span class="source-head"><span class="source-num">' + (Number(s.number) || 0) + '</span><span class="source-label" title="' + esc(shortLabel(s)) + '">' + esc(shortLabel(s)) + "</span></span>" +
            '<span class="source-snippet">' + esc(s.snippet) + "…</span></button>";
        }).join("") + "</div>";
      }
      if (final && text) html += '<div class="msg-tools"><button type="button" class="tool" data-action="copy">' + ICONS.copy + "<span>" + this.t("copy") + "</span></button></div>";
      view.bubble.innerHTML = html;
      if (!final) {
        var blocks = view.bubble.querySelectorAll("p, li");
        var target = blocks.length ? blocks[blocks.length - 1] : view.bubble;
        var caret = document.createElement("span");
        caret.className = "caret";
        target.appendChild(caret);
      }
    }

    focusSource(msg, n) {
      if (!msg) return;
      var src = msg.querySelector('.source[data-num="' + n + '"]');
      msg.querySelectorAll(".cite").forEach(function (c) { c.setAttribute("aria-expanded", String(Number(c.dataset.cite) === n)); });
      if (src) {
        msg.querySelectorAll(".source").forEach(function (s) { s.classList.toggle("is-active", s === src); });
        src.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    paintAll() {
      var self = this, log = this.el.log, info = this.info;
      log.innerHTML = "";
      var greet = this.bubble("bot");
      this.paintBot(greet, info ? info.greeting : this.t("preparing"), [], true);
      greet.msg.querySelector(".msg-tools") && greet.msg.querySelector(".msg-tools").remove();

      var asked = this.history.some(function (h) { return h.role === "user"; });
      if (info && info.ready && !asked && info.suggestions && info.suggestions.length) {
        var box = document.createElement("div");
        box.className = "suggest";
        box.innerHTML = '<div class="suggest-label">' + this.t("tryAsking") + "</div>" + info.suggestions.map(function (s) {
          return '<button type="button" class="chip">' + esc(s) + "</button>";
        }).join("");
        log.appendChild(box);
      }
      this.history.forEach(function (h) {
        if (h.role === "user") self.bubble("user").bubble.textContent = h.text;
        else if (h.role === "bot") self.paintBot(self.bubble("bot"), h.text, h.sources, true, h.refused);
        else if (h.role === "error") self.paintError(h.text);
      });
      this.scroll(false);
    }

    paintError(text) {
      var v = this.bubble("bot error");
      v.bubble.innerHTML = "<p>" + esc(text) + '</p><div class="msg-tools"><button type="button" class="tool" data-action="retry">' + ICONS.retry + "<span>" + this.t("retry") + "</span></button></div>";
    }

    async ask(question) {
      question = String(question || "").trim();
      var el = this.el, self = this;
      if (this.busy || !question) return;
      var max = (this.info && this.info.maxQuestionLength) || 500;
      if (question.length > max) question = question.slice(0, max);

      var keep = (this.info && this.info.maxHistory) || 6;
      var prior = this.history
        .filter(function (h) { return h.role === "user" || h.role === "bot"; })
        .slice(-keep)
        .map(function (h) { return h.role === "bot" ? { role: "assistant", content: h.text, sig: h.sig || "" } : { role: "user", content: h.text }; });

      var sug = el.log.querySelector(".suggest");
      if (sug) sug.remove();
      this.history.push({ role: "user", text: question });
      this.save();
      this.bubble("user").bubble.textContent = question;
      el.input.value = "";
      this.busy = true;
      this.syncInput();

      var view = this.bubble("bot");
      view.bubble.innerHTML = '<span class="typing" aria-label="' + this.t("typing") + '"><i></i><i></i><i></i></span>';
      this.scroll();

      var answer = "", sources = [], refused = false, failure = null, frame = 0, sig = "";
      function paint() {
        frame = 0;
        var log = el.log, stick = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
        self.paintBot(view, answer, sources, false);
        if (stick) self.scroll(false);
      }

      try {
        var res = await fetch(this.base + "/api/public/chat?" + this.q + "lang=" + this.lang, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
          body: JSON.stringify({ question: question, history: prior, website: el.hp.value, lang: this.lang })
        });
        if (!res.ok && !(res.headers.get("content-type") || "").includes("ndjson")) {
          var err = await res.json().catch(function () { return {}; });
          failure = err.error || this.t("noResponse", { n: res.status });
        } else {
          var reader = res.body.getReader(), dec = new TextDecoder(), buf = "";
          var handle = function (line) {
            if (!line.trim()) return;
            var ev; try { ev = JSON.parse(line); } catch (e) { return; }
            if (ev.type === "sources") sources = ev.items || [];
            else if (ev.type === "delta") { answer += ev.text || ""; if (!frame) frame = requestAnimationFrame(paint); }
            else if (ev.type === "done") { refused = !!ev.refused; sig = ev.sig || ""; if (typeof ev.text === "string") { answer = ev.text; if (!frame) frame = requestAnimationFrame(paint); } }
            else if (ev.type === "error") failure = ev.message;
          };
          while (true) {
            var chunk = await reader.read();
            if (chunk.done) break;
            buf += dec.decode(chunk.value, { stream: true });
            var lines = buf.split("\n");
            buf = lines.pop();
            lines.forEach(handle);
          }
          handle(buf + dec.decode());
        }
      } catch (e) {
        failure = this.t("network");
      }

      if (frame) cancelAnimationFrame(frame);
      if (answer) {
        this.paintBot(view, answer, sources, true, refused);
        var cited = {};
        answer.replace(/\[(\d{1,2})\]/g, function (_, n) { cited[n] = true; });
        this.history.push({ role: "bot", text: answer, sig: sig, refused: refused, sources: sources.filter(function (s) { return cited[s.number]; }) });
      } else {
        view.msg.remove();
      }
      if (failure) {
        this.history.push({ role: "error", text: failure });
        this.paintError(failure);
      }
      this.save();
      this.busy = false;
      this.syncInput();
      this.scroll();
    }
  }

  if (!customElements.get("tanyasaya-chat")) customElements.define("tanyasaya-chat", TanyaSayaChat);
  // v1 tag name keeps working for sites that already embedded the old snippet.
  if (!customElements.get("rag-chat-widget")) customElements.define("rag-chat-widget", class extends TanyaSayaChat {});
})();
