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

    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress);
            obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + (obj.dataset.suffix || '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    if (reducedMotion || !('IntersectionObserver' in window)) {
        animatedElements.forEach(revealElement);
    } else {
        document.querySelectorAll('.stat strong').forEach(el => {
            const text = el.innerText;
            const match = text.match(/(\d+)(.*)/);
            if (match) {
                el.dataset.target = match[1];
                el.dataset.suffix = match[2];
                el.innerText = '0' + match[2];
            }
        });

        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealElement(entry.target);
                
                if (entry.target.classList.contains('stat')) {
                    const strong = entry.target.querySelector('strong');
                    if (strong && strong.dataset.target) {
                        setTimeout(() => {
                            animateValue(strong, 0, parseInt(strong.dataset.target, 10), 2000);
                            delete strong.dataset.target;
                        }, 200);
                    }
                }
                
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

    // -----------------------------------------
    // Mock Authentication System (localStorage)
    // -----------------------------------------
    const currentUser = JSON.parse(localStorage.getItem('inforabiaUser'));
    
    // 1. Update Global Navigation if logged in
    if (currentUser) {
        document.querySelectorAll('.desktop-client-access, .mobile-client-access').forEach(container => {
            const isMobile = container.classList.contains('mobile-client-access');
            const targetBtn = isMobile ? container.querySelector('a') : container;
            
            if (targetBtn) {
                const wrapper = document.createElement('div');
                wrapper.className = 'user-dropdown-container';
                if (!isMobile) wrapper.style.display = 'inline-block';
                
                targetBtn.parentNode.insertBefore(wrapper, targetBtn);
                wrapper.appendChild(targetBtn);
                
                const avatarHtml = currentUser.avatar 
                    ? `<img src="${currentUser.avatar}" style="width:1.25rem; height:1.25rem; border-radius:50%; object-fit:cover; margin-right:0.4rem; vertical-align:middle; display:inline-block;">` 
                    : `<i class="fa-solid fa-user-circle" aria-hidden="true" style="margin-right:0.4rem;"></i>`;
                targetBtn.innerHTML = `${avatarHtml}${currentUser.name.split(' ')[0]}`;
                targetBtn.href = 'auth.html';
                
                const dropdown = document.createElement('div');
                dropdown.className = 'user-dropdown-menu';
                if (isMobile) dropdown.style.position = 'static'; // Better for mobile menus
                
                dropdown.innerHTML = `
                    <a href="account.html"><i class="fa-solid fa-gear"></i> Account</a>
                    <a href="#" class="global-sign-out"><i class="fa-solid fa-sign-out-alt"></i> Sign out</a>
                `;
                wrapper.appendChild(dropdown);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.global-sign-out')) {
                e.preventDefault();
                localStorage.removeItem('inforabiaUser');
                window.location.href = window.location.pathname;
            }
        });
    }

    // 2. Services Page Tabs Logic
    const serviceCategoryBtns = document.querySelectorAll('.service-category-btn');
    if (serviceCategoryBtns.length > 0) {
        serviceCategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                document.querySelectorAll('.service-category-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.service-content-panel').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked button and target panel
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // 3. Handle auth.html view (Forms vs Dashboard)
    const authForms = document.getElementById('auth-forms');
    const dashboardView = document.getElementById('dashboard-view');
    
    if (authForms && dashboardView) {
        if (currentUser) {
            authForms.style.display = 'none';
            dashboardView.style.display = 'block';
            
            const nameDisplay = document.getElementById('user-name-display');
            if (nameDisplay) nameDisplay.textContent = currentUser.name.split(' ')[0];
            
            const greetingText = document.getElementById('greeting-text');
            if (greetingText) {
                greetingText.textContent = currentUser.isFirstTime ? 'Hi' : 'Welcome back';
            }
        } else {
            authForms.style.display = 'grid';
            dashboardView.style.display = 'none';
            
            // Sign In Logic
            const signInForm = document.getElementById('sign-in-form');
            if (signInForm) {
                signInForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!signInForm.reportValidity()) return;
                    
                    const email = signInForm.querySelector('[name="email"]').value;
                    const password = signInForm.querySelector('[name="password"]').value;
                    const status = signInForm.querySelector('[data-form-status]');
                    
                    // We only support 1 saved user for this prototype
                    const savedUser = JSON.parse(localStorage.getItem('inforabiaMockDB') || 'null');
                    
                    if (savedUser && savedUser.email === email && savedUser.password === password) {
                        // If they have never used the Sign In form before, it's their first manual sign in
                        if (!savedUser.hasSignedInManually) {
                            savedUser.isFirstTime = true; // Show 'Hi'
                            savedUser.hasSignedInManually = true; // Mark that they've signed in manually now
                        } else {
                            savedUser.isFirstTime = false; // Show 'Welcome back'
                        }
                        
                        localStorage.setItem('inforabiaMockDB', JSON.stringify(savedUser));
                        localStorage.setItem('inforabiaUser', JSON.stringify(savedUser));
                        window.location.href = window.location.pathname;
                    } else {
                        if (status) {
                            status.dataset.state = 'error';
                            status.textContent = 'Invalid email or password. Please try again.';
                        }
                    }
                });
            }
            
            // Sign Up Logic
            const signUpForm = document.getElementById('sign-up-form');
            if (signUpForm) {
                signUpForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!signUpForm.reportValidity()) return;
                    
                    const status = signUpForm.querySelector('[data-form-status]');
                    
                    const name = signUpForm.querySelector('[name="name"]').value;
                    const email = signUpForm.querySelector('[name="email"]').value;
                    const password = signUpForm.querySelector('[name="password"]').value;
                    
                    const newUser = { 
                        name, 
                        email, 
                        password, 
                        isFirstTime: true,
                        hasSignedInManually: false // They just signed up, haven't manually signed in yet
                    };
                    
                    // Save to our "Database" and automatically log in
                    localStorage.setItem('inforabiaMockDB', JSON.stringify(newUser));
                    localStorage.setItem('inforabiaUser', JSON.stringify(newUser));
                    
                    window.location.href = window.location.pathname;
                });
            }
        }
    }
});
