/**
 * Ednormous Portfolio
 * Main JavaScript file that handles animations and interactive elements
 * 
 * @version 1.0.0
 * @author Ednormous
 * @license MIT
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Back to Top button
    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Profession Typewriter effect
    if (document.getElementById('profession-typewriter')) {
        new Typed('#profession-typewriter', {
            strings: [
                'Software Developer',
                'UI/UX Designer',
                'Problem Solver',
                'Creative Thinker'
            ],
            typeSpeed: 60,
            backSpeed: 30,
            backDelay: 2000,
            startDelay: 1000,
            loop: true
        });
    }

    // Project filtering with Isotope
    let portfolioIsotope = document.querySelector('.projects-grid');
    if (portfolioIsotope) {
        const iso = new Isotope(portfolioIsotope, {
            itemSelector: '.project-item',
            layoutMode: 'fitRows'
        });

        const filterControls = document.querySelectorAll('.filter-controls li');
        filterControls.forEach(button => {
            button.addEventListener('click', function() {
                filterControls.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                iso.arrange({
                    filter: filterValue === '*' ? null : filterValue
                });
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });

    // Activate Bootstrap scrollspy
    const scrollSpyContent = document.body;
    if (scrollSpyContent) {
        const spy = new bootstrap.ScrollSpy(scrollSpyContent, {
            target: '#navbar',
            offset: 80
        });
    }

    // Progress bar animation on scroll
    const progressBars = document.querySelectorAll('.progress-bar');
    const animateProgress = () => {
        progressBars.forEach(bar => {
            const value = bar.getAttribute('aria-valuenow');
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = value + '%';
            }, 100);
        });
    };

    // Only animate progress bars when skills section is in view
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        const skillsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgress();
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        skillsObserver.observe(skillsSection);
    }

    // Form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            let valid = true;
            const inputs = this.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (valid) {
                // Here you would typically send the form data to a server
                // For demo purposes, we'll just show a success message
                const formElements = this.querySelectorAll('input, textarea, button');
                formElements.forEach(el => el.disabled = true);
                
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success mt-3';
                successMessage.textContent = 'Your message has been sent successfully!';
                
                this.appendChild(successMessage);
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    this.reset();
                    formElements.forEach(el => el.disabled = false);
                    successMessage.remove();
                }, 3000);
            }
        });
        
        // Clear invalid state on input
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }

    // Add parallax effect on hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrollValue = window.scrollY;
            if (scrollValue < window.innerHeight) {
                heroSection.style.backgroundPositionY = `${scrollValue * 0.5}px`;
            }
        });
    }

    // Add scroll animation to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const delay = index * 200;
        item.setAttribute('data-aos', index % 2 === 0 ? 'fade-right' : 'fade-left');
        item.setAttribute('data-aos-delay', delay.toString());
    });
}); 