// script.js

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 70; // Get navigation bar height, default to 70 if not exists

    // Smooth scroll to anchor
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    for (let link of smoothScrollLinks) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetId = this.getAttribute('href').substring(1);
            let targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Navigation link activation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav ul li a');
    const headerHeight = document.querySelector('header').offsetHeight;

    function activateNavLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50; // Subtract header height and some offset
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Scroll animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        root: null, // Relative to viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    window.addEventListener('scroll', () => {
        activateNavLink();
    });
    activateNavLink(); // Activate on initial load

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const contactMethod = document.getElementById('contact-method').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !contactMethod || !message) {
                alert('Please fill in all required fields!');
                return;
            }

            // Simple form submission simulation
            console.log('Form submission data:', {
                name: name,
                contactMethod: contactMethod,
                message: message
            });
            alert('Thank you for your message, we will contact you soon!');
            contactForm.reset(); 
        });
    }

    // Add scroll animation effect
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    console.log('Website script has been updated and loaded.');
});