import { useEffect, useRef } from 'react';

// Adds `is-visible` to the element (and any `.reveal` descendants, staggered)
// the first time it scrolls into view.
export function useReveal({ stagger = 90 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const targets = el.classList.contains('reveal') ? [el] : [...el.querySelectorAll('.reveal')];
          targets.forEach((t, i) => {
            setTimeout(() => t.classList.add('is-visible'), i * stagger);
          });
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger]);

  return ref;
}
