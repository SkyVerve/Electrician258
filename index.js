// --- COMPONENT INITIALIZERS ---

function initPageComponents() {
    initScrollAnimations();
    initParallaxCards();
    initReviewsSlideshow();
    initAccordions();
}

function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('header nav');
    const links = document.querySelectorAll('.nav-links a, .nav-links button');
    
    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        document.body.classList.toggle('menu-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen.toString());
        toggleBtn.querySelectorAll('.line').forEach(line => line.classList.toggle('open', isOpen));
    });
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Check if we are on mobile and clicking a dropdown button
            if (window.innerWidth <= 768) {
                if (e.currentTarget.classList.contains('nav-link-button')) {
                    const dropdown = e.currentTarget.closest('.dropdown');
                    if(dropdown) {
                        e.preventDefault(); // Prevent navigation
                        // Toggle only the clicked dropdown
                        const wasOpen = dropdown.classList.contains('dropdown-open');
                        
                        // Close all other dropdowns
                        document.querySelectorAll('.dropdown.dropdown-open').forEach(d => {
                           if (d !== dropdown) {
                             d.classList.remove('dropdown-open');
                           }
                        });
                        
                        // Toggle the current one
                        dropdown.classList.toggle('dropdown-open');

                        return; // Stop further processing
                    }
                }
            }

            // Close menu on any link click (if not a dropdown toggle on mobile)
            if (window.innerWidth <= 768) {
                nav.classList.remove('nav-open');
                document.body.classList.remove('menu-open');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.querySelectorAll('.line').forEach(line => line.classList.remove('open'));
            }
        });
    });
}

function initMouseFollower() {
    const follower = document.getElementById('mouse-follower');
    if (!follower) return;
    window.addEventListener('mousemove', (e) => {
        follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.add('in-view');
                
                // Animate stats
                if (target.classList.contains('stat-counter')) {
                    const valueEl = target.querySelector('.stat-value');
                    if (valueEl && !valueEl.dataset.animated) {
                        const endValue = parseInt(target.dataset.value || '0', 10);
                        const suffix = target.dataset.suffix || "";
                        animateCountUp(valueEl, endValue, suffix);
                        valueEl.dataset.animated = "true";
                    }
                }
                
                // Animate radial dials
                if(target.classList.contains('radial-dial')) {
                    const progressCircle = target.querySelector('.dial-progress');
                    const percentage = parseInt(target.dataset.percentage || '0', 10);
                    if(progressCircle) {
                        const radius = progressCircle.r.baseVal.value;
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference - (percentage / 100) * circumference;
                        progressCircle.style.strokeDashoffset = offset;
                    }
                }
                
                observer.unobserve(target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    document.querySelectorAll('.scroll-animate, .stat-counter, .radial-dial').forEach(el => observer.observe(el));
}

function animateCountUp(el, endValue, suffix) {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentCount = Math.floor(progress * endValue);
        el.textContent = currentCount + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
             el.textContent = endValue + suffix;
        }
    }
    requestAnimationFrame(step);
}


function initParallaxCards() {
    document.querySelectorAll('.service-card').forEach(cardEl => {
        cardEl.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = cardEl.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) / (width / 2);
            const y = (e.clientY - top - height / 2) / (height / 2);
            
            cardEl.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.05)`;
            const inner = cardEl.querySelector('.service-card-inner');
            if(inner) inner.style.transform = `translateZ(20px)`;
        });

        cardEl.addEventListener('mouseleave', () => {
            cardEl.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
            const inner = cardEl.querySelector('.service-card-inner');
            if(inner) inner.style.transform = `translateZ(0px)`;
        });
    });
}

function initAccordions() {
    document.querySelectorAll('.accordion-item').forEach(item => {
        const title = item.querySelector('.accordion-title');
        const content = item.querySelector('.accordion-content');
        if (!title || !content) return;

        // Set initial state for already open accordions
        if (item.classList.contains('open')) {
            content.style.maxHeight = `${content.scrollHeight}px`;
        } else {
            content.style.maxHeight = '0px';
        }

        title.addEventListener('click', () => {
            const isOpen = item.classList.toggle('open');
            content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0px';
        });
    });
}

function initReviewsSlideshow() {
    const carousels = document.querySelectorAll('.testimonial-carousel-container');
    carousels.forEach(container => {
        let currentIndex = 0;
        const cards = container.querySelectorAll('.testimonial-card');
        const dots = container.querySelectorAll('.dot');
        const numReviews = cards.length;
        if (numReviews === 0) return;

        let timeoutRef;
        const resetTimeout = () => clearTimeout(timeoutRef);
        const startTimeout = () => {
            resetTimeout();
            timeoutRef = window.setTimeout(() => {
                currentIndex = (currentIndex + 1) % numReviews;
                updateCarousel();
            }, 5000);
        };
        
        const updateCarousel = () => {
             cards.forEach((card, index) => {
                const offset = (index - currentIndex + numReviews) % numReviews;
                let transform = 'translateY(-200%) scale(0.8) translateZ(-500px)';
                let opacity = 0;
                let zIndex = 0;

                if (offset === 0) {
                    transform = 'translateY(0) scale(1) translateZ(0)';
                    opacity = 1;
                    zIndex = 3;
                    card.classList.add('active');
                } else if (offset === 1) {
                    transform = 'translateY(-40px) scale(0.9) translateZ(-80px)';
                    opacity = 1;
                    zIndex = 2;
                    card.classList.remove('active');
                } else if (offset === 2) {
                    transform = 'translateY(-80px) scale(0.8) translateZ(-160px)';
                    opacity = 1;
                    zIndex = 1;
                    card.classList.remove('active');
                } else if (offset === numReviews - 1) {
                    transform = 'translateY(-200%) scale(1) translateZ(0)';
                    opacity = 0;
                    zIndex = 2;
                    card.classList.remove('active');
                } else {
                    opacity = 0;
                    transform = 'translateY(-120px) scale(0.7) translateZ(-240px)';
                    card.classList.remove('active');
                }
                
                if (window.innerWidth <= 768) {
                    // On mobile, use a simple fade-in/out
                    card.style.transform = 'none';
                    card.style.opacity = (offset === 0) ? '1' : '0';
                    card.style.position = (offset === 0) ? 'relative' : 'absolute';
                    card.style.display = (offset === 0) ? 'flex' : 'none';
                } else {
                    card.style.transform = transform;
                    card.style.opacity = opacity.toString();
                }
                card.style.zIndex = zIndex.toString();
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            startTimeout();
        };
        
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const target = e.currentTarget;
                currentIndex = parseInt(target.dataset.slideIndex || '0', 10);
                updateCarousel();
            });
        });
        
        // Use a resize observer to switch between mobile/desktop views without a page refresh
        const resizeObserver = new ResizeObserver(() => {
             updateCarousel();
        });
        resizeObserver.observe(document.body);

        updateCarousel(); // Initial setup
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = document.getElementById('form-status');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            statusEl.textContent = 'Please fill out all required fields.';
            statusEl.className = 'form-status error';
            return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending...';
        }
        statusEl.textContent = '';
        statusEl.className = 'form-status';

        // Simulate a network request
        setTimeout(() => {
            statusEl.textContent = "Thank you! Your message has been sent.";
            statusEl.className = 'form-status success';
            form.reset();
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = 'Send Message';
            }

            // Clear the message after a few seconds
            setTimeout(() => {
                 statusEl.textContent = '';
                 statusEl.className = 'form-status';
            }, 5000);

        }, 1500);
    });
}

// --- MAIN EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMouseFollower();
    initPageComponents();
    initContactForm();
});