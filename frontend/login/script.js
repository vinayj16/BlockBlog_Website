document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const signupBtn = document.getElementById('signup-btn');
  const loginBtn = document.getElementById('login-btn');
  const resetPasswordBtn = document.getElementById('reset-password-btn');

  const emailJSBtn = document.getElementById("button");
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', validateLogin);
  }
  
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }

  document.querySelectorAll('.toggle-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      toggleForms(target);
    });
  });

  document.getElementById('login-card').classList.add('active');
});

async function handleSignup(event) {
  event.preventDefault();
  clearErrors();

  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  if (!validateSignupInputs(username, email, password)) return;

  try {
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const signupData = await signupResponse.json();

    if (signupResponse.ok) {
      alert('Signup successful!');
      toggleForms('login');
    } else {
      showError('signup-email-error', signupData.error || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup Error:', error);
    showError('signup-email-error', 'An error occurred during signup');
  }
}

async function validateLogin(event) {
  event.preventDefault();
  clearErrors();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showError('login-password-error', 'Username and password are required');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token || '');
      localStorage.setItem('username', username);
      window.location.href = '/frontend/home/home.html';
    } else {
      showError('login-password-error', data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    showError('login-password-error', 'An error occurred during login');
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById('forgot-email').value.trim();

  if (!email) {
    showError('forgot-email-error', 'Email is required');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Password reset link sent to your email');
      toggleForms('login');
    } else {
      showError('forgot-email-error', data.error || 'Failed to send reset link');
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    showError('forgot-email-error', 'An error occurred');
  }
}

function validateSignupInputs(username, email, password) {
  let isValid = true;

  if (!username) {
    showError('signup-username-error', 'Username is required');
    isValid = false;
  } else if (username.length < 3) {
    showError('signup-username-error', 'Username must be at least 3 characters');
    isValid = false;
  }

  if (!email) {
    showError('signup-email-error', 'Email is required');
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    showError('signup-email-error', 'Invalid email format');
    isValid = false;
  }

  if (!password) {
    showError('signup-password-error', 'Password is required');
    isValid = false;
  } else if (password.length < 6) {
    showError('signup-password-error', 'Password must be at least 6 characters');
    isValid = false;
  }

  return isValid;
}

function toggleForms(target) {
  document.getElementById('login-card').classList.toggle('active', target === 'login');
  document.getElementById('signup-card').classList.toggle('active', target === 'signup');
  document.getElementById('forgot-password-card').classList.toggle('active', target === 'forgot-password');
  clearErrors();
  clearInputs();
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(error => {
    error.textContent = '';
    error.style.display = 'none';
  });
}

function clearInputs() {
  document.querySelectorAll('input').forEach(input => {
    if (input.type !== 'submit' && input.type !== 'button') {
      input.value = '';
    }
  });
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function socialLogin(platform) {
  const socialUrls = {
    Facebook: `https://www.facebook.com/v12.0/dialog/oauth?client_id=${YOUR_FACEBOOK_APP_ID}&redirect_uri=${YOUR_REDIRECT_URI}`,
    Google: `https://accounts.google.com/o/oauth2/auth?client_id=${YOUR_GOOGLE_CLIENT_ID}&redirect_uri=${YOUR_REDIRECT_URI}&response_type=code&scope=email profile`,
    Twitter: `https://api.twitter.com/oauth/authenticate?oauth_token=${YOUR_TWITTER_TOKEN}`
  };

  const url = socialUrls[platform];
  if (url) {
    window.location.href = url;
  } else {
    alert(`${platform} login is not supported yet.`);
  }
}

if (document.getElementById("button")) {
  document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const btn = document.getElementById("button");
    btn.value = "Signing Up...";
    
    emailjs.sendForm("default_service", "template_vkat6y2", this)
      .then(() => {
        btn.value = "Sign Up";
        alert("Sign Up successful!");
        toggleForms('login');
      })
      .catch(err => {
        btn.value = "Sign Up";
        alert("Sign Up failed: " + err.text);
      });
  });
}