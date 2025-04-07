/**
 * Ednormous Personal Toolkit
 * Main JavaScript file that handles all interactive elements and animations
 * 
 * @version 1.0.0
 * @author Ednormous
 * @license MIT
 */

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Mobile Navigation Handling
     * Toggles mobile menu visibility when the hamburger icon is clicked
     */
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    /**
     * Smooth Scrolling
     * Handles smooth scrolling to page sections when navigation links are clicked
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    });

    /**
     * Toolbar Animation Setup
     * Sets animation indices for staggered toolbar item animations
     */
    document.querySelectorAll('.toolbar-item').forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });

    /**
     * Intersection Observer for Scroll Animations
     * Adds 'in-view' class to elements when they enter the viewport
     */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all sections and interactive elements for scroll animations
    document.querySelectorAll('section, .tool-card, .feature-toolbar').forEach(element => {
        observer.observe(element);
    });

    /**
     * Navigation Active State Management
     * Highlights the current active section in the navigation menu based on scroll position
     */
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    
    function setActiveNavLink() {
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navItems.forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to current nav link
                document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavLink);
    
    // Initialize active nav link on page load
    setActiveNavLink();
    
    /**
     * Particles.js Background
     * Creates interactive particle background in the hero section
     */
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 50,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#9CA368"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#9CA368",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.6
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    /**
     * Typewriter Effect
     * Creates a typing animation effect that cycles through different phrases
     */
    const typewriterElement = document.getElementById('typewriter');
    const typewriterContainer = document.querySelector('.typewriter-container');
    
    if (typewriterElement && typewriterContainer) {
        const words = ['productivity and creativity', 'simplicity and efficiency', 'powerful solutions'];
        let wordIndex = 0;
        
        function animateTypewriter() {
            // Reset animation
            typewriterElement.classList.remove('active');
            
            // Set the new text content
            typewriterElement.textContent = words[wordIndex];
            
            // Force browser reflow
            void typewriterElement.offsetWidth;
            
            // Start the animation
            typewriterElement.classList.add('active');
            
            // Calculate typing duration based on word length and screen size
            const isMobile = window.innerWidth <= 768;
            const typingSpeed = isMobile ? 60 : 75; // Faster on mobile
            const typingDuration = Math.max(words[wordIndex].length * typingSpeed, 1500);
            
            // Move to next word
            wordIndex = (wordIndex + 1) % words.length;
            
            // Schedule next animation (current animation + pause)
            const pauseDuration = isMobile ? 2000 : 3000; // Shorter pause on mobile
            setTimeout(animateTypewriter, typingDuration + pauseDuration);
        }
        
        // Start animation
        animateTypewriter();
        
        // Re-run animation when window is resized between mobile/desktop breakpoints
        let wasMobile = window.innerWidth <= 768;
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            if (wasMobile !== isMobile) {
                wasMobile = isMobile;
                animateTypewriter();
            }
        });
    }
    
    /**
     * Toolbar Item Interactions
     * Handles hover effects, click animations, and 3D transformations for toolbar items
     */
    const toolbarItems = document.querySelectorAll('.toolbar-item');
    
    toolbarItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsapMouseEffect(this);
        });
        
        item.addEventListener('click', function() {
            // Add ripple effect on click
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${0}px`;
            ripple.style.top = `${0}px`;
            
            ripple.classList.add('active');
            
            // Show which tool is clicked (can be expanded later)
            const toolName = this.getAttribute('data-tool');
            console.log(`Tool clicked: ${toolName}`);
            
            // Provide feedback when clicking
            this.classList.add('clicked');
            setTimeout(() => {
                ripple.remove();
                this.classList.remove('clicked');
            }, 600);
        });
    });
    
    /**
     * 3D Hover Effect for Toolbar Items
     * Creates a GSAP-like 3D rotation effect when hovering over toolbar items
     * without requiring the GSAP library
     * 
     * @param {HTMLElement} element - The element to apply the effect to
     */
    function gsapMouseEffect(element) {
        const height = element.clientHeight;
        const width = element.clientWidth;
        
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        function handleMouseMove(e) {
            const rect = element.getBoundingClientRect();
            const xVal = e.clientX - rect.left;
            const yVal = e.clientY - rect.top;
            
            const xRotation = 20 * ((yVal - height/2) / height);
            const yRotation = -20 * ((xVal - width/2) / width);
            
            const transform = `perspective(500px) scale(1.05) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
            
            element.style.transform = transform;
        }
        
        function handleMouseLeave() {
            element.style.transform = 'perspective(500px) scale(1) rotateX(0) rotateY(0)';
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        }
    }
    
    /**
     * Custom Cursor Effect
     * Creates a custom cursor that changes size and appearance when hovering over interactive elements
     */
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    toolbarItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
        });
        
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    /**
     * Background Particles
     * Creates floating particles in the hero section background for visual interest
     */
    function createParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => particle.remove());
        
        const heroSection = document.querySelector('.hero-particles');
        if (!heroSection) return;
        
        const width = heroSection.offsetWidth;
        const height = heroSection.offsetHeight;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random position
            const x = Math.random() * width;
            const y = Math.random() * height;
            
            // Random size
            const size = Math.random() * 5 + 2;
            
            // Set particle properties
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Add to hero section
            heroSection.appendChild(particle);
            
            // Random animation
            const duration = Math.random() * 20 + 10;
            const xMove = Math.random() * 100 - 50;
            const yMove = Math.random() * 100 - 50;
            
            particle.animate(
                [
                    { transform: 'translate(0, 0)' },
                    { transform: `translate(${xMove}px, ${yMove}px)` },
                    { transform: 'translate(0, 0)' }
                ],
                {
                    duration: duration * 1000,
                    iterations: Infinity
                }
            );
        }
    }
    
    // Create particles on load and resize
    createParticles();
    window.addEventListener('resize', createParticles);
}); 