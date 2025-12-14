const API_BASE_URL = 'http://localhost:8080'; 
const ENDPOINTS = {
    SEND_CODE: '/api/send-code',    
    SIGNUP: '/api/signup',          
    LOGIN: '/api/login'             
};

let signupToken = null;


document.addEventListener('DOMContentLoaded', () => {
    
    const signupForm = document.getElementById('signup-form');
    const sendCodeBtn = document.getElementById('send-code-btn');

    if (signupForm) {
        //Handle "Send Code" Button Click
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', async () => {
                clearErrors();
                const email = document.getElementById('signup-email').value;

                if (!email) {
                    showError('email', 'Please enter an email address first.');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SEND_CODE}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email })
                    });

                    const data = await response.json();

                    if (response.status === 200) {
                        signupToken = data.token;
                        alert("Verification code sent! Please check your email.");
                    } else {
                        handleApiError(data);
                    }
                } catch (error) {
                    showError('client', 'Network error. Please try again.');
                }
            });
        }

        //Handle Signup Form Submit 
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const code = document.getElementById('signup-code').value;

            if (password !== confirmPassword) {
                showError('password', 'Passwords do not match.');
                return;
            }
            if (!signupToken) {
                showError('code', 'Please click "Send code" first.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SIGNUP}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        code: code,
                        token: signupToken
                    })
                });

                const data = await response.json(); 

                if (response.status === 201) {
                    storeTokens(data.access_token, data.refresh_token);
                    
                    // Redirect to the main page
                    window.location.href = './index.html'; 
                } else {
                    handleApiError(data);
                }
            } catch (error) {
                showError('client', 'Network error. Could not connect to server.');
            }
        });
    }

    // HANDLE LOGIN PAGE 
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json(); 

                if (response.status === 200 || response.status === 201) {
                    storeTokens(data.access_token, data.refresh_token);
                    
                    // Redirect to the dashboard/main page
                    window.location.href = './index.html';
                } else {
                    handleApiError(data);
                }
            } catch (error) {
                showError('client', 'Network error. Could not connect to server.');
            }
        });
    }
});

// HELPER FUNCTIONS 
function storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log("Access and Refresh Tokens stored successfully in Local Storage.");
}

function handleApiError(data) {
    const message = data.error || "An unknown error occurred";
    const field = data.field || "server"; 

    showError(field, message);
}

function showError(field, message) {
    let errorElement;

    if (field === 'server' || field === 'client' || field === 'global') {
        errorElement = document.getElementById('global-error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = (field.includes('error') ? "" : (field === 'client' ? "Client Error: " : "Server Error: ")) + message;
        }
    } else {
        errorElement = document.getElementById(`error-${field}`);
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            console.warn(`Could not find error container for field: ${field}. Showing globally.`);
            const global = document.getElementById('global-error');
            if(global) {
                global.style.display = 'block';
                global.textContent = message;
            }
        }
    }
}

function clearErrors() {
    const globalError = document.getElementById('global-error');
    if (globalError) {
        globalError.style.display = 'none';
        globalError.textContent = '';
    }

    const fieldErrors = document.querySelectorAll('.field-error');
    fieldErrors.forEach(el => el.textContent = '');
}