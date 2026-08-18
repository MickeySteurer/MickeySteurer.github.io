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
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
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
