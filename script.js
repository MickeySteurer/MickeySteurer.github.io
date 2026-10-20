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

// Portfolio analytics. Set the public GA4 web-stream measurement ID here.
// An empty ID keeps analytics disabled and makes no requests to Google.
(() => {
  const measurementId = '';
  const productionHost = 'mickeysteurer.github.io';
  if (!/^G-[A-Z0-9]+$/.test(measurementId) ||
      window.location.hostname.toLowerCase() !== productionHost) return;

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(googleTag);

  const sendEvent = (name, parameters) => {
    gtag('event', name, { send_to: measurementId, ...parameters });
  };

  // Track all three resume links without delaying or changing navigation.
  // This event measures link clicks, not confirmed downloads or PDF reads.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
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

  // Native details controls emit toggle when opened or closed.
  // Only opens count; reopening counts as another open.
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
})();
