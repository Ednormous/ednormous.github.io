/**
 * Ednormous Portfolio
 * Main JavaScript file that handles animations and interactive elements
 * 
 * @version 1.0.0
 * @author Ednormous
 * @license MIT
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animation library with custom settings for better performance
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        disable: 'phone',
        offset: 50,
        anchorPlacement: 'top-bottom',
        disableMutationObserver: false
    });

    // Reinitialize AOS when window is resized
    window.addEventListener('resize', () => {
        AOS.refresh();
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
                'Data Scientist',
                'Python Developer',
                'R Programmer',
                'Analytics Specialist'
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
        // Make sure projects are visible first before initializing Isotope
        document.querySelectorAll('.project-item').forEach(item => {
            item.style.opacity = "1";
            item.style.display = "block";
        });
        
        // Wait for images to load before initializing Isotope
        window.addEventListener('load', () => {
            // Initialize Isotope with simplified settings to avoid conflicts
            const iso = new Isotope(portfolioIsotope, {
                itemSelector: '.project-item',
                layoutMode: 'fitRows',
                transitionDuration: '0.4s',
                hiddenStyle: {
                    opacity: 0
                },
                visibleStyle: {
                    opacity: 1
                }
            });
            
            // Make sure images are loaded first
            imagesLoaded(portfolioIsotope).on('progress', () => {
                iso.layout();
            });

            // Make sure all project items are visible initially
            setTimeout(() => {
                iso.arrange();
                document.querySelectorAll('.project-item').forEach(item => {
                    item.style.opacity = "1";
                    item.style.display = "block";
                    item.classList.add('aos-animate');
                });
                // Force a refresh to ensure layout is correct
                iso.layout();
            }, 300);

            // Only handle "All" filter now
            const filterControls = document.querySelectorAll('.filter-controls li');
            if (filterControls.length > 0) {
                filterControls[0].addEventListener('click', function() {
                    // Apply default "show all" filter
                    iso.arrange({
                        filter: null
                    });
                    
                    // Ensure all items are visible
                    setTimeout(() => {
                        document.querySelectorAll('.project-item').forEach(item => {
                            item.style.opacity = "1";
                            item.style.display = "block";
                        });
                        
                        // Force a layout update
                        iso.layout();
                    }, 500);
                });
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    let targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    
                    // Add extra offset for the experience section to prevent overlap
                    if (targetId === '#experience') {
                        targetPosition -= 20; // Adjust this value as needed
                    }
                    
                    // Adjust for header height
                    targetPosition -= headerHeight;
                    
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

    // Enhanced timeline animation
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
        const experienceObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                // Force refresh AOS animations when timeline is in view
                document.querySelectorAll('.timeline-item').forEach(item => {
                    item.classList.add('aos-animate');
                });
            }
        }, { threshold: 0.2 });
        
        experienceObserver.observe(experienceSection);
    }
}); 