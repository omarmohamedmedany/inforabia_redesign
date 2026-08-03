document.documentElement.classList.add('has-js');

document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');

    const closeNavigation = () => {
        if (!navToggle || !navLinks) return;
        navLinks.dataset.open = 'false';
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        navToggle.querySelector('i')?.classList.replace('fa-xmark', 'fa-bars');
    };

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.dataset.open === 'true';
            navLinks.dataset.open = String(!isOpen);
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
            const icon = navToggle.querySelector('i');
            icon?.classList.toggle('fa-bars', isOpen);
            icon?.classList.toggle('fa-xmark', !isOpen);
        });

        navLinks.addEventListener('click', (event) => {
            if (event.target.closest('a')) closeNavigation();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNavigation();
                navToggle.focus();
            }
        });
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const revealElement = (element) => element.classList.add('is-visible');

    animatedElements.forEach((element) => {
        const parent = element.parentElement;
        const siblings = parent ? Array.from(parent.children).filter((child) => child.classList.contains('animate-on-scroll')) : [];
        const index = siblings.indexOf(element);
        element.style.setProperty('--reveal-delay', `${Math.min(Math.max(index, 0) * 80, 320)}ms`);
    });

    if (reducedMotion || !('IntersectionObserver' in window)) {
        animatedElements.forEach(revealElement);
    } else {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealElement(entry.target);
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        animatedElements.forEach((element) => observer.observe(element));

        window.setTimeout(() => animatedElements.forEach(revealElement), 1400);
    }

    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const panelId = tab.getAttribute('aria-controls');
            tabs.forEach((item) => {
                const selected = item === tab;
                item.setAttribute('aria-selected', String(selected));
                item.tabIndex = selected ? 0 : -1;
            });
            document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
                panel.hidden = panel.id !== panelId;
            });
            document.querySelector(`#${panelId} input`)?.focus();
        });
    });

    document.querySelectorAll('[data-password-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            button.querySelector('i')?.classList.toggle('fa-eye', !isPassword);
            button.querySelector('i')?.classList.toggle('fa-eye-slash', isPassword);
        });
    });

    const bookingForm = document.querySelector('[data-whatsapp-form]');
    if (bookingForm) {
        const preferredDate = bookingForm.querySelector('[name="preferredDate"]');
        if (preferredDate) preferredDate.min = new Date().toISOString().split('T')[0];

        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!bookingForm.reportValidity()) return;

            const data = new FormData(bookingForm);
            const details = [
                'Hello Inforabia, I would like to request a consultation.',
                '',
                `Name: ${data.get('fullName')}`,
                `Company: ${data.get('companyName')}`,
                `Email: ${data.get('email')}`,
                `Phone: ${data.get('phone')}`,
                `Service: ${data.get('serviceInterest')}`,
                `Company size: ${data.get('companySize')}`,
                `Preferred date: ${data.get('preferredDate')}`,
                `Project notes: ${data.get('projectDescription')}`
            ].join('\n');
            const url = `https://wa.me/966545220713?text=${encodeURIComponent(details)}`;
            window.open(url, '_blank', 'noopener,noreferrer');

            const status = bookingForm.querySelector('[data-form-status]');
            if (status) {
                status.dataset.state = 'success';
                status.textContent = 'WhatsApp has opened with your consultation details ready to send.';
            }
        });
    }

    document.querySelectorAll('[data-auth-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const status = form.querySelector('[data-form-status]');
            if (status) {
                status.dataset.state = 'error';
                status.textContent = 'The secure client portal is not connected yet. Please contact us to request account access.';
            }
        });
    });
});
