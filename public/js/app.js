/**
 * One Sip Restaurant Website - Main JavaScript
 * Handles navigation, smooth scrolling, forms, and interactivity
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functionality
    initNavigation();
    initScrollSpy();
    initHeaderScroll();
    initForms();
    initAnimations();
});

/**
 * Navigation - Smooth scroll and mobile menu
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Only handle internal hash links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    // Close mobile menu if open
                    if (navMenu && navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }

                    // Smooth scroll to section
                    smoothScrollTo(targetSection);

                    // Update active link
                    updateActiveNavLink(link);
                }
            }
        });
    });
}

/**
 * Smooth scroll to target element
 * @param {HTMLElement} target - The target element to scroll to
 */
function smoothScrollTo(target) {
    const headerHeight = document.getElementById('nav-header').offsetHeight;
    const targetPosition = target.offsetTop - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Update active navigation link
 * @param {HTMLElement} activeLink - The link to mark as active
 */
function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

/**
 * Scroll Spy - Highlight active section in navigation
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.getElementById('nav-header').offsetHeight;

    // Use Intersection Observer for better performance
    const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight}px 0px -60% 0px`,
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (correspondingLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => observer.observe(section));
}

/**
 * Header Scroll - Hide header on scroll down, show on scroll up
 */
function initHeaderScroll() {
    const header = document.getElementById('nav-header');

    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 100; // Start hiding after scrolling 100px

    // Debounced scroll handler for performance
    const handleScroll = debounce(() => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Prevent negative values
        if (currentScroll < 0) return;

        // If we're near the top, always show header
        if (currentScroll < scrollThreshold) {
            header.classList.remove('header-hidden');
        }
        // Scrolling down - hide header
        else if (currentScroll > lastScrollTop) {
            header.classList.add('header-hidden');
        }
        // Scrolling up - show header
        else {
            header.classList.remove('header-hidden');
        }

        lastScrollTop = currentScroll;
    }, 10);

    window.addEventListener('scroll', handleScroll);
}

/**
 * Form Handling - Reservation and Login forms
 */
function initForms() {
    // Reservation form
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Sign up button
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignupClick);
    }

    // Set minimum date for reservation to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

/**
 * Handle reservation form submission
 * @param {Event} e - The submit event
 */
function handleReservationSubmit(e) {
    e.preventDefault();

    const formMessage = document.getElementById('form-message');
    const form = e.target;

    // Get form data
    const formData = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        guests: form.guests.value,
        date: form.date.value,
        time: form.time.value,
        message: form.message.value
    };

    // Validate form
    if (!validateReservationForm(formData)) {
        showFormMessage(formMessage, 'Please fill in all required fields correctly.', 'error');
        return;
    }

    // TODO: Send data to Firebase or backend
    // For now, simulate successful submission
    console.log('Reservation data:', formData);

    // Show success message
    showFormMessage(formMessage, 'Thank you! Your reservation request has been received. We will contact you shortly to confirm.', 'success');

    // Reset form
    form.reset();

    // Auto-hide message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

/**
 * Validate reservation form data
 * @param {Object} data - The form data to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateReservationForm(data) {
    // Check required fields
    if (!data.name || !data.email || !data.phone || !data.guests || !data.date || !data.time) {
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return false;
    }

    // Validate phone format (basic)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(data.phone) || data.phone.replace(/\D/g, '').length < 10) {
        return false;
    }

    return true;
}

/**
 * Handle login form submission
 * @param {Event} e - The submit event
 */
function handleLoginSubmit(e) {
    e.preventDefault();

    const formMessage = document.getElementById('login-message');
    const form = e.target;

    // Get form data
    const email = form['login-email'].value;
    const password = form['login-password'].value;

    // Validate
    if (!email || !password) {
        showFormMessage(formMessage, 'Please enter both email and password.', 'error');
        return;
    }

    // TODO: Implement Firebase authentication
    // For now, simulate login
    console.log('Login attempt:', { email });

    showFormMessage(formMessage, 'Login functionality coming soon! Please check back later.', 'error');
}

/**
 * Handle signup button click
 */
function handleSignupClick() {
    const formMessage = document.getElementById('login-message');
    showFormMessage(formMessage, 'Sign up functionality coming soon! Please check back later.', 'error');
}

/**
 * Show form message
 * @param {HTMLElement} element - The message element
 * @param {string} message - The message text
 * @param {string} type - 'success' or 'error'
 */
function showFormMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}

/**
 * Initialize animations and scroll effects
 */
function initAnimations() {
    // Add fade-in animation to elements as they come into view
    const animatedElements = document.querySelectorAll('.menu-category, .location-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 100);

                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => animationObserver.observe(el));
}

/**
 * Utility: Debounce function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
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

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        smoothScrollTo,
        validateReservationForm,
        showFormMessage
    };
}
