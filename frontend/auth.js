// Authentication using AWS Cognito
let currentUser = null;
let userToken = null;
let pendingVerificationEmail = null;

// Initialize AWS SDK
AWS.config.region = CONFIG.region;

const poolData = {
    UserPoolId: CONFIG.userPoolId,
    ClientId: CONFIG.userPoolClientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    currentUser = userPool.getCurrentUser();
    
    if (currentUser) {
        currentUser.getSession((err, session) => {
            if (err) {
                console.error('Session error:', err);
                return;
            }
            
            if (session.isValid()) {
                userToken = session.getIdToken().getJwtToken();
                updateUIForLoggedInUser();
            }
        });
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navLogout').style.display = 'block';
    
    // Get user attributes to determine role
    currentUser.getUserAttributes((err, attributes) => {
        if (err) {
            console.error('Error getting attributes:', err);
            // Default to attendee if error
            document.getElementById('navMyTickets').style.display = 'block';
            return;
        }
        
        console.log('User attributes:', attributes); // Debug log
        
        // Check user role from custom:role attribute
        const roleAttr = attributes.find(attr => attr.Name === 'custom:role');
        const role = roleAttr ? roleAttr.Value : 'Attendees';
        
        console.log('User role:', role); // Debug log
        
        if (role === 'Organizers') {
            // Show organizer navigation
            document.getElementById('navCreate').style.display = 'block';
            document.getElementById('navMyEvents').style.display = 'block';
            document.getElementById('navScanner').style.display = 'block';
        } else {
            // Show attendee navigation
            document.getElementById('navMyTickets').style.display = 'block';
        }
    });
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    
    if (!name || !email || !password) {
        showError('signupError', 'Please fill in all fields');
        return;
    }
    
    showLoading(true);
    
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'custom:role', Value: role })
    ];
    
    userPool.signUp(email, password, attributeList, null, (err, result) => {
        showLoading(false);
        
        if (err) {
            showError('signupError', err.message);
            return;
        }
        
        pendingVerificationEmail = email;
        showSuccess('signupSuccess', 'Account created! Please check your email for verification code.');
        
        // Show verification form after 2 seconds
        setTimeout(() => {
            document.getElementById('signupForm').classList.remove('active');
            document.getElementById('verifyForm').classList.add('active');
        }, 2000);
    });
}

async function verifyEmail() {
    const code = document.getElementById('verifyCode').value;
    
    if (!code || !pendingVerificationEmail) {
        showError('verifyError', 'Please enter verification code');
        return;
    }
    
    showLoading(true);
    
    const userData = {
        Username: pendingVerificationEmail,
        Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.confirmRegistration(code, true, (err, result) => {
        showLoading(false);
        
        if (err) {
            showError('verifyError', err.message);
            return;
        }
        
        alert('Email verified! You can now login.');
        showAuthTab('login');
    });
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('loginError', 'Please enter email and password');
        return;
    }
    
    showLoading(true);
    
    const authenticationData = {
        Username: email,
        Password: password
    };
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
    const userData = {
        Username: email,
        Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            showLoading(false);
            userToken = result.getIdToken().getJwtToken();
            currentUser = cognitoUser;
            updateUIForLoggedInUser();
            showPage('events');
        },
        onFailure: (err) => {
            showLoading(false);
            showError('loginError', err.message);
        }
    });
}

function logout() {
    if (currentUser) {
        currentUser.signOut();
    }
    
    currentUser = null;
    userToken = null;
    
    document.getElementById('navLogin').style.display = 'block';
    document.getElementById('navLogout').style.display = 'none';
    document.getElementById('navCreate').style.display = 'none';
    document.getElementById('navMyEvents').style.display = 'none';
    document.getElementById('navMyTickets').style.display = 'none';
    document.getElementById('navScanner').style.display = 'none';
    
    showPage('home');
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('signupForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}
