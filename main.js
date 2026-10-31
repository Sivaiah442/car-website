/**
 * NOCTIS — Scrollytelling Engine & Interactive Experience
 * Plain Vanilla JavaScript (ES6+)
 */

(function () {
  'use strict';

  // Check Reduced Motion Preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.body.classList.add('reduce-motion');
  }

  /* ==========================================================================
     1. UTILITY FUNCTIONS
     ========================================================================== */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const lerp = (start, end, factor) => start + (end - start) * factor;

  function padNumber(num, length) {
    return String(num).padStart(length, '0');
  }

  function getFramePath(pattern, frameIndex, padLen) {
    return pattern.replace('%s', padNumber(frameIndex, padLen));
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ==========================================================================
     2. FILM GRAIN SYSTEM
     ========================================================================== */
  function initFilmGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Offscreen noise tile
    const tileSize = 128;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = tileSize;
    offCanvas.height = tileSize;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(tileSize, tileSize);
    const buffer32 = new Uint32Array(imgData.data.buffer);

    // Fill with monochromatic noise
    for (let i = 0; i < buffer32.length; i++) {
      const val = Math.floor(Math.random() * 255);
      // RGBA in 32-bit: AABBGGRR
      buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    offCtx.putImageData(imgData, 0, 0);

    let pattern;
    try {
      pattern = ctx.createPattern(offCanvas, 'repeat');
    } catch (e) {
      return;
    }

    function resizeGrain() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeGrain();
    window.addEventListener('resize', debounce(resizeGrain, 150));

    // Shift pattern randomly ~8 times per second (every ~125ms)
    let lastTime = 0;
    const interval = 125;

    function renderGrain(now) {
      if (now - lastTime >= interval) {
        lastTime = now;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const offsetX = Math.floor(Math.random() * tileSize);
        const offsetY = Math.floor(Math.random() * tileSize);
        ctx.translate(offsetX, offsetY);
        ctx.fillStyle = pattern;
        ctx.fillRect(-offsetX, -offsetY, canvas.width + tileSize, canvas.height + tileSize);
        ctx.restore();
      }
      requestAnimationFrame(renderGrain);
    }
    requestAnimationFrame(renderGrain);
  }

  /* ==========================================================================
     3. CUSTOM CURSOR ("THE HEADLIGHT")
     ========================================================================== */
  function initCustomCursor() {
    const cursor = document.getElementById('headlight-cursor');
    if (!cursor || prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const labelEl = cursor.querySelector('.cursor-label');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Click brightness burst (120ms)
    window.addEventListener('mousedown', () => {
      cursor.classList.add('cursor--active');
      setTimeout(() => cursor.classList.remove('cursor--active'), 120);
    });

    // Cursor morph listeners
    function updateCursorTarget(e) {
      const target = e.target.closest('[data-cursor], a, button, .lineup-slide');
      if (target) {
        let label = target.getAttribute('data-cursor');
        if (!label) {
          if (target.classList.contains('lineup-slide')) {
            label = target.classList.contains('is-expanded') ? 'CONFIGURE' : 'OPEN';
          } else if (target.tagName === 'A' || target.tagName === 'BUTTON') {
            label = 'VIEW';
          }
        }
        cursor.classList.add('cursor--hover');
        if (labelEl) labelEl.textContent = label || '';
        isHovering = true;
      } else if (isHovering) {
        cursor.classList.remove('cursor--hover');
        if (labelEl) labelEl.textContent = '';
        isHovering = false;
      }
    }

    document.addEventListener('mouseover', updateCursorTarget, { passive: true });

    // Smooth Lerp loop (0.18 factor)
    function renderCursor() {
      cursorX = lerp(cursorX, mouseX, 0.18);
      cursorY = lerp(cursorY, mouseY, 0.18);
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  /* ==========================================================================
     4. HEADER & NAV SCROLL HIDE/SHOW
     ========================================================================== */
  function initHeaderNav() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    const threshold = 8;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentScrollY > 100) {
          header.classList.add('nav--hidden');
        } else if (diff < 0) {
          header.classList.remove('nav--hidden');
        }
        lastScrollY = currentScrollY;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     5. STATEMENT WORD-BY-WORD SCROLL REVEAL
     ========================================================================== */
  function initStatementSection() {
    const section = document.getElementById('statement');
    const textContainer = document.getElementById('statement-text');
    if (!section || !textContainer) return;

    const sentence = CONFIG.statement.text;
    const words = sentence.split(' ');
    textContainer.innerHTML = '';

    const wordSpans = words.map((word) => {
      const span = document.createElement('span');
      span.className = 'statement-word';
      span.textContent = word;
      textContainer.appendChild(span);
      return span;
    });

    function updateStatement() {
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      // Start reveal as section enters center, finish before it exits
      const start = winH * 0.85;
      const end = winH * 0.15;
      const progress = clamp((start - rect.top) / (start - end), 0, 1);

      const totalWords = wordSpans.length;
      wordSpans.forEach((span, i) => {
        const wordStart = i / totalWords;
        const wordEnd = (i + 1) / totalWords;
        const wordProgress = clamp((progress - wordStart) / (wordEnd - wordStart), 0, 1);
        const opacity = lerp(0.15, 1.0, wordProgress);
        span.style.opacity = opacity.toFixed(3);
      });
    }

    window.addEventListener('scroll', updateStatement, { passive: true });
    updateStatement();
  }

  /* ==========================================================================
     6. LINEUP ACCORDION INTERACTION
     ========================================================================== */
  function initLineupAccordion() {
    const container = document.getElementById('lineup-container');
    const section = document.getElementById('lineup');
    if (!container || !section) return;

    const models = CONFIG.lineup.models;
    container.innerHTML = '';

    const slides = models.map((model, idx) => {
      const isDefault = idx === 0; // GT-E open by default

      const slide = document.createElement('button');
      slide.type = 'button';
      slide.className = `lineup-slide ${isDefault ? 'is-expanded' : ''}`;
      slide.setAttribute('aria-expanded', isDefault ? 'true' : 'false');
      slide.setAttribute('aria-label', `${model.name} — ${model.tagline}`);
      slide.dataset.id = model.id;

      // Color Swatches HTML
      const swatchesHtml = model.colors.map((c, sIdx) => `
        <span class="swatch ${sIdx === 0 ? 'is-active' : ''}" style="background-color: ${c};" data-color="${c}" aria-label="Color ${c}"></span>
      `).join('');

      slide.innerHTML = `
        <!-- Closed Slide Thumbnail & Vertical Title -->
        <img class="slide-closed-thumb" src="${model.image}" alt="" loading="lazy">
        <div class="slide-closed-view">
          <span class="hud-mono slide-number">${model.number}</span>
          <span class="hud-mono slide-vertical-name">${model.name}</span>
        </div>

        <!-- Open Slide Expanded View -->
        <div class="slide-open-view">
          <div class="slide-open-top">
            <span class="hud-mono section-label"><span class="label-tick"></span>${model.number} / 05</span>
            <h3 class="display-title slide-open-title">${model.name}</h3>
          </div>

          <div class="slide-car-stage">
            <img class="slide-car-image" src="${model.image}" alt="${model.alt}" loading="lazy">
          </div>

          <div class="slide-open-bottom">
            <p class="slide-tagline">${model.tagline}</p>

            <div class="slide-specs-row hud-mono">
              <div class="spec-col">
                <span class="spec-col-label">RANGE</span>
                <span class="spec-col-val">${model.specs.range}</span>
              </div>
              <div class="spec-col">
                <span class="spec-col-label">0–100 KM/H</span>
                <span class="spec-col-val">${model.specs.accel}</span>
              </div>
              <div class="spec-col">
                <span class="spec-col-label">POWER</span>
                <span class="spec-col-val">${model.specs.power}</span>
              </div>
            </div>

            <div class="slide-actions-row">
              <div class="swatch-group">
                ${swatchesHtml}
              </div>
              <a href="#reserve" class="text-link" data-cursor="RESERVE">Configure →</a>
            </div>
          </div>
        </div>
      `;

      container.appendChild(slide);
      return slide;
    });

    // Expand Slide Handler
    function expandSlide(targetSlide) {
      if (targetSlide.classList.contains('is-expanded')) return;

      slides.forEach((s) => {
        const isTarget = s === targetSlide;
        s.classList.toggle('is-expanded', isTarget);
        s.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
      });

      // Update cursor label if headlight cursor is active
      const cursorLabel = document.querySelector('.cursor-label');
      if (cursorLabel && document.getElementById('headlight-cursor').classList.contains('cursor--hover')) {
        cursorLabel.textContent = 'CONFIGURE';
      }
    }

    // Debounced mouseenter for desktop
    const debouncedExpand = debounce(expandSlide, 80);

    slides.forEach((slide, index) => {
      // Hover (desktop)
      slide.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) {
          debouncedExpand(slide);
        }
      });

      // Tap / Click (touch and mouse)
      slide.addEventListener('click', (e) => {
        // Handle swatch click
        const swatch = e.target.closest('.swatch');
        if (swatch) {
          e.stopPropagation();
          const swatches = slide.querySelectorAll('.swatch');
          swatches.forEach(sw => sw.classList.remove('is-active'));
          swatch.classList.add('is-active');
          return;
        }

        // Prevent navigation click interception
        if (e.target.closest('a')) return;

        expandSlide(slide);
      });

      // Keyboard navigation (Arrow keys)
      slide.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (index + 1) % slides.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (index - 1 + slides.length) % slides.length;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          expandSlide(slides[nextIndex]);
          slides[nextIndex].focus();
        }
      });
    });

    // Section Scroll Entrance Animation (Stagger 40px rise)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          slides.forEach((s) => s.classList.add('is-in-view'));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(section);
  }

  /* ==========================================================================
     7. PINNED SCROLLYTELLING ENGINE (HERO & DISMANTLE)
     ========================================================================== */
  class ScrollytellingSection {
    constructor(options) {
      this.wrapper = document.getElementById(options.wrapperId);
      this.canvas = document.getElementById(options.canvasId);
      this.progressLine = document.getElementById(options.progressLineId);
      this.config = options.config;
      this.onProgress = options.onProgress || null;

      if (!this.wrapper || !this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.isMobile = window.innerWidth < 768;
      this.pathPattern = this.isMobile ? this.config.mobilePath : this.config.desktopPath;
      this.frameCount = this.config.frameCount;
      this.padLength = this.config.padLength || 4;

      this.frames = new Array(this.frameCount);
      this.loadedIndices = new Set();
      this.currentFrame = 0;
      this.targetFrame = 0;
      this.lastDrawnFrame = -1;
      this.progress = 0;

      this.initCanvasSize();
      window.addEventListener('resize', debounce(() => {
        this.initCanvasSize();
        this.checkMobileSwitch();
        this.drawCurrentFrame();
      }, 150));
    }

    initCanvasSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    checkMobileSwitch() {
      const currentlyMobile = window.innerWidth < 768;
      if (currentlyMobile !== this.isMobile) {
        this.isMobile = currentlyMobile;
        this.pathPattern = this.isMobile ? this.config.mobilePath : this.config.desktopPath;
        // Clear caches and reload
        this.frames = new Array(this.frameCount);
        this.loadedIndices.clear();
        this.preloadBatch(1, Math.min(40, this.frameCount));
      }
    }

    preloadFrame(index) {
      if (this.frames[index - 1]) return Promise.resolve(this.frames[index - 1]);

      return new Promise((resolve) => {
        const img = new Image();
        const src = getFramePath(this.pathPattern, index, this.padLength);
        img.src = src;

        const onDone = () => {
          this.frames[index - 1] = img;
          this.loadedIndices.add(index);
          resolve(img);
        };

        if ('decode' in img) {
          img.decode().then(onDone).catch(onDone);
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      });
    }

    async preloadBatch(startIndex, endIndex) {
      const promises = [];
      for (let i = startIndex; i <= endIndex; i++) {
        promises.push(this.preloadFrame(i));
      }
      return Promise.all(promises);
    }

    async preloadRemainingInBackground() {
      // Background load remaining frames sequentially or in small chunks
      const chunkSize = 15;
      for (let i = 1; i <= this.frameCount; i += chunkSize) {
        const end = Math.min(i + chunkSize - 1, this.frameCount);
        await this.preloadBatch(i, end);
        // Small yield so main thread stays responsive
        await new Promise(r => setTimeout(r, 16));
      }
    }

    getNearestLoadedFrame(targetIndex) {
      if (this.loadedIndices.has(targetIndex) && this.frames[targetIndex - 1]) {
        return this.frames[targetIndex - 1];
      }
      // Search nearest available frame
      let bestDist = Infinity;
      let bestIdx = -1;
      for (const loaded of this.loadedIndices) {
        const dist = Math.abs(loaded - targetIndex);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = loaded;
        }
      }
      return bestIdx !== -1 ? this.frames[bestIdx - 1] : null;
    }

    updateScroll() {
      const rect = this.wrapper.getBoundingClientRect();
      const scrollDist = this.wrapper.offsetHeight - window.innerHeight;
      if (scrollDist <= 0) return;

      this.progress = clamp(-rect.top / scrollDist, 0, 1);
      this.targetFrame = Math.round(this.progress * (this.frameCount - 1)) + 1;

      if (this.progressLine) {
        this.progressLine.style.transform = `scaleX(${this.progress})`;
      }

      if (this.onProgress) {
        this.onProgress(this.progress, this.targetFrame);
      }
    }

    updateLerp() {
      this.currentFrame += (this.targetFrame - this.currentFrame) * 0.15;
      const rounded = Math.round(this.currentFrame);
      if (rounded !== this.lastDrawnFrame) {
        this.drawFrame(rounded);
        this.lastDrawnFrame = rounded;
      }
    }

    drawCurrentFrame() {
      const frameToDraw = this.lastDrawnFrame > 0 ? this.lastDrawnFrame : 1;
      this.drawFrame(frameToDraw);
    }

    drawFrame(frameIndex) {
      const img = this.getNearestLoadedFrame(frameIndex);
      if (!img || !img.naturalWidth) return;

      const canvasW = this.width;
      const canvasH = this.height;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      this.ctx.clearRect(0, 0, canvasW, canvasH);

      // Fit Rule:
      // Landscape: cover-fit
      // Portrait (< 1 aspect ratio): contain-fit vertically centered on --asphalt (#07080A)
      const isPortrait = canvasW < canvasH;
      let drawW, drawH, drawX, drawY;

      if (!isPortrait) {
        // Landscape Cover-fit
        const scale = Math.max(canvasW / imgW, canvasH / imgH);
        drawW = imgW * scale;
        drawH = imgH * scale;
        drawX = (canvasW - drawW) / 2;
        drawY = (canvasH - drawH) / 2;
      } else {
        // Portrait Contain-fit
        const scale = canvasW / imgW;
        drawW = canvasW;
        drawH = imgH * scale;
        drawX = 0;
        drawY = (canvasH - drawH) / 2;
      }

      this.ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Fade canvas to solid black over the last 5% of scroll (progress 0.95 -> 1.0)
      if (this.config.fadeToBlackStart && this.progress >= this.config.fadeToBlackStart) {
        const fadeProgress = (this.progress - this.config.fadeToBlackStart) / (1 - this.config.fadeToBlackStart);
        this.ctx.fillStyle = '#07080A';
        this.ctx.globalAlpha = clamp(fadeProgress, 0, 1);
        this.ctx.fillRect(0, 0, canvasW, canvasH);
        this.ctx.globalAlpha = 1.0;
      }
    }
  }

  /* ==========================================================================
     8. HERO HUD & CHAPTERS CONTROLLER
     ========================================================================== */
  function initHeroHUD(heroScrolly) {
    const chapterText = document.getElementById('hud-chapter-text');
    const speedVal = document.getElementById('hud-speed-val');
    const distVal = document.getElementById('hud-dist-val');

    const chapters = CONFIG.hero.chapters.map(ch => ({
      ...ch,
      el: document.getElementById(ch.id)
    }));

    heroScrolly.onProgress = function (progress) {
      // Speed and Distance HUD
      const currentSpeed = Math.round(progress * CONFIG.hero.speedMax);
      const currentDist = (progress * CONFIG.hero.distanceMax).toFixed(1);

      if (speedVal) {
        speedVal.innerHTML = `${padNumber(currentSpeed, 3)} <span class="hud-unit">KM/H</span>`;
      }
      if (distVal) {
        distVal.innerHTML = `${currentDist} <span class="hud-unit">KM</span>`;
      }

      // Active Chapter Evaluation
      let activeChapterIdx = 0;
      chapters.forEach((ch, idx) => {
        const isActive = progress >= ch.start && progress <= ch.end;
        if (ch.el) {
          ch.el.classList.toggle('is-active', isActive);
        }
        if (isActive) {
          activeChapterIdx = idx;
        }
      });

      if (chapterText) {
        chapterText.textContent = `${padNumber(activeChapterIdx + 1, 2)} / 04`;
      }
    };
  }

  /* ==========================================================================
     9. DISMANTLE CALLOUTS CONTROLLER
     ========================================================================== */
  function initDismantleCallouts(dismantleScrolly) {
    const container = document.getElementById('dismantle-callouts');
    if (!container) return;

    const callouts = CONFIG.dismantle.callouts;
    container.innerHTML = '';

    const calloutEls = callouts.map((c) => {
      const item = document.createElement('div');
      item.className = 'callout-item';
      item.id = `callout-${c.id}`;

      // Line vector: from dot (c.dot.x%, c.dot.y%) to textPos
      item.innerHTML = `
        <div class="callout-dot" style="left: ${c.dot.x}%; top: ${c.dot.y}%;"></div>
        <svg class="callout-svg">
          <line class="callout-line" 
            x1="${c.dot.x}%" y1="${c.dot.y}%" 
            x2="${c.textPos.x}%" y2="${c.textPos.y}%" />
        </svg>
        <div class="callout-content" style="left: ${c.textPos.x}%; top: ${c.textPos.y}%;">
          <span class="callout-label">${c.label}</span>
          <span class="callout-text">${c.text}</span>
        </div>
      `;

      container.appendChild(item);
      return { ...c, el: item };
    });

    dismantleScrolly.onProgress = function (progress) {
      calloutEls.forEach((c) => {
        const isVisible = progress >= c.triggerProgress;
        c.el.classList.toggle('is-visible', isVisible);
      });
    };
  }

  /* ==========================================================================
     10. PRELOADER & INITIALIZATION ORCHESTRATOR
     ========================================================================== */
  async function startExperience() {
    const preloader = document.getElementById('preloader');
    const preloaderLine = document.getElementById('preloader-line');
    const preloaderCount = document.getElementById('preloader-count');

    // 1. Initialize Global UI Components
    initFilmGrain();
    initCustomCursor();
    initHeaderNav();
    initStatementSection();
    initLineupAccordion();

    // 2. Initialize Scrollytelling Instances
    const heroScrolly = new ScrollytellingSection({
      wrapperId: 'hero',
      canvasId: 'hero-canvas',
      progressLineId: 'hero-progress-line',
      config: CONFIG.hero
    });

    const dismantleScrolly = new ScrollytellingSection({
      wrapperId: 'dismantle',
      canvasId: 'dismantle-canvas',
      progressLineId: 'dismantle-progress-line',
      config: CONFIG.dismantle
    });

    initHeroHUD(heroScrolly);
    initDismantleCallouts(dismantleScrolly);

    // Main RAF Loop for Pinned Canvas Scrubbing
    function mainScrollyLoop() {
      heroScrolly.updateScroll();
      heroScrolly.updateLerp();

      dismantleScrolly.updateScroll();
      dismantleScrolly.updateLerp();

      requestAnimationFrame(mainScrollyLoop);
    }
    requestAnimationFrame(mainScrollyLoop);

    // 3. Preload Gate: Load Hero frames 1–40
    const initialBatchCount = CONFIG.hero.preloadInitialCount || 40;
    let loadedCount = 0;

    for (let i = 1; i <= initialBatchCount; i++) {
      await heroScrolly.preloadFrame(i);
      loadedCount++;
      const percent = Math.round((loadedCount / initialBatchCount) * 100);

      if (preloaderLine) {
        preloaderLine.style.transform = `translateX(-50%) scaleX(${percent / 100})`;
      }
      if (preloaderCount) {
        preloaderCount.textContent = `${padNumber(percent, 3)}%`;
      }
    }

    // Preload first frame of dismantle so it's ready when user arrives
    await dismantleScrolly.preloadFrame(1);

    // Draw initial frames
    heroScrolly.drawFrame(1);
    dismantleScrolly.drawFrame(1);

    // 4. Reveal Page
    if (preloaderLine) {
      preloaderLine.classList.add('flash'); // Turns brighter on exit
    }

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('is-hidden');
      }
      document.body.classList.remove('is-loading');

      // 5. Continue loading the rest of the Hero frames, then Dismantle in background
      (async function backgroundLoader() {
        await heroScrolly.preloadRemainingInBackground();
        await dismantleScrolly.preloadRemainingInBackground();
      })();
    }, 400);
  }

  // DOM Content Loaded Handler
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExperience);
  } else {
    startExperience();
  }

})();

