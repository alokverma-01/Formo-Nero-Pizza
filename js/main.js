/* =============================================================
   Forno Nero — site behaviour
   Cart + WhatsApp ordering, menu, offers, gallery, video, maps.
   No dependencies.
   ============================================================= */
(function () {
  "use strict";

  var S = window.SITE || {};
  var D = window.DATA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var lowData = !!(conn.saveData || /(^|-)2g/.test(conn.effectiveType || ""));
  var canAutoVideo = !reduceMotion && !lowData;

  /* ---------- Helpers ---------- */
  function money(n) { return (S.currency || "₹") + Math.round(n || 0).toLocaleString("en-IN"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isUrl(id) { return /[\/.]/.test(String(id)); }
  function img(id, w, h, q) {
    if (!id) return "";
    if (isUrl(id)) return id;
    return "https://images.unsplash.com/photo-" + id + "?ixlib=rb-4.1.0&auto=format&fit=crop&w=" + w + (h ? "&h=" + h : "") + "&q=" + (q || 70);
  }
  function srcset(id, ratio, widths) {
    if (!id || isUrl(id)) return "";
    return (widths || [360, 540, 720, 960]).map(function (w) {
      return img(id, w, ratio ? Math.round(w / ratio) : 0) + " " + w + "w";
    }).join(", ");
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }

  /* ---------- WhatsApp ---------- */
  var waNumber = String(S.whatsapp || "").replace(/\D/g, "");
  var waReady = waNumber.length >= 10 && !/x/i.test(String(S.whatsapp || ""));
  function waLink(text) {
    var t = encodeURIComponent(text || "");
    return waReady ? "https://wa.me/" + waNumber + "?text=" + t : "https://wa.me/?text=" + t;
  }
  function openWhatsApp(text) {
    var url = waLink(text);
    var w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  }

  /* ---------- Bind settings into the page ---------- */
  function telHref() {
    var raw = S.phoneLink || S.phone || "";
    var digits = raw.replace(/[^\d+]/g, "");
    if (!digits || /x/i.test(raw)) return waReady ? "tel:+" + waNumber : "";
    return "tel:" + digits;
  }
  function bindSite() {
    var a = S.address || {};
    var d = S.delivery || {};
    var text = {
      name: S.name, phone: S.phone, email: S.email,
      "address-1": a.line1, "address-2": a.line2,
      address: [a.line1, a.line2].filter(Boolean).join(", "),
      eta: d.eta, "min-order": money(d.minOrder), "free-above": money(d.freeAbove),
      "delivery-fee": money(d.fee), radius: d.radiusKm ? d.radiusKm + " km" : ""
    };
    $$("[data-site]").forEach(function (el) {
      var v = text[el.getAttribute("data-site")];
      if (v != null && v !== "") el.textContent = v;
    });
    var hello = "Hi " + (S.name || "") + "! I'd like to place an order.";
    var hrefs = {
      whatsapp: waLink(hello),
      "whatsapp-party": waLink("Hi " + (S.name || "") + "! I'd like to ask about a party order."),
      "whatsapp-question": waLink("Hi " + (S.name || "") + "! I have a question."),
      call: telHref(),
      email: S.email ? "mailto:" + S.email : "",
      directions: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.mapQuery || S.name || ""),
      instagram: S.social && S.social.instagram, facebook: S.social && S.social.facebook,
      youtube: S.social && S.social.youtube, x: S.social && S.social.x
    };
    $$("[data-href]").forEach(function (el) {
      var key = el.getAttribute("data-href");
      var v = hrefs[key];
      if (v) {
        el.setAttribute("href", v);
        if (/^https?:/.test(v) && key !== "directions") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
        if (key === "directions") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
      } else if (/^(instagram|facebook|youtube|x)$/.test(key)) {
        (el.closest("li") || el).hidden = true;
      }
    });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-areas]").forEach(function (el) {
      el.innerHTML = (d.areas || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    });
    $$("[data-payments]").forEach(function (el) { el.textContent = (S.payment || []).join(", "); });
  }

  /* ---------- Hours + open status ---------- */
  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function toMin(hm) { var p = String(hm || "0:0").split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
  function fmtTime(hm) {
    var m = toMin(hm) % 1440, h = Math.floor(m / 60), mm = m % 60;
    if (m === 0 || m === 1439) return "midnight";
    var ap = h >= 12 ? "pm" : "am", h12 = h % 12 || 12;
    return h12 + (mm ? ":" + String(mm).padStart(2, "0") : "") + " " + ap;
  }
  function renderHours() {
    var hrs = S.hours || {};
    var order = [1, 2, 3, 4, 5, 6, 0];
    var groups = [];
    order.forEach(function (d) {
      var h = hrs[d] || { closed: true };
      var sig = h.closed ? "closed" : h.open + "-" + h.close;
      var last = groups[groups.length - 1];
      if (last && last.sig === sig) last.to = d; else groups.push({ sig: sig, from: d, to: d, h: h });
    });
    var html = groups.map(function (g) {
      var days = g.from === g.to ? DAY[g.from] : DAY[g.from] + " to " + DAY[g.to];
      var time = g.h.closed ? "Closed" : fmtTime(g.h.open) + " – " + fmtTime(g.h.close);
      return "<li><span>" + days + "</span><span>" + time + "</span></li>";
    }).join("");
    $$("[data-hours]").forEach(function (el) { el.innerHTML = html; });
  }
  function nowParts() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: S.timezone || "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: DAY.indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function openState() {
    var hrs = S.hours || {};
    var n = nowParts();
    function win(day) {
      var h = hrs[day];
      if (!h || h.closed) return null;
      var o = toMin(h.open), c = toMin(h.close);
      if (c <= o) c += 1440;
      return { o: o, c: c, h: h };
    }
    var y = win((n.day + 6) % 7);
    if (y && n.min + 1440 < y.c) return { open: true, until: y.h.close };
    var t = win(n.day);
    if (t && n.min >= t.o && n.min < t.c) return { open: true, until: t.h.close };
    if (t && n.min < t.o) return { open: false, next: "today at " + fmtTime(t.h.open) };
    for (var i = 1; i <= 7; i++) {
      var dd = (n.day + i) % 7, w = win(dd);
      if (w) return { open: false, next: (i === 1 ? "tomorrow" : DAY_LONG[dd]) + " at " + fmtTime(w.h.open) };
    }
    return { open: false, next: "" };
  }
  function renderStatus() {
    var st = openState();
    var txt = st.open ? "Open now until " + fmtTime(st.until) : "Closed now" + (st.next ? ". Opens " + st.next : "");
    $$("[data-open-status]").forEach(function (el) {
      el.textContent = txt;
      el.setAttribute("data-state", st.open ? "open" : "closed");
    });
  }

  /* ---------- Header + mobile nav ---------- */
  var header = $("[data-header]");
  var navToggle = $("[data-nav-toggle]");
  var mobileNav = $("[data-mobile-nav]");
  var navOpen = false;
  var canHide = document.body.getAttribute("data-header-hide") !== "false";
  var lastY = window.scrollY, ticking = false;
  function onScrollHeader() {
    ticking = false;
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle("is-solid", y > 24);
    if (canHide && !navOpen && !document.body.classList.contains("drawer-open")) {
      if (y > lastY + 6 && y > 200) header.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 200) header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollHeader); }
  }, { passive: true });
  function setNav(open) {
    if (!mobileNav || !navToggle) return;
    navOpen = open;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      mobileNav.hidden = false;
      $$("li", mobileNav).forEach(function (li, i) { li.style.setProperty("--i", i); });
      requestAnimationFrame(function () { mobileNav.classList.add("is-open"); });
      root.style.overflow = "hidden";
      header && header.classList.remove("is-hidden");
      header && header.classList.add("is-solid");
    } else {
      mobileNav.classList.remove("is-open");
      mobileNav.hidden = true;
      root.style.overflow = "";
      onScrollHeader();
    }
  }
  if (navToggle) navToggle.addEventListener("click", function () { setNav(!navOpen); });
  if (mobileNav) mobileNav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });

  /* ---------- Toasts ---------- */
  var toastBox = $("[data-toasts]");
  function toast(msg, action) {
    if (!toastBox) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML = "<span></span>";
    t.firstChild.textContent = msg;
    if (action) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = action.label;
      b.addEventListener("click", function () { action.fn(); dismiss(); });
      t.appendChild(b);
    }
    toastBox.appendChild(t);
    while (toastBox.children.length > 2) toastBox.removeChild(toastBox.firstChild);
    var timer = setTimeout(dismiss, 3200);
    function dismiss() {
      clearTimeout(timer);
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 300);
    }
  }

  /* ---------- Catalogue index ---------- */
  var catalogue = {};
  (D.menu || []).forEach(function (cat) {
    cat.items.forEach(function (it) { catalogue[it.id] = Object.assign({ cat: cat.id }, it); });
  });
  (D.deals || []).forEach(function (dl) { catalogue[dl.id] = Object.assign({ cat: "deals" }, dl); });
  function priceFor(def, sizeKey) {
    if (def.sizes) {
      var s = def.sizes.filter(function (x) { return x.key === sizeKey; })[0];
      return s ? { price: s.price, label: s.label + " " + s.note, key: s.key } : null;
    }
    return { price: def.price, label: "", key: "" };
  }

  /* ---------- Cart ---------- */
  var STORE = "fornonero_cart_v1";
  var cart = {
    items: [], form: {},
    load: function () {
      try {
        var d = JSON.parse(localStorage.getItem(STORE) || "{}");
        this.form = d.form || {};
        this.items = (Array.isArray(d.items) ? d.items : []).map(function (it) {
          var def = catalogue[it.id];
          if (!def) return null;
          var p = priceFor(def, it.size);
          if (!p) return null;
          return { key: it.key, id: it.id, size: p.key, sizeLabel: p.label, name: def.name, price: p.price, img: def.img, veg: def.veg, qty: Math.max(1, Math.min(20, it.qty | 0)) };
        }).filter(Boolean);
      } catch (e) { this.items = []; }
    },
    save: function () {
      try { localStorage.setItem(STORE, JSON.stringify({ items: this.items, form: this.form })); } catch (e) {}
      renderCart();
    },
    add: function (id, sizeKey) {
      var def = catalogue[id];
      if (!def) return null;
      var p = priceFor(def, sizeKey);
      if (!p) return null;
      var key = id + (p.key ? ":" + p.key : "");
      var ex = this.items.filter(function (x) { return x.key === key; })[0];
      if (ex) ex.qty = Math.min(20, ex.qty + 1);
      else this.items.push({ key: key, id: id, size: p.key, sizeLabel: p.label, name: def.name, price: p.price, img: def.img, veg: def.veg, qty: 1 });
      this.save();
      return { name: def.name, label: p.label };
    },
    setQty: function (key, q) {
      var it = this.items.filter(function (x) { return x.key === key; })[0];
      if (!it) return;
      if (q <= 0) this.items = this.items.filter(function (x) { return x.key !== key; });
      else it.qty = Math.min(20, q);
      this.save();
    },
    clear: function () { this.items = []; this.save(); },
    count: function () { return this.items.reduce(function (a, b) { return a + b.qty; }, 0); },
    subtotal: function () { return this.items.reduce(function (a, b) { return a + b.qty * b.price; }, 0); }
  };

  /* ---------- Drawer ---------- */
  var drawer = $("[data-drawer]");
  var panel = drawer && $(".drawer-panel", drawer);
  var lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    if (navOpen) setNav(false);
    lastFocus = document.activeElement;
    if (toastBox) toastBox.innerHTML = "";
    drawer.hidden = false;
    document.body.classList.add("drawer-open");
    root.style.overflow = "hidden";
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    setTimeout(function () { panel && panel.focus({ preventScroll: true }); }, 60);
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    root.style.overflow = "";
    setTimeout(function () { drawer.hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cart-open]")) { e.preventDefault(); openDrawer(); }
    else if (e.target.closest("[data-cart-close]")) { e.preventDefault(); closeDrawer(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (lightbox && !lightbox.hidden) closeLightbox();
      else if (drawer && !drawer.hidden) closeDrawer();
      else if (navOpen) setNav(false);
    }
    if (e.key === "Tab" && drawer && !drawer.hidden && panel) {
      var f = $$("button:not([disabled]), [href], input:not([type=hidden]), select, textarea, summary", panel).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Checkout ---------- */
  var form = $("[data-checkout]");
  function field(name) { return form ? form.elements[name] : null; }
  function readForm() {
    if (!form) return {};
    var mode = (form.querySelector("input[name=mode]:checked") || {}).value || "delivery";
    return {
      mode: mode,
      name: (field("name").value || "").trim(),
      phone: (field("phone").value || "").trim(),
      address: (field("address").value || "").trim(),
      landmark: (field("landmark").value || "").trim(),
      when: field("when").value,
      payment: field("payment").value,
      coupon: (field("coupon").value || "").trim().toUpperCase(),
      notes: (field("notes").value || "").trim()
    };
  }
  function fillForm() {
    if (!form) return;
    var paySel = field("payment");
    if (paySel && !paySel.options.length) {
      (S.payment || ["Cash on delivery"]).forEach(function (p) { var o = document.createElement("option"); o.textContent = p; paySel.appendChild(o); });
    }
    var f = cart.form || {};
    ["name", "phone", "address", "landmark"].forEach(function (k) { if (f[k] && field(k)) field(k).value = f[k]; });
    if (f.mode) { var r = form.querySelector("input[name=mode][value=" + f.mode + "]"); if (r) r.checked = true; }
    if (f.payment && paySel) paySel.value = f.payment;
    syncMode();
  }
  function syncMode() {
    if (!form) return;
    var mode = readForm().mode;
    $$("[data-delivery-only]", form).forEach(function (el) { el.hidden = mode !== "delivery"; });
    var paySel = field("payment");
    if (paySel) $$("option", paySel).forEach(function (o) { o.textContent = o.textContent.replace(mode === "pickup" ? /on delivery/ : /at pickup/, mode === "pickup" ? "at pickup" : "on delivery"); });
  }
  function totals(mode) {
    var sub = cart.subtotal();
    var d = S.delivery || {};
    var fee = mode === "delivery" && sub > 0 && sub < (d.freeAbove || Infinity) ? (d.fee || 0) : 0;
    return { sub: sub, fee: fee, total: sub + fee };
  }
  function buildMessage() {
    var f = readForm();
    var t = totals(f.mode);
    var L = [];
    L.push("Hi " + S.name + "! I'd like to place an order.", "");
    L.push("*Order*");
    cart.items.forEach(function (it) {
      L.push(it.qty + " × " + it.name + (it.sizeLabel ? " (" + it.sizeLabel + ")" : "") + " = " + money(it.qty * it.price));
    });
    L.push("", "Subtotal: " + money(t.sub));
    if (f.mode === "delivery") L.push("Delivery: " + (t.fee ? money(t.fee) : "Free"));
    L.push("*Total: " + money(t.total) + "*", "");
    L.push(f.mode === "delivery" ? "*Delivery details*" : "*Pickup details*");
    L.push("Name: " + (f.name || "-"), "Phone: " + (f.phone || "-"));
    if (f.mode === "delivery") {
      L.push("Address: " + (f.address || "-"));
      if (f.landmark) L.push("Landmark: " + f.landmark);
    }
    L.push("When: " + f.when, "Payment: " + f.payment);
    if (f.coupon) L.push("Coupon: " + f.coupon);
    if (f.notes) L.push("Notes: " + f.notes);
    return L.join("\n");
  }
  function setErr(name, msg) {
    var el = field(name);
    if (!el) return;
    var wrap = el.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    var e = $(".err", wrap);
    if (e) e.textContent = msg || "";
  }
  function validate() {
    var f = readForm();
    var bad = [];
    function check(name, ok, msg) { setErr(name, ok ? "" : msg); if (!ok) bad.push(name); }
    check("name", f.name.length >= 2, "Enter your name so we know who the order is for.");
    var digits = f.phone.replace(/\D/g, "");
    check("phone", digits.length >= 10 && digits.length <= 13, "Enter a 10-digit mobile number.");
    if (f.mode === "delivery") check("address", f.address.length >= 8, "Enter your full address: house number, street and area.");
    else setErr("address", "");
    return bad;
  }
  function renderCart() {
    var count = cart.count();
    var sub = cart.subtotal();
    $$("[data-cart-count]").forEach(function (el) {
      var prev = el.textContent;
      el.textContent = count;
      el.classList.toggle("has-items", count > 0);
      if (String(count) !== prev && count > 0) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $$("[data-cart-open].cart-btn").forEach(function (b) { b.setAttribute("aria-label", "Open your order, " + count + (count === 1 ? " item" : " items")); });
    document.body.classList.toggle("has-cart", count > 0);
    var bar = $("[data-cart-bar]");
    if (bar) {
      bar.hidden = false;
      bar.classList.toggle("is-visible", count > 0);
      var s = $("[data-cart-bar-summary]", bar);
      if (s) s.textContent = count + (count === 1 ? " item, " : " items, ") + money(sub);
    }
    if (!drawer) return;
    var lines = $("[data-cart-lines]", drawer);
    var empty = $("[data-cart-empty]", drawer);
    var checkout = $("[data-checkout-wrap]", drawer);
    var foot = $("[data-cart-foot]", drawer);
    empty.hidden = count > 0;
    checkout.hidden = count === 0;
    foot.hidden = count === 0;
    lines.innerHTML = cart.items.map(function (it) {
      return '<li class="line" data-key="' + esc(it.key) + '">' +
        '<img src="' + esc(img(it.img, 120, 120)) + '" alt="" width="58" height="58" loading="lazy">' +
        '<div><div class="line-name">' + esc(it.name) + '</div><div class="line-meta">' + esc(it.sizeLabel || (it.id.indexOf("deal-") === 0 ? "Offer" : "")) + (it.sizeLabel || it.id.indexOf("deal-") === 0 ? ", " : "") + esc(money(it.price)) + ' each</div></div>' +
        '<div class="line-right"><span class="line-price">' + money(it.price * it.qty) + '</span>' +
        '<div class="qty"><button type="button" data-qty="-1" aria-label="Remove one ' + esc(it.name) + '">−</button><output aria-live="polite">' + it.qty + '</output><button type="button" data-qty="1" aria-label="Add one more ' + esc(it.name) + '">+</button></div></div></li>';
    }).join("");
    var f = readForm();
    var t = totals(f.mode);
    var d = S.delivery || {};
    $("[data-total-sub]", drawer).textContent = money(t.sub);
    $("[data-total-fee]", drawer).textContent = f.mode === "delivery" ? (t.fee ? money(t.fee) : "Free") : "Pickup";
    $("[data-total]", drawer).textContent = money(t.total);
    var hint = $("[data-fee-hint]", drawer);
    var send = $("[data-send-order]", drawer);
    var belowMin = f.mode === "delivery" && t.sub < (d.minOrder || 0);
    if (hint) {
      if (belowMin) hint.textContent = "Add " + money(d.minOrder - t.sub) + " more for delivery, or switch to pickup.";
      else if (f.mode === "delivery" && t.fee && d.freeAbove) hint.textContent = "Add " + money(d.freeAbove - t.sub) + " more for free delivery.";
      else hint.textContent = "";
      hint.hidden = !hint.textContent;
    }
    if (send) send.disabled = count === 0 || belowMin;
    var pre = $("[data-wa-preview]", drawer);
    if (pre) pre.textContent = buildMessage();
    var demo = $("[data-demo-note]", drawer);
    if (demo) demo.hidden = waReady;
  }
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      var b = e.target.closest("[data-qty]");
      if (b) {
        var key = b.closest("[data-key]").getAttribute("data-key");
        var it = cart.items.filter(function (x) { return x.key === key; })[0];
        if (it) cart.setQty(key, it.qty + (+b.getAttribute("data-qty")));
      }
      if (e.target.closest("[data-clear-cart]")) { cart.clear(); toast("Order cleared"); }
      if (e.target.closest("[data-send-order]")) {
        var bad = validate();
        if (bad.length) { var el = field(bad[0]); el && el.focus(); return; }
        cart.form = Object.assign(cart.form || {}, (function (f) { return { name: f.name, phone: f.phone, address: f.address, landmark: f.landmark, mode: f.mode, payment: f.payment }; })(readForm()));
        cart.save();
        openWhatsApp(buildMessage());
        toast(waReady ? "Opening WhatsApp. Press send to place your order." : "Demo mode: add your WhatsApp number in js/config.js to receive orders.");
      }
    });
  }
  if (form) {
    form.addEventListener("input", debounce(function (e) {
      if (e.target.name && e.target.closest(".field.has-error")) setErr(e.target.name, "");
      cart.form = Object.assign(cart.form || {}, (function (f) { return { name: f.name, phone: f.phone, address: f.address, landmark: f.landmark, mode: f.mode, payment: f.payment }; })(readForm()));
      try { localStorage.setItem(STORE, JSON.stringify({ items: cart.items, form: cart.form })); } catch (err) {}
      renderCart();
    }, 150));
    form.addEventListener("change", function (e) { if (e.target.name === "mode") { syncMode(); renderCart(); } });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
  }

  /* ---------- Menu cards ---------- */
  var uid = 0;
  function cardHTML(it) {
    uid++;
    var sized = Array.isArray(it.sizes);
    var def = sized ? (it.sizes[1] || it.sizes[0]) : null;
    var price = sized ? def.price : it.price;
    var tags = it.tags && it.tags.length ? '<p class="tags">' + it.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</p>" : "";
    var sizes = "";
    if (sized) {
      sizes = '<fieldset class="sizes"><legend>Choose a size for ' + esc(it.name) + "</legend>" + it.sizes.map(function (s) {
        return '<label><input type="radio" name="size-' + uid + '" value="' + s.key + '"' + (s === def ? " checked" : "") + ' data-price="' + s.price + '"><span>' + esc(s.label) + "<small>" + esc(s.note) + "</small></span></label>";
      }).join("") + "</fieldset>";
    }
    return '<article class="card" data-item="' + esc(it.id) + '" data-name="' + esc((it.name + " " + it.desc + " " + (it.tags || []).join(" ")).toLowerCase()) + '" data-veg="' + (it.veg ? "1" : "0") + '">' +
      '<div class="card-media"><img src="' + esc(img(it.img, 640, 480)) + '" srcset="' + esc(srcset(it.img, 4 / 3)) + '" sizes="(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 380px" width="640" height="480" loading="lazy" decoding="async" alt="' + esc(it.name) + '"></div>' +
      '<div class="card-body"><h3 class="card-title"><span class="diet ' + (it.veg ? "veg" : "nonveg") + '" role="img" aria-label="' + (it.veg ? "Vegetarian" : "Non-vegetarian") + '"></span>' + esc(it.name) + "</h3>" +
      '<p class="card-desc">' + esc(it.desc) + "</p>" + tags + sizes +
      '<div class="card-foot"><span class="price" data-price-out>' + money(price) + '</span><button class="btn btn-ember btn-sm add-btn" type="button" data-add>Add to order</button></div>' +
      "</div></article>";
  }
  document.addEventListener("change", function (e) {
    var r = e.target.closest(".sizes input");
    if (!r) return;
    var card = r.closest(".card");
    var out = card && $("[data-price-out]", card);
    if (out) out.textContent = money(+r.getAttribute("data-price"));
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var card = b.closest("[data-item]");
    if (!card) return;
    var size = (card.querySelector(".sizes input:checked") || {}).value;
    var res = cart.add(card.getAttribute("data-item"), size);
    if (!res) return;
    b.classList.add("is-added");
    var label = b.textContent;
    b.textContent = "Added";
    setTimeout(function () { b.classList.remove("is-added"); b.textContent = label === "Added" ? "Add to order" : label; }, 1300);
    toast(res.name + (res.label ? " (" + res.label + ")" : "") + " added", { label: "View order", fn: openDrawer });
  });

  function renderSignature() {
    $$("[data-signature]").forEach(function (el) {
      var ids = (el.getAttribute("data-ids") || "").split(",").map(function (s) { return s.trim(); });
      el.innerHTML = ids.map(function (id) { return catalogue[id] ? cardHTML(catalogue[id]) : ""; }).join("");
    });
  }

  function renderMenuPage() {
    var host = $("[data-menu]");
    if (!host) return;
    var tabs = $("[data-menu-tabs]");
    host.innerHTML = (D.menu || []).map(function (cat) {
      return '<section class="menu-cat" id="' + cat.id + '" data-cat="' + cat.id + '"><header><h2 class="h2">' + esc(cat.name) + "</h2><p>" + esc(cat.blurb || "") + '</p></header><div class="menu-grid">' + cat.items.map(cardHTML).join("") + "</div></section>";
    }).join("") + '<p class="empty" data-menu-empty hidden></p>';
    if (tabs) tabs.innerHTML = (D.menu || []).map(function (cat, i) { return '<a href="#' + cat.id + '"' + (i === 0 ? ' class="is-active"' : "") + ">" + esc(cat.name) + "</a>"; }).join("");

    var search = $("[data-menu-search]");
    var veg = $("[data-veg-only]");
    var emptyEl = $("[data-menu-empty]");
    function apply() {
      var q = (search && search.value || "").trim().toLowerCase();
      var vegOnly = veg && veg.checked;
      var shown = 0;
      $$(".menu-cat", host).forEach(function (sec) {
        var n = 0;
        $$(".card", sec).forEach(function (c) {
          var ok = (!q || c.getAttribute("data-name").indexOf(q) !== -1) && (!vegOnly || c.getAttribute("data-veg") === "1");
          c.hidden = !ok;
          if (ok) n++;
        });
        sec.hidden = n === 0;
        if (tabs) { var t = $('a[href="#' + sec.id + '"]', tabs); if (t) t.hidden = n === 0; }
        shown += n;
      });
      if (emptyEl) {
        emptyEl.hidden = shown > 0;
        if (!shown) emptyEl.innerHTML = "Nothing matches “" + esc(q) + "”" + (vegOnly ? " in vegetarian dishes" : "") + '. <button class="link" type="button" data-reset-menu style="background:none;border:0;cursor:pointer">Clear the search</button>';
      }
    }
    if (search) search.addEventListener("input", debounce(apply, 120));
    if (veg) veg.addEventListener("change", apply);
    host.addEventListener("click", function (e) {
      if (e.target.closest("[data-reset-menu]")) { if (search) search.value = ""; if (veg) veg.checked = false; apply(); search && search.focus(); }
    });

    if (tabs && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          $$("a", tabs).forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); });
          var act = $("a.is-active", tabs);
          if (act) tabs.scrollTo({ left: act.offsetLeft - 24, behavior: reduceMotion ? "auto" : "smooth" });
        });
      }, { rootMargin: "-35% 0px -60% 0px" });
      $$(".menu-cat", host).forEach(function (s) { io.observe(s); });
      tabs.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a) return;
        e.preventDefault();
        var target = document.getElementById(a.getAttribute("href").slice(1));
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", a.getAttribute("href"));
      });
    }
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 50);
    }
  }

  /* ---------- Offers ---------- */
  function renderDeals() {
    $$("[data-deals]").forEach(function (el) {
      var limit = +el.getAttribute("data-limit") || 99;
      el.innerHTML = (D.deals || []).slice(0, limit).map(function (dl) {
        return '<article class="deal" data-item="' + esc(dl.id) + '">' +
          '<div class="deal-media"><img src="' + esc(img(dl.img, 720, 405)) + '" srcset="' + esc(srcset(dl.img, 16 / 9, [400, 640, 900])) + '" sizes="(max-width: 700px) 90vw, 380px" width="720" height="405" loading="lazy" decoding="async" alt=""></div>' +
          '<span class="deal-when">' + esc(dl.when) + "</span>" +
          "<h3>" + esc(dl.name) + "</h3><p>" + esc(dl.desc) + "</p>" +
          '<p class="deal-price">' + money(dl.price) + (dl.was ? "<s>" + money(dl.was) + "</s>" : "") + "</p>" +
          '<button class="btn btn-ink btn-sm add-btn" type="button" data-add>Add to order</button></article>';
      }).join("");
    });
  }

  /* ---------- Reviews ---------- */
  function renderReviews() {
    $$("[data-reviews]").forEach(function (el) {
      el.innerHTML = (D.reviews || []).map(function (r) {
        return '<figure class="review"><blockquote>“' + esc(r.quote) + '”</blockquote><figcaption>' + esc(r.name) + ", " + esc(r.where) + "</figcaption></figure>";
      }).join("");
    });
    $$("[data-sample-note]").forEach(function (el) { el.hidden = !S.showSampleNotes; });
  }

  /* ---------- Gallery + lightbox ---------- */
  var lightbox = null, lbItems = [], lbIndex = 0, lbImg, lbCap, lbLast;
  function renderGallery() {
    var host = $("[data-gallery]");
    if (!host) return;
    var items = D.gallery || [];
    function draw(cat) {
      lbItems = items.filter(function (g) { return cat === "all" || g.cat === cat; });
      host.innerHTML = lbItems.map(function (g, i) {
        var w = 720, h = Math.round(w * g.h / g.w);
        return '<button type="button" data-lb="' + i + '" aria-label="Open photo: ' + esc(g.alt) + '"><img src="' + esc(img(g.img, w, h)) + '" srcset="' + esc(srcset(g.img, g.w / g.h, [400, 720, 1000])) + '" sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px" width="' + w + '" height="' + h + '" loading="lazy" decoding="async" alt="' + esc(g.alt) + '"></button>';
      }).join("");
    }
    draw("all");
    var filters = $("[data-gallery-filters]");
    if (filters) filters.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      $$("[data-filter]", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      draw(b.getAttribute("data-filter"));
    });
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lb]");
      if (b) openLightbox(+b.getAttribute("data-lb"), b);
    });
  }
  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Photo viewer");
    lightbox.innerHTML =
      '<div class="lb-top"><span class="lb-caption" data-lb-count></span><button class="icon-btn" type="button" data-lb-close aria-label="Close photo viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="lb-stage"><img alt=""></div>' +
      '<div class="lb-bottom"><button class="icon-btn" type="button" data-lb-prev aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></button><span class="lb-caption" data-lb-cap></span><button class="icon-btn" type="button" data-lb-next aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    document.body.appendChild(lightbox);
    lbImg = $(".lb-stage img", lightbox);
    lbCap = $("[data-lb-cap]", lightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target.closest("[data-lb-close]") || e.target.classList.contains("lb-stage")) closeLightbox();
      else if (e.target.closest("[data-lb-prev]")) showLb(lbIndex - 1);
      else if (e.target.closest("[data-lb-next]")) showLb(lbIndex + 1);
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
    var sx = 0;
    lightbox.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1)); }, { passive: true });
  }
  function showLb(i) {
    if (!lbItems.length) return;
    lbIndex = (i + lbItems.length) % lbItems.length;
    var g = lbItems[lbIndex];
    lbImg.src = img(g.img, 1600, 0, 78);
    lbImg.alt = g.alt;
    lbCap.textContent = g.alt;
    $("[data-lb-count]", lightbox).textContent = (lbIndex + 1) + " of " + lbItems.length;
  }
  function openLightbox(i, from) {
    if (!lightbox) buildLightbox();
    lbLast = from;
    lightbox.hidden = false;
    root.style.overflow = "hidden";
    showLb(i);
    $("[data-lb-close]", lightbox).focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    root.style.overflow = "";
    if (lbLast) lbLast.focus();
  }
  function renderCredits() {
    $$("[data-credits]").forEach(function (el) {
      el.innerHTML = (D.credits || []).map(function (c) {
        return '<li><a href="https://unsplash.com/@' + encodeURIComponent(c[1]) + '?utm_source=forno_nero&utm_medium=referral" target="_blank" rel="noopener">' + esc(c[0]) + "</a></li>";
      }).join("");
    });
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    $$(".faq-q").forEach(function (q, i) {
      var item = q.closest(".faq-item");
      var ans = $(".faq-a", item);
      var id = "faq-a-" + i;
      ans.id = id;
      q.setAttribute("aria-controls", id);
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        q.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- Enquiry forms → WhatsApp ---------- */
  function initWaForms() {
    $$("[data-wa-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var bad = null;
        $$("[data-required]", f).forEach(function (el) {
          var wrap = el.closest(".field");
          var ok = el.value.trim().length > 0;
          if (el.type === "tel") ok = el.value.replace(/\D/g, "").length >= 10;
          wrap.classList.toggle("has-error", !ok);
          el.setAttribute("aria-invalid", ok ? "false" : "true");
          if (!ok && !bad) bad = el;
        });
        if (bad) { bad.focus(); return; }
        var lines = [f.getAttribute("data-wa-intro").replace("{name}", S.name), ""];
        $$("[data-label]", f).forEach(function (el) {
          var v = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : el.value.trim();
          if (v) lines.push(el.getAttribute("data-label") + ": " + v);
        });
        openWhatsApp(lines.join("\n"));
        toast(waReady ? "Opening WhatsApp. Press send and we'll reply shortly." : "Demo mode: add your WhatsApp number in js/config.js.");
      });
      f.addEventListener("input", function (e) {
        var wrap = e.target.closest(".field.has-error");
        if (wrap) wrap.classList.remove("has-error");
      });
    });
  }

  /* ---------- Carousel buttons ---------- */
  function initCarousels() {
    $$("[data-carousel-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        var track = document.getElementById(b.getAttribute("aria-controls"));
        if (!track) return;
        var card = track.firstElementChild;
        var step = card ? card.getBoundingClientRect().width + 18 : 320;
        track.scrollBy({ left: step * (+b.getAttribute("data-carousel-btn")), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Video ---------- */
  function loadVideo(v) {
    if (!v || v.getAttribute("data-loaded")) return;
    var m = (D.media || {})[v.getAttribute("data-video")];
    if (!m) return;
    var wide = window.innerWidth >= 900;
    var list = [];
    if (m.hd && wide && v.getAttribute("data-quality") !== "sd") list.push(m.hd);
    if (m.sd) list.push(m.sd);
    list.forEach(function (src, i) {
      var s = document.createElement("source");
      s.src = src; s.type = "video/mp4";
      if (i === list.length - 1) s.addEventListener("error", function () { v.setAttribute("data-failed", "1"); v.dispatchEvent(new Event("videofailed")); });
      v.appendChild(s);
    });
    v.setAttribute("data-loaded", "1");
    v.addEventListener("playing", function () { v.classList.add("is-playing"); });
    v.load();
  }
  function playVideo(v) {
    if (!v) return;
    loadVideo(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function pauseVideo(v) { if (v && !v.paused) v.pause(); }
  window.FN = { playVideo: playVideo, pauseVideo: pauseVideo, canAutoVideo: canAutoVideo, img: img, srcset: srcset };

  function initVideos() {
    var hero = $("[data-video='hero']");
    var toggle = $("[data-video-toggle]");
    var userPaused = !canAutoVideo;
    function label() {
      if (!toggle) return;
      var started = hero.classList.contains("is-playing");
      var playing = started && !hero.paused;
      toggle.hidden = !!hero.getAttribute("data-failed") || (canAutoVideo && !started && !userPaused);
      toggle.setAttribute("aria-pressed", String(!playing));
      $("span", toggle).textContent = playing ? "Pause video" : "Play video";
      toggle.querySelector("[data-icon-pause]").style.display = playing ? "" : "none";
      toggle.querySelector("[data-icon-play]").style.display = playing ? "none" : "";
    }
    if (hero) {
      hero.addEventListener("play", label);
      hero.addEventListener("pause", label);
      hero.addEventListener("playing", function () { hero.classList.add("is-playing"); label(); });
      hero.addEventListener("videofailed", label);
      var start = function () { if (!userPaused) playVideo(hero); label(); };
      if (document.readyState === "complete") setTimeout(start, 300);
      else window.addEventListener("load", function () { setTimeout(start, 300); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (!x.isIntersecting) pauseVideo(hero); else if (!userPaused && hero.getAttribute("data-loaded")) playVideo(hero); });
        }, { threshold: 0.05 }).observe(hero.closest("section") || hero);
      }
      if (toggle) toggle.addEventListener("click", function () {
        if (hero.paused) { userPaused = false; playVideo(hero); } else { userPaused = true; hero.pause(); }
        label();
      });
      label();
    }
    var lazy = $$("video[data-video][data-lazy]");
    if (lazy.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting) { if (canAutoVideo) playVideo(x.target); }
          else pauseVideo(x.target);
        });
      }, { rootMargin: "200px 0px" });
      lazy.forEach(function (v) { io.observe(v); });
    }
  }

  /* ---------- Maps (lazy) ---------- */
  function initMaps() {
    var frames = $$("iframe[data-map]");
    if (!frames.length) return;
    var src = "https://www.google.com/maps?q=" + encodeURIComponent(S.mapQuery || S.name || "") + "&output=embed";
    function load(f) { if (!f.getAttribute("src")) f.setAttribute("src", src); }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { load(x.target); io.unobserve(x.target); } });
      }, { rootMargin: "400px 0px" });
      frames.forEach(function (f) { io.observe(f); });
    } else frames.forEach(load);
  }

  /* ---------- Hero wordmark: fit to width ---------- */
  function fitWordmark() {
    var el = $(".hero-wordmark");
    if (!el) return;
    var span = $("span", el);
    var cs = getComputedStyle(el);
    var avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = "100px";
    var w = span.offsetWidth;
    if (w > 0) el.style.fontSize = Math.floor(100 * avail / w * 0.995) + "px";
  }

  /* ---------- Structured data ---------- */
  function jsonLd() {
    var a = S.address || {};
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var spec = Object.keys(S.hours || {}).filter(function (k) { return !S.hours[k].closed; }).map(function (k) {
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days[k], opens: S.hours[k].open, closes: S.hours[k].close };
    });
    var data = {
      "@context": "https://schema.org", "@type": "Restaurant", name: S.name, servesCuisine: ["Pizza", "Italian"],
      priceRange: "₹₹", url: location.origin + "/", menu: location.origin + "/menu.html",
      address: { "@type": "PostalAddress", streetAddress: a.line1, addressLocality: a.line2 },
      telephone: S.phone, openingHoursSpecification: spec, acceptsReservations: false
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Boot ---------- */
  bindSite();
  renderHours();
  renderStatus();
  setInterval(renderStatus, 60000);
  cart.load();
  fillForm();
  renderSignature();
  renderMenuPage();
  renderDeals();
  renderReviews();
  renderGallery();
  renderCredits();
  initFaq();
  initWaForms();
  initCarousels();
  initVideos();
  initMaps();
  renderCart();
  onScrollHeader();
  fitWordmark();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);
  window.addEventListener("resize", debounce(fitWordmark, 150));
  if (/^https?:/.test(location.protocol)) jsonLd();
  window.FN.cart = cart;
  window.FN.openDrawer = openDrawer;
  window.FN.buildMessage = buildMessage;
})();
