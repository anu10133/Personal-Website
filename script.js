// =====================================================
// FULLSTACKX LANDING PAGE - JAVASCRIPT
// =====================================================

// =====================================================
// 1. SMOOTH SCROLLING & NAVIGATION
// =====================================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.hamburger = document.getElementById('hamburger');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMenu());

        // Close menu when link is clicked
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Active link highlighting
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateActiveLink() {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }
}

// =====================================================
// 2. SCROLL TO TOP BUTTON
// =====================================================

class ScrollToTop {
    constructor() {
        this.btn = document.getElementById('scrollToTopBtn');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.toggleButton());
        this.btn.addEventListener('click', () => this.scrollTop());
    }

    toggleButton() {
        if (window.pageYOffset > 300) {
            this.btn.classList.add('show');
        } else {
            this.btn.classList.remove('show');
        }
    }

    scrollTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// =====================================================
// 3. INTERSECTION OBSERVER FOR ANIMATIONS
// =====================================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.init();
    }

    init() {
        // Observe cards and elements
        const elementsToObserve = document.querySelectorAll(
            '.outcome-card, .benefit-item, .timeline-item, .mentor-card, .feature-item'
        );

        elementsToObserve.forEach(element => {
            this.observer.observe(element);
        });
    }

    animateElement(element) {
        element.classList.add('scale-in');
        element.style.opacity = '1';
    }
}

// =====================================================
// 4. BUTTON INTERACTIONS
// =====================================================

class ButtonInteractions {
    constructor() {
        this.enrollBtn = document.getElementById('enrollBtn');
        this.brochureBtn = document.getElementById('brochureBtn');
        this.contactForm = document.getElementById('contactForm');

        this.init();
    }

    init() {
        // Enroll Now button
        this.enrollBtn.addEventListener('click', () => {
            this.showNotification('✓ Enrollment portal opening soon!', 'success');
            // In production, redirect to enrollment page
            // window.location.href = '/enroll';
        });

        // Download Brochure button
        this.brochureBtn.addEventListener('click', () => {
            this.downloadBrochure();
        });

        // Contact Form
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    }

    downloadBrochure() {
        // Create a virtual link and trigger download
        const link = document.createElement('a');
        link.href = '#'; // Replace with actual brochure URL
        link.download = 'FullStackX_Brochure.pdf';
        
        this.showNotification('📄 Brochure download starting...', 'info');
        
        // In production:
        // link.click();
    }

    handleFormSubmit() {
        const formData = new FormData(this.contactForm);
        
        // Show loading state
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showNotification('✓ Message sent successfully!', 'success');
            this.contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInLeft 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// =====================================================
// 5. FORM UTILITIES
// =====================================================

class FormValidator {
    constructor(form) {
        this.form = form;
        this.inputs = form.querySelectorAll('input, textarea');
        this.init();
    }

    init() {
        this.inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.removeError(input));
        });
    }

    validateField(field) {
        if (!field.value.trim()) {
            this.showError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && !this.isValidEmail(field.value)) {
            this.showError(field, 'Please enter a valid email');
            return false;
        }

        this.removeError(field);
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showError(field, message) {
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: #ef4444;
            font-size: 0.85rem;
            margin-top: 4px;
            display: block;
        `;
        
        field.parentElement.appendChild(errorEl);
        field.style.borderColor = '#ef4444';
    }

    removeError(field) {
        const error = field.parentElement.querySelector('.error-message');
        if (error) error.remove();
        field.style.borderColor = '';
    }
}

// =====================================================
// 6. PARALLAX EFFECT
// =====================================================

class ParallaxEffect {
    constructor() {
        this.heroBackground = document.querySelector('.hero-background');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.updateParallax());
    }

    updateParallax() {
        if (this.heroBackground) {
            const scrolled = window.pageYOffset;
            this.heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    }
}

// =====================================================
// 7. COUNTER ANIMATION FOR STATS
// =====================================================

class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat h3');
        this.observerOptions = {
            threshold: 0.5
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.init();
    }

    init() {
        this.counters.forEach(counter => {
            this.observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 50);

        let current = start;

        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(interval);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 50);
    }
}

// =====================================================
// 8. TOOLTIP SYSTEM
// =====================================================

class Tooltip {
    constructor() {
        this.tooltips = document.querySelectorAll('[data-tooltip]');
        this.init();
    }

    init() {
        this.tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', (e) => this.show(e.target));
            tooltip.addEventListener('mouseleave', (e) => this.hide(e.target));
        });
    }

    show(element) {
        const text = element.getAttribute('data-tooltip');
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-popup';
        tooltipEl.textContent = text;
        tooltipEl.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            white-space: nowrap;
            pointer-events: none;
            z-index: 1000;
            animation: fadeIn 0.2s ease;
        `;

        const rect = element.getBoundingClientRect();
        tooltipEl.style.top = (rect.top - 40) + 'px';
        tooltipEl.style.left = (rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2) + 'px';

        element.tooltipElement = tooltipEl;
        document.body.appendChild(tooltipEl);
    }

    hide(element) {
        if (element.tooltipElement) {
            element.tooltipElement.remove();
            delete element.tooltipElement;
        }
    }
}

