/**
 * GSAP + ScrollTrigger animation system.
 * Auto-detects .reveal elements and animates them on scroll.
 * Uses gsap.to() so CSS initial hidden state (opacity:0) animates TO visible.
 * Cleans up ScrollTriggers on page swap to prevent memory leaks.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initAnimations(): void {
    // Kill all previous ScrollTriggers to prevent duplicates after View Transition
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf('*');

    if (prefersReducedMotion) {
        // Make everything visible immediately
        document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'none';
        });
        document.querySelectorAll('.section-heading').forEach((el) => {
            el.classList.add('revealed');
        });
        return;
    }

    // --- Scroll Progress Bar ---
    const progressBar = document.querySelector('.scroll-progress') as HTMLElement;
    if (progressBar) {
        gsap.to(progressBar, {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
            },
        });
    }

    // --- Header Show/Hide on Scroll Direction ---
    const header = document.querySelector('.site-header') as HTMLElement;
    if (header) {
        const scrollThreshold = 80;

        ScrollTrigger.create({
            start: 'top top',
            end: 'max',
            onUpdate: (self) => {
                const currentScroll = self.scroll();
                if (currentScroll > scrollThreshold) {
                    if (self.direction === 1) {
                        header.classList.add('header-hidden');
                    } else {
                        header.classList.remove('header-hidden');
                    }
                } else {
                    header.classList.remove('header-hidden');
                }
            },
        });
    }

    // --- Hero Text Split Animation ---
    const heroTitle = document.querySelector('.hero h1') as HTMLElement;
    if (heroTitle && !heroTitle.querySelector('.char')) {
        const text = heroTitle.textContent || '';
        heroTitle.innerHTML = text
            .split('')
            .map((char) => `<span class="char" style="opacity:0; display:inline-block; transform:translateY(40px)">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        gsap.to('.hero h1 .char', {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.03,
            ease: 'power3.out',
            delay: 0.2,
        });
    }

    // --- Hero Subtitle + Tagline ---
    const heroSubtitle = document.querySelector('.hero .subtitle') as HTMLElement;
    if (heroSubtitle) {
        gsap.fromTo(heroSubtitle,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.6 }
        );
    }

    const heroTagline = document.querySelector('.hero .tagline') as HTMLElement;
    if (heroTagline) {
        gsap.fromTo(heroTagline,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.8 }
        );
    }

    const heroHint = document.querySelector('.hero .scroll-hint') as HTMLElement;
    if (heroHint) {
        gsap.fromTo(heroHint,
            { opacity: 0 },
            { opacity: 0.5, duration: 1, delay: 1.5 }
        );
    }

    // --- Hero Dot Grid Parallax ---
    const heroDots = document.querySelector('.hero-dots') as HTMLElement;
    if (heroDots) {
        gsap.to(heroDots, {
            y: -80,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.5,
            },
        });
    }

    // --- Scroll Reveal: Fade Up ---
    gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        const stagger = el.dataset.stagger;
        const children = stagger ? el.children : null;

        if (children && children.length > 0) {
            // Parent is just a container — make it visible, animate children
            gsap.set(el, { opacity: 1, y: 0 });
            gsap.fromTo(Array.from(children),
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: parseFloat(stagger),
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        } else {
            gsap.to(el, {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: 'power2.out',
                delay: parseFloat(el.dataset.delay || '0'),
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        }
    });

    // --- Scroll Reveal: Fade Left ---
    gsap.utils.toArray<HTMLElement>('.reveal-left').forEach((el) => {
        gsap.to(el, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            delay: parseFloat(el.dataset.delay || '0'),
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });

    // --- Scroll Reveal: Fade Right ---
    gsap.utils.toArray<HTMLElement>('.reveal-right').forEach((el) => {
        gsap.to(el, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            delay: parseFloat(el.dataset.delay || '0'),
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });

    // --- Scroll Reveal: Scale ---
    gsap.utils.toArray<HTMLElement>('.reveal-scale').forEach((el) => {
        const stagger = el.dataset.stagger;
        const children = stagger ? el.children : null;

        if (children && children.length > 0) {
            gsap.set(el, { opacity: 1, scale: 1 });
            gsap.fromTo(Array.from(children),
                { scale: 0.95, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    stagger: parseFloat(stagger),
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        } else {
            gsap.to(el, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out',
                delay: parseFloat(el.dataset.delay || '0'),
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        }
    });

    // --- Section Heading Underline Reveal ---
    gsap.utils.toArray<HTMLElement>('.section-heading').forEach((el) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => el.classList.add('revealed'),
        });
    });

    // --- 3D Tilt on Quick Link Cards ---
    document.querySelectorAll('.quick-link-card').forEach((card) => {
        const el = card as HTMLElement;

        el.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            gsap.to(el, {
                rotateX,
                rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 800,
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out',
            });
        });
    });

    // --- BibTeX / Abstract Toggle ---
    document.querySelectorAll('.pub-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(
                (btn as HTMLElement).dataset.target || ''
            );
            if (!target) return;

            target.classList.toggle('open');
            btn.classList.toggle('active');
        });
    });

    // --- Copy BibTeX to Clipboard ---
    document.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const pre = btn.parentElement?.querySelector('pre code');
            if (pre) {
                navigator.clipboard.writeText(pre.textContent || '');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }
        });
    });

    // Refresh ScrollTrigger after all setup
    ScrollTrigger.refresh();
}

// Use astro:page-load for both initial and View Transition navigations
document.addEventListener('astro:page-load', initAnimations);
