/* =============================================================
   Forno Nero — scroll story
   One sticky scene: dough, sauce, cheese and toppings drop on in
   3D, the pizza bakes, a kraft box folds up around it, and the box
   leaves for delivery. Native scrolling (no scroll-jacking); the
   animation eases toward the scroll position each frame and only
   touches transform/opacity, so it stays on the GPU.
   ============================================================= */
(function () {
  "use strict";
  var story = document.querySelector("[data-story]");
  if (!story) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FN = window.FN || {};
  var q = function (s) { return story.querySelector(s); };
  var qa = function (s) { return Array.prototype.slice.call(story.querySelectorAll(s)); };

  var sticky = q(".story-sticky");
  var rig = q("[data-rig]");
  var spin = q("[data-spin]");
  var layer = function (n) { return q('[data-layer="' + n + '"]'); };
  var edge = layer("edge"), dough = layer("dough"), crust = layer("crust");
  var sauce = layer("sauce"), cheese = layer("cheese"), topL = layer("top");
  var glow = q("[data-glow]"), shadow = q("[data-fall-shadow]");
  var box = q("[data-box]");
  var faces = Array.prototype.slice.call(box.querySelectorAll(".face"));
  var flapF = box.querySelector(".flap-f"), flapB = box.querySelector(".flap-b");
  var flapL = box.querySelector(".flap-l"), flapR = box.querySelector(".flap-r");
  var lid = box.querySelector(".lid");
  var bgOven = q('[data-bg="oven"]'), bgRoad = q('[data-bg="road"]');
  var steps = qa("[data-step]");
  var rail = qa("[data-rail] li");
  var temp = q("[data-temp]");

  /* where each chapter starts, as a share of the scroll distance */
  var PH = [0, 0.14, 0.27, 0.40, 0.53, 0.67, 0.83];

  var D = 300, vw = window.innerWidth, vh = window.innerHeight, mobile = false, top0 = 0, range = 1;
  function measure() {
    vw = window.innerWidth;
    mobile = vw < 900;
    vh = sticky.offsetHeight || window.innerHeight;
    D = dough.offsetWidth || 300;
    top0 = story.getBoundingClientRect().top + window.scrollY;
    range = Math.max(1, story.offsetHeight - vh);
  }

  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var eOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  /* write styles only when they change */
  var memo = new WeakMap();
  function set(el, tf, op) {
    if (!el) return;
    var c = memo.get(el);
    if (!c) { c = {}; memo.set(el, c); }
    if (tf != null && c.tf !== tf) { el.style.transform = tf; c.tf = tf; }
    if (op != null) {
      var o = Math.round(op * 1000) / 1000;
      if (c.op !== o) { el.style.opacity = o; c.op = o; }
    }
  }

  function loadImg(img) {
    if (!img || !img.getAttribute("data-src")) return;
    if (img.getAttribute("data-srcset")) img.setAttribute("srcset", img.getAttribute("data-srcset"));
    img.setAttribute("src", img.getAttribute("data-src"));
    img.removeAttribute("data-src");
  }
  function loadStepMedia(i) {
    [i, i + 1].forEach(function (k) {
      if (!steps[k]) return;
      Array.prototype.forEach.call(steps[k].querySelectorAll("img[data-src]"), loadImg);
    });
  }

  function drop(el, a, b, zRest) {
    var t = seg(currentP, a, b);
    if (reduce) {
      set(el, "translateZ(" + zRest + "px)", seg(currentP, a, a + (b - a) * 0.5));
      return 1;
    }
    var e = eOut(t);
    var z = lerp(D * 1.15, zRest, e);
    var rot = (1 - e) * -75;
    var s = lerp(1.08, 1, e);
    set(el, "translateZ(" + f2(z) + "px) rotateZ(" + f2(rot) + "deg) scale(" + f2(s) + ")", seg(currentP, a, a + (b - a) * 0.28));
    return t;
  }

  var currentP = 0;
  function render(p) {
    currentP = p;

    /* camera */
    var intro = eOut(seg(p, 0, 0.07));
    var packT = eInOut(seg(p, 0.655, 0.70));
    var flyT = reduce ? 0 : eInOut(seg(p, 0.86, 0.985));
    var tilt = lerp(lerp(14, 56, intro), 40, packT);
    var sc = lerp(lerp(0.88, 1, intro), mobile ? 0.7 : 0.76, packT);
    var ty = packT * D * (mobile ? 0.18 : 0.1);
    var fx = flyT * (mobile ? vw * 0.1 : vw * 0.42) - (mobile ? 0 : packT * D * 0.12);
    var fy = flyT * (mobile ? -vh * 0.72 : -vh * 0.34);
    sc *= lerp(1, mobile ? 0.45 : 0.4, flyT);
    set(rig, "translate3d(" + f2(fx) + "px," + f2(fy + ty) + "px,0) rotateX(" + f2(tilt) + "deg) scale(" + f2(sc) + ")");
    set(spin, "rotateZ(" + f2(reduce ? 0 : p * 250 + flyT * 60) + "deg)");

    /* dough, with an edge disc underneath for thickness */
    set(edge, "translateZ(-5px)", 1);
    set(dough, "translateZ(0px)", 1);

    /* toppings drop on, one layer at a time */
    var tS = drop(sauce, 0.15, 0.245, 3);
    var tC = drop(cheese, 0.28, 0.375, 6);
    var tT = drop(topL, 0.41, 0.505, 9);

    /* shadow of whichever layer is falling */
    var falling = null, zr = 0, tt = 0;
    if (tS > 0 && tS < 1) { falling = sauce; tt = tS; zr = 3; }
    else if (tC > 0 && tC < 1) { falling = cheese; tt = tC; zr = 6; }
    else if (tT > 0 && tT < 1) { falling = topL; tt = tT; zr = 9; }
    if (falling && !reduce) {
      var near = eOut(tt);
      set(shadow, "translateZ(" + (zr - 1.5) + "px) scale(" + f2(lerp(1.3, 0.98, near)) + ")", 0.75 * near * (1 - seg(tt, 0.92, 1)));
    } else set(shadow, null, 0);

    /* the fire */
    if (p > 0.3) loadImg(bgOven);
    if (p > 0.6) loadImg(bgRoad);
    var ovenA = Math.min(seg(p, 0.525, 0.575), 1 - seg(p, 0.645, 0.695));
    set(bgOven, "scale(" + f2(lerp(1.12, 1, seg(p, 0.52, 0.66))) + ")", ovenA);
    set(crust, "translateZ(0.5px)", seg(p, 0.565, 0.62));
    set(glow, "translateZ(14px)", reduce ? 0 : ovenA * 0.85);
    if (temp) {
      var deg = Math.round(lerp(60, 450, seg(p, 0.54, 0.62)) / 5) * 5;
      if (temp._v !== deg) { temp.textContent = deg + "°C"; temp._v = deg; }
    }

    /* the box folds up around the pizza */
    var boxIn = seg(p, 0.67, 0.705);
    for (var i = 0; i < faces.length; i++) set(faces[i], null, boxIn);
    /* turned 180° so the open lid lies away from the camera while the box is flat */
    set(box, "translateZ(-8px) rotateZ(180deg) scale(" + f2(lerp(0.9, 1, eOut(boxIn))) + ")");
    var fFB = eInOut(seg(p, 0.705, 0.755)) * 90;
    var fLR = eInOut(seg(p, 0.715, 0.765)) * 90;
    var lidA = eInOut(seg(p, 0.765, 0.815)) * 90;
    set(flapF, "rotateX(" + f2(fFB) + "deg)");
    set(flapB, "rotateX(" + f2(-fFB) + "deg)");
    set(flapL, "rotateY(" + f2(fLR) + "deg)");
    set(flapR, "rotateY(" + f2(-fLR) + "deg)");
    set(lid, "rotateX(" + f2(-lidA) + "deg)");

    /* the road */
    set(bgRoad, "scale(" + f2(lerp(1.1, 1, seg(p, 0.83, 1))) + ")", seg(p, 0.84, 0.9));

    /* chapter + rail */
    var idx = 0;
    for (var k = 0; k < PH.length; k++) if (p >= PH[k] - 0.0005) idx = k;
    if (idx !== stepIdx) setStep(idx);
    story.classList.toggle("is-started", p > 0.015);
  }

  var stepIdx = -1;
  var inView = false;
  function setStep(i) {
    stepIdx = i;
    loadStepMedia(i);
    steps.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle("is-active", on);
      Array.prototype.forEach.call(s.querySelectorAll("a, button"), function (b) { b.tabIndex = on ? 0 : -1; });
      var v = s.querySelector("video");
      if (v) {
        if (on && inView && FN.canAutoVideo && FN.playVideo) FN.playVideo(v);
        else if (FN.pauseVideo) FN.pauseVideo(v);
      }
    });
    rail.forEach(function (li, k) {
      li.classList.toggle("is-active", k === i);
      li.classList.toggle("is-done", k < i);
      var b = li.querySelector("button");
      if (b) b.setAttribute("aria-current", k === i ? "step" : "false");
    });
  }

  /* smooth follow */
  var target = 0, cur = 0, raf = 0, lastT = 0;
  function progress() { return clamp((window.scrollY - top0) / range); }
  function tick(t) {
    raf = 0;
    var dt = lastT ? Math.min(64, t - lastT) : 16.7;
    lastT = t;
    target = progress();
    var k = reduce ? 1 : 1 - Math.pow(1 - 0.13, dt / 16.7);
    cur += (target - cur) * k;
    if (Math.abs(target - cur) < 0.0003) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
    else lastT = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener("scroll", function () { if (inView) kick(); }, { passive: true });
  var rsz;
  window.addEventListener("resize", function () {
    clearTimeout(rsz);
    rsz = setTimeout(function () { measure(); cur = target = progress(); render(cur); }, 120);
  });
  window.addEventListener("load", function () { measure(); kick(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        inView = x.isIntersecting;
        document.body.classList.toggle("story-on", inView);
        var v = steps[stepIdx] && steps[stepIdx].querySelector("video");
        if (inView) { measure(); kick(); if (v && FN.canAutoVideo && FN.playVideo) FN.playVideo(v); }
        else if (v && FN.pauseVideo) FN.pauseVideo(v);
      });
    }, { threshold: 0 }).observe(story);
  } else inView = true;

  /* rail buttons jump to a chapter */
  rail.forEach(function (li, i) {
    var b = li.querySelector("button");
    if (!b) return;
    b.addEventListener("click", function () {
      measure();
      window.scrollTo({ top: top0 + (PH[i] + 0.035) * range, behavior: reduce ? "auto" : "smooth" });
    });
  });

  measure();
  cur = target = progress();
  render(cur);
})();
