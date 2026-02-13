// KEUB Website JavaScript
// Smooth scrolling, mobile menu, modal, and form handling

// Detect WebP support and add class to body for CSS fallbacks
function detectWebPSupport() {
    const webP = new Image();
    webP.onload = webP.onerror = function() {
        if (webP.height === 2) {
            document.body.classList.add('webp-supported');
        }
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
}

document.addEventListener('DOMContentLoaded', function() {
    // Detect WebP support
    detectWebPSupport();
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
            // Update aria-expanded for screen readers
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Close mobile menu when clicking on a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#contact' || href === '#cta') {
                if (href === '#contact' || href === '#cta') {
                    e.preventDefault();
                    openModal(modal);
                }
                return;
            }
            
            // Handle privacy policy link
            if (href === '#privacy') {
                e.preventDefault();
                const privacyModal = document.getElementById('privacy');
                if (privacyModal) {
                    openModal(privacyModal);
                }
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Dynamically calculate navbar height
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const offsetTop = target.offsetTop - navbarHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Modal functionality
    const modal = document.getElementById('contact');
    const privacyModal = document.getElementById('privacy');
    const ctaButtons = document.querySelectorAll('a[href="#cta"], .btn-primary');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Open modal when clicking CTA buttons (only for #cta or #contact links)
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#cta' || href === '#contact') {
                e.preventDefault();
                openModal(modal);
            }
        });
    });

    // Close modal buttons (for both contact and privacy modals)
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentModal = this.closest('.modal');
            if (currentModal) {
                closeModal(currentModal);
            }
        });
    });

    // Close modal when clicking outside
    [modal, privacyModal].forEach(m => {
        if (m) {
            m.addEventListener('click', function(e) {
                if (e.target === m) {
                    closeModal(m);
                }
            });
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModalElement = document.querySelector('.modal[aria-hidden="false"]');
            if (openModalElement) {
                closeModal(openModalElement);
            }
        }
    });

    let modalTriggerElement = null;
    let focusableElements = null;
    let firstFocusableElement = null;
    let lastFocusableElement = null;

    function openModal(targetModal) {
        const activeModal = targetModal || modal;
        if (activeModal) {
            // Store the element that triggered the modal
            modalTriggerElement = document.activeElement;
            
            activeModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Scroll modal to top to ensure it's visible
            activeModal.scrollTop = 0;
            
            // Get all focusable elements in the modal (excluding close button)
            focusableElements = activeModal.querySelectorAll(
                'a[href], button:not([disabled]):not(.close-modal), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
            );
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Focus the first element (skip close button)
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
            
            // Trap focus within modal (remove existing listener first to prevent duplicates)
            activeModal.removeEventListener('keydown', trapFocus);
            activeModal.addEventListener('keydown', trapFocus);
        }
    }

    function trapFocus(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    }

    function closeModal(targetModal) {
        const activeModal = targetModal || modal;
        if (activeModal) {
            activeModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Remove focus trap
            activeModal.removeEventListener('keydown', trapFocus);
            
            // Return focus to the element that opened the modal
            if (modalTriggerElement) {
                modalTriggerElement.focus();
                modalTriggerElement = null;
            }
        }
    }

    // Form analytics tracking
    const formAnalytics = {
        submissions: 0,
        errors: 0,
        spamAttempts: 0,
        fieldUsage: {
            organization: 0,
            location: 0
        }
    };

    // Form auto-save to localStorage
    function saveFormData() {
        const formData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            organization: document.getElementById('organization')?.value || '',
            location: document.getElementById('location')?.value || '',
            message: document.getElementById('message')?.value || ''
        };
        localStorage.setItem('keub_form_draft', JSON.stringify(formData));
    }

    function loadFormData() {
        const saved = localStorage.getItem('keub_form_draft');
        if (saved) {
            try {
                const formData = JSON.parse(saved);
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const phoneInput = document.getElementById('phone');
                const orgInput = document.getElementById('organization');
                const locInput = document.getElementById('location');
                const msgInput = document.getElementById('message');
                
                if (nameInput && formData.name) nameInput.value = formData.name;
                if (emailInput && formData.email) emailInput.value = formData.email;
                if (phoneInput && formData.phone) phoneInput.value = formData.phone;
                if (orgInput && formData.organization) orgInput.value = formData.organization;
                if (locInput && formData.location) locInput.value = formData.location;
                if (msgInput && formData.message) msgInput.value = formData.message;
                
                // Update character count if message loaded
                if (msgInput && formData.message) {
                    updateCharCount();
                }
            } catch (_e) {
                localStorage.removeItem('keub_form_draft');
            }
        }
    }

    function clearFormData() {
        localStorage.removeItem('keub_form_draft');
    }

    // Character count for message field
    function updateCharCount() {
        const messageInput = document.getElementById('message');
        const charCount = document.getElementById('message-char-count');
        if (messageInput && charCount) {
            const length = messageInput.value.length;
            const maxLength = messageInput.getAttribute('maxlength') || 5000;
            charCount.textContent = `${length} / ${maxLength} characters`;
            
            // Update styling based on length
            charCount.classList.remove('warning', 'error');
            if (length > maxLength * 0.9) {
                charCount.classList.add('error');
            } else if (length > maxLength * 0.75) {
                charCount.classList.add('warning');
            }
        }
    }

    // Form submission with validation
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        // Load saved form data on page load
        loadFormData();
        
        // Initialize character count
        updateCharCount();

        // Auto-save form data on input (debounced)
        let saveTimeout;
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Clear error messages
                const errorId = this.getAttribute('aria-describedby');
                if (errorId && errorId.includes('error')) {
                    const errorEl = document.getElementById(errorId);
                    if (errorEl) {
                        errorEl.textContent = '';
                    }
                }
                
                // Update character count for message field
                if (this.id === 'message') {
                    updateCharCount();
                }
                
                // Auto-save (debounced)
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(saveFormData, 1000);
            });
        });

        // Track field usage
        const orgInput = document.getElementById('organization');
        const locInput = document.getElementById('location');
        if (orgInput) {
            orgInput.addEventListener('focus', () => formAnalytics.fieldUsage.organization++);
        }
        if (locInput) {
            locInput.addEventListener('focus', () => formAnalytics.fieldUsage.location++);
        }

        // Keyboard shortcut: Ctrl+Enter to submit
        contactForm.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isSubmitting) {
                    contactForm.dispatchEvent(new Event('submit'));
                }
            }
        });

        // Rate limiting: prevent rapid submissions
        let lastSubmissionTime = 0;
        const MIN_SUBMISSION_INTERVAL = 5000; // 5 seconds between submissions
        let isSubmitting = false;

        // Input sanitization function
        function sanitizeInput(input) {
            if (typeof input !== 'string') return '';
            return input
                .trim()
                .replace(/[<>]/g, '') // Remove potential HTML tags
                .substring(0, 10000); // Limit length
        }

        // Handle form submission
        function handleFormSubmit(e) {
            if (e) {
                e.preventDefault();
            }

            // Prevent double submission
            if (isSubmitting) {
                return;
            }

            // Rate limiting check
            const now = Date.now();
            if (now - lastSubmissionTime < MIN_SUBMISSION_INTERVAL) {
                showFormError('Please wait a moment before submitting again.');
                return;
            }
            
            // Spam protection: Check honeypot field
            const honeypot = document.getElementById('website');
            if (honeypot && honeypot.value.trim() !== '') {
                // Bot detected - silently fail (don't show error to avoid revealing honeypot)
                formAnalytics.spamAttempts++;
                return;
            }

            // Clear previous errors
            const errorMessages = contactForm.querySelectorAll('.error-message');
            errorMessages.forEach(el => el.textContent = '');
            
            let isValid = true;
            
            // Get and validate name (declare at function scope)
            const nameInput = document.getElementById('name');
            let nameValue = '';
            if (!nameInput) {
                isValid = false;
            } else {
                nameValue = sanitizeInput(nameInput.value);

                if (!nameValue) {
                    const nameError = document.getElementById('name-error');
                    if (nameError) {
                        nameError.textContent = 'Name is required';
                        nameError.style.display = 'block';
                        nameError.style.visibility = 'visible';
                        nameError.style.opacity = '1';
                    }
                    isValid = false;
                } else if (nameValue.length < 2) {
                    const nameError = document.getElementById('name-error');
                    if (nameError) {
                        nameError.textContent = 'Name must be at least 2 characters';
                        nameError.style.display = 'block';
                        nameError.style.visibility = 'visible';
                    }
                    isValid = false;
                }
            }
            
            // Get and validate email (declare at function scope)
            const emailInput = document.getElementById('email');
            let emailValue = '';
            if (emailInput) {
                emailValue = sanitizeInput(emailInput.value);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailValue) {
                const emailError = document.getElementById('email-error');
                if (emailError) {
                    emailError.textContent = 'Email is required';
                }
                isValid = false;
            } else if (!emailRegex.test(emailValue)) {
                const emailError = document.getElementById('email-error');
                if (emailError) {
                    emailError.textContent = 'Please enter a valid email address';
                }
                isValid = false;
            }
            
            // Get message (optional)
            const messageInput = document.getElementById('message');
            let messageValue = '';
            if (messageInput) {
                messageValue = sanitizeInput(messageInput.value);
            }

            if (!isValid) {
                setTimeout(() => {
                    const errorMessages = contactForm.querySelectorAll('.error-message');
                    let firstErrorElement = null;
                    for (let errorEl of errorMessages) {
                        if (errorEl.textContent.trim() !== '') {
                            firstErrorElement = errorEl;
                            break;
                        }
                    }

                    if (firstErrorElement) {
                        const inputId = firstErrorElement.id.replace('-error', '');
                        const input = document.getElementById(inputId);
                        if (input) {
                            input.focus();
                            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    } else {
                        const nameInput = document.getElementById('name');
                        if (nameInput) {
                            nameInput.focus();
                        }
                    }
                }, 10);
                return;
            }

            // Set submitting state and show loading
            isSubmitting = true;
            const submitBtn = document.getElementById('submit-btn');
            const loadingOverlay = document.getElementById('form-loading-overlay');
            
            // Show loading skeleton
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
            
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'inline';
                submitBtn.disabled = true;
            }
            
            // Get form data (sanitized)
            const phoneInput = document.getElementById('phone');
            const phoneValue = phoneInput && phoneInput.value ? sanitizeInput(phoneInput.value) : '';
            const orgInput = document.getElementById('organization');
            const locInput = document.getElementById('location');
            const formData = {
                name: nameValue,
                email: emailValue,
                phone: phoneValue || "N/A",
                organization: sanitizeInput(orgInput ? orgInput.value : '') || "N/A",
                location: sanitizeInput(locInput ? locInput.value : '') || "N/A",
                message: messageValue || "N/A"
            };

            if (typeof emailjs === 'undefined' || !emailjs.send) {
                const errorMsg = 'EmailJS service is not available. This may be due to browser tracking prevention. Please try disabling tracking prevention for this site or use a different browser.';
                isSubmitting = false;
                formAnalytics.errors++;
                
                // Hide loading overlay
                const loadingOverlay = document.getElementById('form-loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('active');
                }
                
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoading) btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }
                showFormError(errorMsg);
                return;
            }
            
            // Additional check: Verify EmailJS is properly initialized
            try {
                if (!emailjs.send || typeof emailjs.send !== 'function') {
                    throw new Error('EmailJS send function not available');
                }
            } catch (_e) {
                const errorMsg = 'EmailJS failed to initialize. Please refresh the page or check your browser settings.';
                isSubmitting = false;
                formAnalytics.errors++;
                
                const loadingOverlay = document.getElementById('form-loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('active');
                }
                
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoading) btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }
                showFormError(errorMsg);
                return;
            }

            // Send email via EmailJS
            const emailParams = {
                to_email: "Info@keubit.com",
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone,
                organization: formData.organization,
                location: formData.location,
                message: formData.message
            };

            emailjs.send(
                "service_ddfnrxr",
                "template_k28zsup",
                emailParams
            )
            .then(function() {
                lastSubmissionTime = Date.now();
                formAnalytics.submissions++;
                
                // Clear saved form data
                clearFormData();
                
                // Hide loading overlay
                const loadingOverlay = document.getElementById('form-loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('active');
                }
                
                // Show success message
                showFormSuccess();
                
                // Reset form
                contactForm.reset();
                updateCharCount(); // Reset character count
                
                // Reset button state
                isSubmitting = false;
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoading) btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }
            })
            .catch(function(error) {
                formAnalytics.errors++;

                const loadingOverlay = document.getElementById('form-loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('active');
                }

                isSubmitting = false;
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoading) btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }

                // Determine error type and show appropriate message
                let errorMessage = 'There was a problem sending your message. Please try again or email us directly at Info@keubit.com';
                
                if (error.status === 0 || error.status >= 500) {
                    errorMessage = 'Server error. Please try again in a few moments or email us directly at Info@keubit.com';
                } else if (error.status === 400) {
                    errorMessage = 'Invalid form data. Please check your entries and try again.';
                } else if (error.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment before trying again.';
                } else if (error.text && error.text.includes('network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                }
                
                showFormError(errorMessage);
            });
        }
        
        contactForm.addEventListener('submit', handleFormSubmit);

        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                contactForm.dispatchEvent(submitEvent);
            });
        }
    }

    function showFormSuccess() {
        const form = document.querySelector('.contact-form');
        if (!form) return;
        
        // Announce to screen readers
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = 'Form submitted successfully. Thank you! We will be in touch soon.';
        }
        
        // Remove any existing success or error messages
        const existingMessages = form.querySelectorAll('.form-success, .form-error');
        existingMessages.forEach(msg => msg.remove());
        
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.setAttribute('role', 'status');
        successMessage.setAttribute('aria-live', 'polite');
        successMessage.style.cssText = `
            background: #23DC7D;
            color: #0F1A17;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            text-align: center;
            font-weight: 600;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.4s ease, transform 0.4s ease;
        `;
        successMessage.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
                <h3 style="margin-bottom: 1rem; color: #0F1A17;">Thank You!</h3>
                <p style="margin-bottom: 0; color: #0F1A17; font-size: 1.1rem;">We've received your submission and will get back to you soon.</p>
            </div>
        `;
        
        // Hide the form fields
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            if (!group.classList.contains('honeypot-field')) {
                group.style.display = 'none';
            }
        });
        
        // Hide the submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Insert success message at the top of the form
        form.insertBefore(successMessage, form.firstChild);
        
        // Trigger animation
        requestAnimationFrame(() => {
            successMessage.style.opacity = '1';
            successMessage.style.transform = 'translateY(0)';
        });
        
        // Don't auto-close - let user close manually with X button
    }

    function showFormError(customMessage) {
        const form = document.querySelector('.contact-form');
        if (!form) return;
        
        const errorText = customMessage || 'There was a problem sending your message. Please try again or email us directly at Info@keubit.com';
        
        // Announce to screen readers
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = 'Error: ' + errorText;
        }
        
        // Remove any existing success or error messages
        const existingMessages = form.querySelectorAll('.form-success, .form-error');
        existingMessages.forEach(msg => msg.remove());
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.setAttribute('role', 'alert');
        errorMessage.setAttribute('aria-live', 'assertive');
        errorMessage.style.cssText = `
            background: #6B7C76;
            color: #FFFFFF;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            text-align: center;
            font-weight: 600;
        `;
        errorMessage.textContent = errorText;
        
        form.appendChild(errorMessage);
        
        // Focus error message for screen readers
        errorMessage.setAttribute('tabindex', '-1');
        errorMessage.focus();
    }

    // Navbar scroll effect (throttled with requestAnimationFrame)
    let lastScroll = 0;
    let ticking = false;
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(15, 26, 23, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(15, 26, 23, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-feature, .experience-card, .benefit-item, .environment-item, .step, .why-keub-content p, .section-intro, .product-platform-description p, .operator-model, .vision-content, .traction-list li');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Parallax effect for hero section (subtle, throttled)
    const hero = document.querySelector('.hero');
    let parallaxTicking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        }
        parallaxTicking = false;
    }
    
    if (hero) {
        window.addEventListener('scroll', function() {
            if (!parallaxTicking) {
                window.requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        });
    }

    // Hero background carousel
    (function initHeroCarousel() {
        const track = document.getElementById('heroCarouselTrack');
        const dotsContainer = document.getElementById('heroCarouselDots');
        const prevBtn = document.querySelector('.hero-carousel-btn.prev');
        const nextBtn = document.querySelector('.hero-carousel-btn.next');
        const heroSection = document.querySelector('.hero');

        if (!track || !dotsContainer || !heroSection) {
            return;
        }

        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let slides = [];
        let dots = [];
        let currentIndex = 0;
        let autoRotateTimer = null;
        let restartTimeout = null;
        const AUTO_ROTATE_DELAY = 6000;
        const RESTART_AFTER_IDLE = 6000;
        let interactionCount = 0;

        function createPreloadLink(src) {
            if (!src) return;
            try {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            } catch (_e) {}
        }

        function goToSlide(index) {
            if (!slides.length) return;
            const normalizedIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.classList.toggle('is-active', i === normalizedIndex);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('is-active', i === normalizedIndex);
            });
            currentIndex = normalizedIndex;
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoRotate() {
            if (prefersReducedMotion || autoRotateTimer || !slides.length) return;
            autoRotateTimer = window.setInterval(() => {
                nextSlide();
            }, AUTO_ROTATE_DELAY);
        }

        function stopAutoRotate() {
            if (autoRotateTimer) {
                window.clearInterval(autoRotateTimer);
                autoRotateTimer = null;
            }
        }

        function handleUserInteraction() {
            if (restartTimeout) {
                clearTimeout(restartTimeout);
                restartTimeout = null;
            }
            interactionCount += 1;
            if (interactionCount >= 3) {
                stopAutoRotate();
                restartTimeout = setTimeout(() => {
                    interactionCount = 0;
                    restartTimeout = null;
                    if (!prefersReducedMotion) {
                        startAutoRotate();
                    }
                }, RESTART_AFTER_IDLE);
            }
        }

        function attachControls() {
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    handleUserInteraction();
                    prevSlide();
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    handleUserInteraction();
                    nextSlide();
                });
            }

            // Touch swipe
            let touchStartX = 0;
            let touchStartY = 0;
            const SWIPE_THRESHOLD = 40;

            heroSection.addEventListener('touchstart', (e) => {
                if (!e.touches || e.touches.length !== 1) return;
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            }, { passive: true });

            heroSection.addEventListener('touchend', (e) => {
                if (!touchStartX && !touchStartY) return;
                const touch = e.changedTouches && e.changedTouches[0];
                if (!touch) return;

                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                // Only handle mostly horizontal swipes
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
                    handleUserInteraction();
                    if (deltaX < 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }

                touchStartX = 0;
                touchStartY = 0;
            }, { passive: true });
        }

        function supportsWebP() {
            const canvas = document.createElement('canvas');
            if (canvas.getContext && canvas.getContext('2d')) {
                return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            }
            return false;
        }

        function buildCarousel(images) {
            slides = [];
            dots = [];
            track.innerHTML = '';
            dotsContainer.innerHTML = '';
            const useWebP = supportsWebP();

            images.forEach((img, index) => {
                const src = useWebP && img.srcWebp ? img.srcWebp : img.src;
                const slide = document.createElement('div');
                slide.className = 'hero-slide';
                slide.style.backgroundImage = `url('${src}')`;
                if (img.alt) {
                    slide.dataset.alt = img.alt;
                }
                if (index === 0) {
                    slide.classList.add('is-active');
                }
                track.appendChild(slide);
                slides.push(slide);

                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'hero-dot' + (index === 0 ? ' is-active' : '');
                dot.setAttribute('aria-label', img.alt || `Hero image ${index + 1}`);
                dot.addEventListener('click', () => {
                    handleUserInteraction();
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });

            if (images[0]) {
                const firstSrc = useWebP && images[0].srcWebp ? images[0].srcWebp : images[0].src;
                const preloadImg = new Image();
                preloadImg.src = firstSrc;
                createPreloadLink(firstSrc);
            }

            attachControls();

            if (!prefersReducedMotion) {
                startAutoRotate();
            }
        }

        fetch('assets/images/hero/hero-images.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load hero images configuration');
                }
                return response.json();
            })
            .then(config => {
                if (!config || !Array.isArray(config.images) || !config.images.length) {
                    return;
                }
                buildCarousel(config.images);
            })
            .catch(() => {});
    })();
});
