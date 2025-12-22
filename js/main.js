document.addEventListener('DOMContentLoaded', () => {
    // Hero slide content
    const heroContent = [
        {
            title: "Discover the Golden City",
            description: "Experience the timeless beauty of Jaisalmer with our premium desert safaris and cultural tours. Where luxury meets tradition."
        },
        {
            title: "Adventure Awaits in the Desert",
            description: "Embark on thrilling camel safaris, jeep adventures, and cultural experiences that will create memories for a lifetime."
        },
        {
            title: "Explore Ancient Heritage",
            description: "Step into history at the magnificent Jaisalmer Fort and discover the rich cultural tapestry of Rajasthan's Golden City."
        },
        {
            title: "Unforgettable Desert Experiences",
            description: "From sunset camel rides to starlit dinners, immerse yourself in the magic of the Thar Desert with our curated experiences."
        }
    ];

    // Slider Class
    class Slider {
        constructor(containerSelector, options = {}) {
            this.container = document.querySelector(containerSelector);
            if (!this.container) return;

            this.slides = this.container.querySelectorAll(options.slideSelector || '.hero-slide');
            this.prevBtn = document.querySelector(options.prevBtnSelector);
            this.nextBtn = document.querySelector(options.nextBtnSelector);
            this.indicators = document.querySelectorAll(options.indicatorSelector);
            this.heroContent = options.heroContent || null;
            this.heroTitle = options.heroTitle ? document.getElementById(options.heroTitle) : null;
            this.heroDescription = options.heroDescription ? document.getElementById(options.heroDescription) : null;

            this.currentSlide = 0;
            this.slideInterval = null;
            this.autoPlayDelay = options.autoPlayDelay || 5000;
            this.isAutoPlay = options.autoPlay !== false;

            // Touch state
            this.touchStartX = 0;
            this.touchEndX = 0;

            this.init();
        }

        init() {
            // Event Listeners
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                    this.resetAutoSlide();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                    this.resetAutoSlide();
                });
            }

            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    if (index === this.currentSlide) return;
                    const direction = index > this.currentSlide ? 'next' : 'prev';
                    this.goToSlide(index, direction);
                    this.resetAutoSlide();
                });
            });

            // Touch Events
            this.container.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });

            this.container.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });

            // Auto Play
            if (this.isAutoPlay) {
                this.startAutoSlide();
            }
        }

        goToSlide(n, direction = 'next') {
            const nextSlideIndex = (n + this.slides.length) % this.slides.length;
            if (this.currentSlide === nextSlideIndex) return;

            const currentEl = this.slides[this.currentSlide];
            const nextEl = this.slides[nextSlideIndex];

            // Update indicators
            if (this.indicators.length > 0) {
                this.indicators[this.currentSlide].classList.remove('active');
                this.indicators[nextSlideIndex].classList.add('active');
            }

            // Update hero text with fade effect
            if (this.heroContent && this.heroTitle && this.heroDescription) {
                this.heroTitle.style.opacity = '0';
                this.heroDescription.style.opacity = '0';

                setTimeout(() => {
                    this.heroTitle.textContent = this.heroContent[nextSlideIndex].title;
                    this.heroDescription.textContent = this.heroContent[nextSlideIndex].description;
                    this.heroTitle.style.opacity = '1';
                    this.heroDescription.style.opacity = '1';
                }, 300);
            }

            if (direction === 'next') {
                nextEl.classList.remove('prev');
                currentEl.classList.add('prev');
                currentEl.classList.remove('active');
                nextEl.classList.add('active');

                setTimeout(() => {
                    if (!currentEl.classList.contains('active')) {
                        currentEl.classList.remove('prev');
                        currentEl.style.transition = 'none';
                        currentEl.offsetHeight;
                        currentEl.style.transition = '';
                    }
                }, 600);
            } else {
                nextEl.style.transition = 'none';
                nextEl.classList.add('prev');
                nextEl.classList.remove('active');
                nextEl.offsetHeight;
                nextEl.style.transition = '';

                currentEl.classList.remove('active');
                currentEl.classList.remove('prev');

                requestAnimationFrame(() => {
                    nextEl.classList.remove('prev');
                    nextEl.classList.add('active');
                });
            }

            this.currentSlide = nextSlideIndex;
        }

        nextSlide() {
            this.goToSlide(this.currentSlide + 1, 'next');
        }

        prevSlide() {
            this.goToSlide(this.currentSlide - 1, 'prev');
        }

        startAutoSlide() {
            this.slideInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
        }

        resetAutoSlide() {
            if (this.isAutoPlay) {
                clearInterval(this.slideInterval);
                this.startAutoSlide();
            }
        }

        handleSwipe() {
            const swipeThreshold = 50;
            if (this.touchEndX < this.touchStartX - swipeThreshold) {
                this.nextSlide();
                this.resetAutoSlide();
            }
            if (this.touchEndX > this.touchStartX + swipeThreshold) {
                this.prevSlide();
                this.resetAutoSlide();
            }
        }
    }

    // Initialize Hero Slider
    new Slider('.hero', {
        slideSelector: '.hero-slide',
        prevBtnSelector: '.slider-prev',
        nextBtnSelector: '.slider-next',
        indicatorSelector: '.slider-indicator',
        heroContent: heroContent,
        heroTitle: 'heroTitle',
        heroDescription: 'heroDescription'
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');

    // Create Overlay for menu (Sidebar)
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            overlay.classList.toggle('active');

            // Toggle icon
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', () => {
            navLinks.classList.remove('mobile-active');
            overlay.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                overlay.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // CONTACT MODAL LOGIC (Robust Event Delegation)
    document.addEventListener('click', (e) => {
        const contactModal = document.getElementById('contactModal');
        const modalTrigger = e.target.closest('#contactModalTrigger');
        const modalClose = e.target.closest('#contactModalClose');
        const isOutsideClick = e.target === contactModal;

        if (!contactModal) return;

        // Open Modal
        if (modalTrigger) {
            e.preventDefault();
            contactModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Close Modal (X button)
        if (modalClose) {
            e.preventDefault();
            contactModal.classList.remove('active');
            document.body.style.overflow = '';
            return;
        }

        // Close Modal (Outside click)
        if (isOutsideClick) {
            contactModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Mobile Tours Slider
    let mobileSliderInitialized = false;

    const initMobileToursSlider = () => {
        if (mobileSliderInitialized) return; // Prevent multiple inits

        const track = document.getElementById('toursSliderTrack');
        const dotsContainer = document.getElementById('toursSliderDots');

        if (!track || !dotsContainer) return;

        // Clear existing dots
        dotsContainer.innerHTML = '';

        const cards = track.querySelectorAll('.tour-card-mobile');
        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Create dots
        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.slider-dot');

        const updateSlider = () => {
            // Re-query in case of DOM updates, though cards are const
            const cardWidth = cards[0].offsetWidth;
            const gap = 16;
            const offset = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = Math.max(0, Math.min(index, cards.length - 1));
            updateSlider();
        };

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                goToSlide(currentIndex + 1);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                goToSlide(currentIndex - 1);
            }
        };

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        // Update on resize (Single listener)
        window.addEventListener('resize', updateSlider);

        // Initial update
        updateSlider();
        mobileSliderInitialized = true;
    };

    // Initialize mobile slider logic
    const checkAndInitSlider = () => {
        if (window.innerWidth <= 1024) {
            initMobileToursSlider();
        }
    };

    // Run on load
    checkAndInitSlider();

    // Run on resize (throttle if possible, but safe now due to flag)
    window.addEventListener('resize', () => {
        checkAndInitSlider();
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.tour-card, .service-item, .about-text, .about-image').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Scroll Effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            }
        });
    }
    // --- PACKAGE BUILDER LOGIC ---

    const selectedPackage = new Set();
    const packageSummaryBar = document.getElementById('packageSummaryBar');
    const packageCountEl = document.getElementById('packageCount');
    const viewPackageBtn = document.getElementById('viewPackageBtn');
    const packageModal = document.getElementById('packageModal');
    const packageModalClose = document.getElementById('packageModalClose');
    const packageListEl = document.getElementById('packageList');
    const whatsappPackageBtn = document.getElementById('whatsappPackageBtn');

    // Add/Remove Logic
    function togglePackageItem(tourName, button) {
        if (selectedPackage.has(tourName)) {
            selectedPackage.delete(tourName);
            updateButtonState(button, false);
            // Also find duplicates (desktop vs mobile) and update them
            document.querySelectorAll(`.btn-add-package[data-tour="${tourName}"]`).forEach(btn => {
                updateButtonState(btn, false);
            });
        } else {
            selectedPackage.add(tourName);
            updateButtonState(button, true);
            document.querySelectorAll(`.btn-add-package[data-tour="${tourName}"]`).forEach(btn => {
                updateButtonState(btn, true);
            });
        }
        updatePackageUI();
    }

    function updateButtonState(button, isAdded) {
        if (isAdded) {
            button.classList.add('added');
            button.textContent = 'Added to Package';
        } else {
            button.classList.remove('added');
            button.textContent = 'Add to Package';
        }
    }

    function updatePackageUI() {
        const count = selectedPackage.size;
        packageCountEl.textContent = count;

        if (count > 0) {
            packageSummaryBar.classList.add('active');
        } else {
            packageSummaryBar.classList.remove('active');
            // Close modal if open and empty
            if (packageModal.classList.contains('active')) {
                packageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    // Modal Logic
    function openPackageModal() {
        packageListEl.innerHTML = ''; // Clear list

        selectedPackage.forEach(tour => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${tour}</span>
                <button class="package-item-remove" title="Remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            // Remove functionality inside modal
            li.querySelector('.package-item-remove').addEventListener('click', () => {
                selectedPackage.delete(tour);
                updatePackageUI();
                // Update buttons on page
                document.querySelectorAll(`.btn-add-package[data-tour="${tour}"]`).forEach(btn => {
                    updateButtonState(btn, false);
                });
                // Re-render modal if still open and has items, else close
                if (selectedPackage.size > 0) {
                    openPackageModal();
                }
            });

            packageListEl.appendChild(li);
        });

        packageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Handle Form Submission
    const packageInquiryForm = document.getElementById('packageInquiryForm');
    if (packageInquiryForm) {
        packageInquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('pkgName').value;
            const phone = document.getElementById('pkgPhone').value;
            const date = document.getElementById('pkgDate').value;
            const guests = document.getElementById('pkgGuests').value;
            const packageItems = Array.from(selectedPackage).join(', ');

            const message = `*New Package Inquiry*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Date:* ${date}\n*Guests:* ${guests}\n\n*Selected Experiences:*\n${packageItems}\n\nPlease provide me with a quote and availability.`;

            const whatsappUrl = `https://wa.me/919079881992?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // Event Listeners
    // Use delegation for buttons (since some might be in dynamic slider)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-package')) {
            e.preventDefault();
            const tourName = e.target.dataset.tour;
            togglePackageItem(tourName, e.target);
        }
    });

    if (viewPackageBtn) {
        viewPackageBtn.addEventListener('click', openPackageModal);
    }

    if (packageModalClose) {
        packageModalClose.addEventListener('click', () => {
            packageModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === packageModal) {
            packageModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
