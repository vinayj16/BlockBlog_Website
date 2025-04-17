document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadNotifications();

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); 
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.classList.add('hidden'); 
        observer.observe(card);
    });

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', () => ctaButton.classList.add('hover'));
        ctaButton.addEventListener('mouseleave', () => ctaButton.classList.remove('hover'));
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]');
            if (email && email.value) {
                alert('Thank you for subscribing!');
                form.reset();
            }
        });
    }

    document.getElementById('bell-icon')?.addEventListener('click', toggleNotifications);
    
    document.getElementById('username-container')?.addEventListener('click', toggleLogoutDropdown);

    document.addEventListener('click', closeDropdownOnClickOutside);
});

function loadNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.innerHTML = `
            <div class="notification-item unread">New comment on your post</div>
            <div class="notification-item unread">You have a new follower</div>
            <div class="notification-item">Your post was liked by John</div>
        `;
    }
}

function toggleNotifications(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function toggleLogoutDropdown(event) {
    event.stopPropagation();
    const logoutDropdown = document.getElementById('logout-dropdown');
    if (logoutDropdown) {
        logoutDropdown.classList.toggle('active');
    }
}

function closeDropdownOnClickOutside(event) {
    if (!event.target.closest('#username-container')) {
        document.getElementById('logout-dropdown')?.classList.remove('active');
    }
    if (!event.target.closest('.notification-icon')) {
        document.getElementById('notification-dropdown')?.classList.remove('active');
    }
}

function updateLoginButton(username) {
    const loginBtn = document.getElementById('login-btn');
    const usernameContainer = document.getElementById('username-container');
    const userIcon = document.getElementById('user-icon');
    let usernameText = document.getElementById('username-text');

    if (!usernameText) {
        usernameText = document.createElement('span');
        usernameText.id = 'username-text';
        usernameText.style.marginLeft = '8px'; 
        usernameText.style.fontWeight = 'bold';
        usernameContainer.appendChild(usernameText);
    }

    if (loginBtn && usernameContainer && userIcon && usernameText) {
        loginBtn.style.display = 'none'; 
        usernameContainer.style.display = 'flex';
        usernameContainer.style.alignItems = 'center'; 
        usernameText.innerText = username; 
    }
}

function resetLoginButton() {
    document.getElementById('login-btn')?.style.display = 'block';
    document.getElementById('username-container')?.style.display = 'none';
    document.getElementById('logout-dropdown')?.classList.remove('active');
}

function checkLoginStatus() {
    const username = localStorage.getItem('username');
    if (username) {
        updateLoginButton(username);
    } else {
        resetLoginButton();
    }
}

function logout() {
    localStorage.removeItem('username');
    resetLoginButton();
    setTimeout(() => window.location.reload(), 300);
}
