(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.querySelector('[data-scroll-progress]');
  let progressFrame = 0;
  const updateScrollProgress = () => {
    progressFrame = 0;
    if (!progressBar) return;
    const scrollRange = Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight;
    const progress = scrollRange > 0
      ? Math.min(Math.max(root.scrollTop / scrollRange, 0), 1)
      : 0;
    progressBar.style.setProperty('--scroll-progress', progress.toString());
  };
  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(updateScrollProgress);
  };
  if (progressBar) {
    updateScrollProgress();
    window.addEventListener('scroll', requestProgressUpdate, { passive: true });
    window.addEventListener('resize', requestProgressUpdate);
    document.querySelectorAll('.work-example').forEach((example) => {
      example.addEventListener('toggle', requestProgressUpdate);
    });
  }

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const sectionLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -62% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => navObserver.observe(section));
  }

  requestAnimationFrame(() => root.classList.add('is-ready'));
})();


// No automatic prompt. Google applies regional cookie defaults; explicit opt-out
// stops all collection, including cookie-free measurements.
(() => {
  const measurementId = 'G-6VSZ7TZW09';
  if (window.location.hostname.toLowerCase() !== 'mickeysteurer.github.io') return;
  const preferenceKey = 'portfolio-analytics-consent';
  let consent = null;
  let started = false;
  try { consent = localStorage.getItem(preferenceKey); } catch (_) {}
  const privacySignal = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const optedOut = () => consent === 'declined' || privacySignal;
  window['ga-disable-' + measurementId] = optedOut();

  const notice = document.createElement('section');
  notice.className = 'analytics-consent';
  notice.setAttribute('aria-label', 'Analytics preference');
  notice.id = 'analytics-preferences';
  notice.hidden = true;
  notice.innerHTML = '<p data-analytics-status></p><p>Google Analytics helps improve this portfolio. <a href="privacy.html">Privacy details</a></p><div><button type="button" class="analytics-choice" data-allow-analytics>Allow cookies</button><button type="button" class="analytics-choice" data-decline-analytics>Disable analytics</button><button type="button" class="analytics-close" data-close-analytics>Close</button></div>';
  document.body.appendChild(notice);
  const settingsButtons = document.querySelectorAll('[data-analytics-settings]');
  const setOpen = (open) => {
    notice.hidden = !open;
    settingsButtons.forEach(button => button.setAttribute('aria-expanded', String(open)));
  };
  const updateStatus = () => {
    notice.querySelector('[data-analytics-status]').textContent = optedOut()
      ? 'Analytics is disabled in this browser.'
      : consent === 'allowed' ? 'Analytics cookies are enabled in this browser.'
      : 'Default: analytics cookies in the US; cookie-free measurement elsewhere.';
    notice.querySelector('[data-allow-analytics]').disabled = privacySignal;
  };

  const startAnalytics = () => {
    if (optedOut()) return;
    window['ga-disable-' + measurementId] = false;
    if (started) {
      if (consent === 'allowed') window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    // Default denied globally. Google's own region handling permits analytics
    // cookies only in the US; no IP lookup service or timezone guessing.
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('consent', 'default', { analytics_storage: 'granted', region: ['US'] });
    if (consent === 'allowed') gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', false);
    gtag('js', new Date());
    gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(googleTag);
    started = true;

    const sendEvent = (name, parameters) => {
      if (optedOut()) return;
      gtag('event', name, { send_to: measurementId, ...parameters });
    };
    document.addEventListener('click', (event) => {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin ||
          url.pathname !== '/Michael_Steurer_Resume.pdf') return;
      const placement = link.closest('.site-header') ? 'navigation'
        : link.closest('.hero') ? 'hero'
        : link.closest('.contact-section') ? 'contact' : 'other';
      sendEvent('resume_click', {
        link_location: placement,
        resume_action: link.hasAttribute('download') ? 'download' : 'open'
      });
    });
    document.querySelectorAll('details.work-example').forEach((project) => {
      project.addEventListener('toggle', () => {
        if (!project.open) return;
        const title = project.closest('article')?.querySelector('h3')
          || project.querySelector('summary');
        sendEvent('project_open', {
          project_id: project.id,
          project_title: title?.textContent.trim().slice(0, 100) || project.id
        });
      });
    });
  };
  const choose = (value) => {
    consent = value;
    try { localStorage.setItem(preferenceKey, value); } catch (_) {}
    window['ga-disable-' + measurementId] = optedOut();
    if (optedOut()) {
      if (started) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      // Remove this property's existing cookies as well as stopping future hits.
      for (const name of ['_ga', '_ga_6VSZ7TZW09']) {
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=mickeysteurer.github.io';
      }
    }
    if (value === 'allowed') startAnalytics();
    updateStatus();
    setOpen(false);
    settingsButtons[0]?.focus();
  };
  notice.querySelector('[data-allow-analytics]').addEventListener('click', () => choose('allowed'));
  notice.querySelector('[data-decline-analytics]').addEventListener('click', () => choose('declined'));
  notice.querySelector('[data-close-analytics]').addEventListener('click', () => {
    setOpen(false);
    settingsButtons[0]?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || notice.hidden) return;
    setOpen(false);
    settingsButtons[0]?.focus();
  });
  settingsButtons.forEach((button) => {
    button.setAttribute('aria-controls', notice.id);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      updateStatus();
      setOpen(notice.hidden);
      if (!notice.hidden) notice.querySelector('[data-close-analytics]').focus();
    });
  });
  startAnalytics();
})();