// =====================================================
// 9. LAZY LOADING FOR IMAGES
// =====================================================

class LazyLoadImages {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.observerOptions = {
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.init();
    }

    init() {
        this.images.forEach(img => {
            this.observer.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
    }
}

// =====================================================
// 10. KEYBOARD ACCESSIBILITY
// =====================================================

class KeyboardAccessibility {
    constructor() {
        this.init();
    }

    init() {
        // Close mobile menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const navMenu = document.getElementById('navMenu');
                const hamburger = document.getElementById('hamburger');
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Skip to main content
        this.addSkipLink();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#home';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            border-radius: 4px;
            z-index: 10000;
            text-decoration: none;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// =====================================================
// 11. PERFORMANCE MONITORING
// =====================================================

class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Log performance metrics
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }
        });

        // Monitor Core Web Vitals (if available)
        this.monitorWebVitals();
    }

    monitorWebVitals() {
        if ('web-vital' in window) {
            try {
                import('web-vital').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                    getCLS(metric => console.log('CLS:', metric));
                    getFID(metric => console.log('FID:', metric));
                    getFCP(metric => console.log('FCP:', metric));
                    getLCP(metric => console.log('LCP:', metric));
                    getTTFB(metric => console.log('TTFB:', metric));
                });
            } catch (e) {
                console.log('Web Vitals not available');
            }
        }
    }
}

// =====================================================
// 12. INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    new Navigation();
    new ScrollToTop();
    new ScrollAnimations();
    new ButtonInteractions();
    new FormValidator(document.getElementById('contactForm'));
    new ParallaxEffect();
    new CounterAnimation();
    new Tooltip();
    new LazyLoadImages();
    new KeyboardAccessibility();
    new PerformanceMonitor();

    console.log('✓ FullStackX Landing Page Initialized');
});

// =====================================================
// 13. UTILITY FUNCTIONS
// =====================================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Add active class to elements based on scroll position
 */
function setActiveClass() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const id = section.getAttribute('id');

        if (rect.top <= 200 && rect.bottom >= 200) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').slice(1) === id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Listen for scroll with throttle for performance
window.addEventListener('scroll', throttle(setActiveClass, 100));

// =====================================================
// 14. ANALYTICS & TRACKING
// =====================================================

class Analytics {
    constructor() {
        this.init();
    }

    init() {
        // Track button clicks
        this.trackElementClicks('.btn');
        
        // Track form submissions
        this.trackFormSubmissions();
        
        // Track navigation clicks
        this.trackNavigation();
    }

    trackElementClicks(selector) {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('click', (e) => {
                this.sendEvent('button_click', {
                    text: element.textContent,
                    class: element.className
                });
            });
        });
    }

    trackFormSubmissions() {
        document.getElementById('contactForm')?.addEventListener('submit', () => {
            this.sendEvent('form_submit', {
                form: 'contact_form'
            });
        });
    }

    trackNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.sendEvent('navigation', {
                    destination: link.getAttribute('href')
                });
            });
        });
    }

    sendEvent(eventName, eventData = {}) {
        // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
        console.log(`📊 Event: ${eventName}`, eventData);
    }
}

// Initialize analytics
new Analytics();

// =====================================================
// 15. SERVICE WORKER REGISTRATION (for PWA)
// =====================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}