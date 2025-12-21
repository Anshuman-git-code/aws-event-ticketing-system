// Enhanced Professional Application Logic
let allEvents = [];
let currentEventId = null;
const stripe = Stripe(CONFIG.stripePublishableKey);

// Page Navigation with smooth transitions
function showPage(pageName) {
    // Add fade out animation to current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        currentPage.style.opacity = '0';
        currentPage.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            const newPage = document.getElementById(pageName + 'Page');
            newPage.classList.add('active');
            newPage.style.opacity = '1';
            newPage.style.transform = 'translateY(0)';
        }, 150);
    } else {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageName + 'Page').classList.add('active');
    }
    
    // Load data for specific pages
    if (pageName === 'events') {
        loadEvents();
    } else if (pageName === 'myEvents') {
        loadMyEvents();
    } else if (pageName === 'myTickets') {
        loadMyTickets();
    } else if (pageName === 'scanner') {
        // Clear previous validation result
        document.getElementById('validationResult').innerHTML = '';
        document.getElementById('ticketIdInput').value = '';
    }
}

// Enhanced Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.innerHTML = `<strong>Error:</strong> ${message}`;
    errorEl.classList.add('show');
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 8000);
    
    // Add shake animation
    errorEl.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        errorEl.style.animation = '';
    }, 500);
}

function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.innerHTML = `<strong>Success:</strong> ${message}`;
    successEl.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let timeString = '';
    if (diffDays === 0) {
        timeString = 'Today';
    } else if (diffDays === 1) {
        timeString = 'Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
        timeString = `In ${diffDays} days`;
    } else {
        timeString = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    }
    
    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `${timeString} at ${time}`;
}

// Enhanced Events Functions
async function loadEvents() {
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.eventsAPI}/events`);
        const data = await response.json();
        
        allEvents = data.events || [];
        displayEvents(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        showError('eventsError', 'Failed to load events. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

function displayEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:4rem;">
                <div style="font-size:4rem;margin-bottom:1rem;">🎪</div>
                <h3 style="margin-bottom:1rem;color:var(--gray-700);">No events available</h3>
                <p>Check back soon for exciting events!</p>
                <button onclick="showPage('createEvent')" class="btn btn-primary" style="margin-top:2rem;">
                    ➕ Create Your First Event
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();
        const spotsLeft = event.capacity - (event.registeredCount || 0);
        const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
        const isFull = spotsLeft <= 0;
        
        return `
            <div class="event-card" onclick="showEventDetails('${event.eventId}')" style="position:relative;">
                ${!isUpcoming ? '<div style="position:absolute;top:1rem;right:1rem;background:var(--gray-500);color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;">PAST</div>' : ''}
                ${isFull ? '<div style="position:absolute;top:1rem;right:1rem;background:var(--error-color);color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;">SOLD OUT</div>' : ''}
                ${isAlmostFull ? '<div style="position:absolute;top:1rem;right:1rem;background:var(--warning-color);color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;">ALMOST FULL</div>' : ''}
                
                <div style="margin-bottom:1rem;">
                    <h3 style="margin-bottom:0.5rem;">${event.name}</h3>
                    <span style="background:var(--primary-light);color:var(--primary-color);padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;">
                        ${event.category || 'EVENT'}
                    </span>
                </div>
                
                <p style="margin-bottom:1rem;color:var(--gray-600);line-height:1.5;">${event.description || 'No description available'}</p>
                
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;color:var(--gray-600);">
                    <span style="color:var(--primary-color);">📍</span>
                    <span>${event.location}</span>
                </div>
                
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;color:var(--gray-600);">
                    <span style="color:var(--primary-color);">📅</span>
                    <span>${formatDate(event.date)}</span>
                </div>
                
                <div class="event-meta">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <span style="color:var(--primary-color);">👥</span>
                        <span style="color:${isFull ? 'var(--error-color)' : isAlmostFull ? 'var(--warning-color)' : 'var(--gray-600)'};">
                            ${event.registeredCount || 0}/${event.capacity}
                        </span>
                    </div>
                    <span class="event-price">$${parseFloat(event.price).toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Enhanced Event Creation
async function createEvent() {
    if (!userToken) {
        showError('createEventError', 'Please login first to create events');
        setTimeout(() => showPage('login'), 2000);
        return;
    }
    
    // Get form values
    const name = document.getElementById('eventName').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const capacity = parseInt(document.getElementById('eventCapacity').value);
    const price = parseFloat(document.getElementById('eventPrice').value);
    
    // Enhanced validation
    if (!name) {
        showError('createEventError', 'Event name is required');
        document.getElementById('eventName').focus();
        return;
    }
    
    if (name.length < 3) {
        showError('createEventError', 'Event name must be at least 3 characters long');
        document.getElementById('eventName').focus();
        return;
    }
    
    if (!date) {
        showError('createEventError', 'Event date and time is required');
        document.getElementById('eventDate').focus();
        return;
    }
    
    // Check if date is in the future
    const eventDate = new Date(date);
    const now = new Date();
    if (eventDate <= now) {
        showError('createEventError', 'Event date must be in the future');
        document.getElementById('eventDate').focus();
        return;
    }
    
    if (!location) {
        showError('createEventError', 'Event location is required');
        document.getElementById('eventLocation').focus();
        return;
    }
    
    if (!capacity || capacity < 1) {
        showError('createEventError', 'Capacity must be at least 1');
        document.getElementById('eventCapacity').focus();
        return;
    }
    
    if (capacity > 10000) {
        showError('createEventError', 'Capacity cannot exceed 10,000');
        document.getElementById('eventCapacity').focus();
        return;
    }
    
    if (price === undefined || price < 0) {
        showError('createEventError', 'Price must be 0 or greater');
        document.getElementById('eventPrice').focus();
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.eventsAPI}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userToken
            },
            body: JSON.stringify({
                name,
                description,
                date: eventDate.toISOString(),
                location,
                capacity,
                price: parseFloat(price.toFixed(2))
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('createEventSuccess', 'Event created successfully! 🎉');
            
            // Clear form with animation
            const inputs = ['eventName', 'eventDescription', 'eventDate', 'eventLocation', 'eventCapacity', 'eventPrice'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                input.style.transition = 'all 0.3s ease';
                input.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    input.value = '';
                    input.style.transform = 'scale(1)';
                }, 150);
            });
            
            setTimeout(() => showPage('myEvents'), 3000);
        } else {
            showError('createEventError', data.error || 'Failed to create event. Please try again.');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showError('createEventError', 'Network error. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

// Add CSS animations for shake effect
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .page {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .input:focus {
        transform: translateY(-2px);
    }
    
    .btn:active {
        transform: translateY(1px) scale(0.98);
    }
`;
document.head.appendChild(style);

// Initialize enhanced features when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });
    
    // Add focus effects to inputs
    document.querySelectorAll('.input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
    });
});
// Enhanced Event Details and Registration Functions
async function showEventDetails(eventId) {
    currentEventId = eventId;
    const event = allEvents.find(e => e.eventId === eventId);
    
    if (!event) {
        showError('eventDetailsError', 'Event not found');
        return;
    }
    
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > new Date();
    const spotsLeft = event.capacity - (event.registeredCount || 0);
    const isFull = spotsLeft <= 0;
    
    const detailsHTML = `
        <div class="event-details">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;">
                <h1>${event.name}</h1>
                ${!isUpcoming ? '<span style="background:var(--gray-500);color:white;padding:0.5rem 1rem;border-radius:1rem;font-size:0.875rem;font-weight:600;">PAST EVENT</span>' : ''}
                ${isFull ? '<span style="background:var(--error-color);color:white;padding:0.5rem 1rem;border-radius:1rem;font-size:0.875rem;font-weight:600;">SOLD OUT</span>' : ''}
            </div>
            
            <p style="font-size:1.125rem;color:var(--gray-600);margin-bottom:2rem;line-height:1.6;">${event.description || 'No description available'}</p>
            
            <div class="event-details-meta">
                <div class="meta-item">
                    <span class="meta-label">📅 Date & Time</span>
                    <span class="meta-value">${formatDate(event.date)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📍 Location</span>
                    <span class="meta-value">${event.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">👥 Availability</span>
                    <span class="meta-value" style="color:${isFull ? 'var(--error-color)' : 'var(--success-color)'};">
                        ${event.registeredCount || 0}/${event.capacity} registered
                    </span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">💰 Price</span>
                    <span class="meta-value" style="color:var(--primary-color);font-size:1.5rem;">$${parseFloat(event.price).toFixed(2)}</span>
                </div>
            </div>
            
            ${userToken && isUpcoming && !isFull ? `
                <button onclick="registerForEvent('${event.eventId}', ${event.price})" class="btn btn-primary" style="margin-top:2rem;width:100%;">
                    🎫 Register for $${parseFloat(event.price).toFixed(2)}
                </button>
            ` : userToken && isFull ? `
                <div style="text-align:center;margin-top:2rem;padding:2rem;background:var(--gray-100);border-radius:1rem;">
                    <h3 style="color:var(--error-color);margin-bottom:1rem;">Event Sold Out</h3>
                    <p style="color:var(--gray-600);">This event has reached maximum capacity.</p>
                </div>
            ` : userToken && !isUpcoming ? `
                <div style="text-align:center;margin-top:2rem;padding:2rem;background:var(--gray-100);border-radius:1rem;">
                    <h3 style="color:var(--gray-600);margin-bottom:1rem;">Event Has Ended</h3>
                    <p style="color:var(--gray-600);">This event has already taken place.</p>
                </div>
            ` : `
                <div style="text-align:center;margin-top:2rem;padding:2rem;background:var(--primary-light);border-radius:1rem;">
                    <h3 style="color:var(--primary-color);margin-bottom:1rem;">Ready to Join?</h3>
                    <p style="color:var(--gray-700);margin-bottom:1rem;">Login to register for this amazing event!</p>
                    <button onclick="showPage('login')" class="btn btn-primary">🔐 Login to Register</button>
                </div>
            `}
            
            <button onclick="showPage('events')" class="btn btn-secondary" style="margin-top:1rem;width:100%;">
                ← Back to Events
            </button>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = detailsHTML;
    showPage('eventDetails');
}

async function registerForEvent(eventId, price) {
    if (!userToken) {
        showError('registrationError', 'Please login first to register for events');
        setTimeout(() => showPage('login'), 2000);
        return;
    }
    
    // Enhanced confirmation dialog
    const event = allEvents.find(e => e.eventId === eventId);
    const confirmMessage = `
        🎫 Confirm Registration
        
        Event: ${event.name}
        Date: ${formatDate(event.date)}
        Price: $${parseFloat(price).toFixed(2)}
        
        Proceed with registration?
    `;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    showLoading(true);
    
    try {
        // Step 1: Create registration
        const regResponse = await fetch(`${CONFIG.eventsAPI}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userToken
            },
            body: JSON.stringify({ eventId })
        });
        
        const regData = await regResponse.json();
        
        if (!regResponse.ok) {
            throw new Error(regData.error || 'Failed to create registration');
        }
        
        const registrationId = regData.registration?.registrationId || regData.registrationId;
        
        if (!registrationId) {
            throw new Error('Failed to get registration ID');
        }
        
        // Step 2: Create payment intent
        const paymentResponse = await fetch(`${CONFIG.paymentsAPI}/payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: price,
                currency: 'usd',
                eventId,
                registrationId
            })
        });
        
        const paymentData = await paymentResponse.json();
        
        if (!paymentResponse.ok) {
            throw new Error(paymentData.error || 'Failed to create payment');
        }
        
        showLoading(false);
        
        // Step 3: Show enhanced payment form
        showPaymentForm(paymentData.clientSecret, registrationId, eventId, event);
        
    } catch (error) {
        showLoading(false);
        console.error('Error registering:', error);
        showError('registrationError', `Registration failed: ${error.message}`);
    }
}

function showPaymentForm(clientSecret, registrationId, eventId, event) {
    const paymentHTML = `
        <div class="event-details">
            <div style="text-align:center;margin-bottom:2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">💳</div>
                <h2 style="color:var(--gray-900);">Complete Your Registration</h2>
                <p style="color:var(--gray-600);">Secure payment for ${event.name}</p>
            </div>
            
            <div style="background:var(--gray-50);padding:1.5rem;border-radius:1rem;margin-bottom:2rem;">
                <h3 style="margin-bottom:1rem;color:var(--gray-900);">Order Summary</h3>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                    <span>Event:</span>
                    <span style="font-weight:600;">${event.name}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                    <span>Date:</span>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:1rem;border-top:1px solid var(--gray-200);">
                    <span style="font-weight:600;">Total:</span>
                    <span style="font-weight:700;color:var(--primary-color);font-size:1.25rem;">$${parseFloat(event.price).toFixed(2)}</span>
                </div>
            </div>
            
            <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--gray-700);">Card Details</label>
                <div id="card-element" style="padding:1rem;border:2px solid var(--gray-200);border-radius:0.75rem;background:white;"></div>
                <div id="card-errors" class="error"></div>
            </div>
            
            <button onclick="submitPayment('${clientSecret}', '${registrationId}', '${eventId}')" class="btn btn-primary btn-block" style="margin-bottom:1rem;">
                🔒 Pay $${parseFloat(event.price).toFixed(2)} Securely
            </button>
            <button onclick="showPage('events')" class="btn btn-secondary btn-block">
                Cancel Registration
            </button>
            
            <div style="text-align:center;margin-top:1rem;font-size:0.875rem;color:var(--gray-500);">
                🔒 Your payment is secured with 256-bit SSL encryption
            </div>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = paymentHTML;
    
    // Mount Stripe card element with enhanced styling
    const elements = stripe.elements({
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#ffffff',
                colorText: '#1e293b',
                colorDanger: '#dc2626',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px'
            }
        }
    });
    
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': {
                    color: '#94a3b8',
                },
            },
        },
    });
    
    cardElement.mount('#card-element');
    
    cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.innerHTML = `<strong>Card Error:</strong> ${event.error.message}`;
            displayError.classList.add('show');
        } else {
            displayError.textContent = '';
            displayError.classList.remove('show');
        }
    });
    
    // Store for later use
    window.cardElement = cardElement;
}

async function submitPayment(clientSecret, registrationId, eventId) {
    showLoading(true);
    
    try {
        // Check if this is a mock payment (starts with pi_ but not from real Stripe)
        if (clientSecret && clientSecret.startsWith('pi_') && !clientSecret.includes('_test_')) {
            // Mock payment - skip Stripe and go directly to ticket generation
            console.log('Using mock payment system');
            await generateTicket(registrationId, eventId);
            return;
        }
        
        // Real Stripe payment flow
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: window.cardElement
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Payment successful - generate ticket
            await generateTicket(registrationId, eventId);
        }
        
    } catch (error) {
        showLoading(false);
        showError('paymentError', `Payment failed: ${error.message}`);
    }
}

async function generateTicket(registrationId, eventId) {
    try {
        const response = await fetch(`${CONFIG.paymentsAPI}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registrationId,
                eventId
            })
        });
        
        const data = await response.json();
        
        showLoading(false);
        
        if (response.ok) {
            // Show success message with animation
            document.getElementById('eventDetailsContent').innerHTML = `
                <div class="event-details" style="text-align:center;">
                    <div style="font-size:4rem;margin-bottom:1rem;">🎉</div>
                    <h1 style="color:var(--success-color);margin-bottom:1rem;">Registration Successful!</h1>
                    <p style="font-size:1.125rem;color:var(--gray-600);margin-bottom:2rem;">
                        Your ticket has been generated and is ready for download.
                    </p>
                    <div style="background:var(--success-color);background:linear-gradient(135deg, #059669, #047857);color:white;padding:2rem;border-radius:1rem;margin-bottom:2rem;">
                        <h3 style="margin-bottom:1rem;">What's Next?</h3>
                        <p style="margin-bottom:1rem;">• Check your email for confirmation</p>
                        <p style="margin-bottom:1rem;">• Download your ticket from "My Tickets"</p>
                        <p>• Present your QR code at the event entrance</p>
                    </div>
                    <button onclick="showPage('myTickets')" class="btn btn-primary" style="margin-right:1rem;">
                        🎫 View My Tickets
                    </button>
                    <button onclick="showPage('events')" class="btn btn-secondary">
                        Browse More Events
                    </button>
                </div>
            `;
        } else {
            showError('ticketError', 'Payment successful but ticket generation failed. Please contact support.');
        }
        
    } catch (error) {
        showLoading(false);
        console.error('Error generating ticket:', error);
        showError('ticketError', 'Payment successful but ticket generation failed. Please contact support.');
    }
}

// Enhanced My Events Functions
async function loadMyEvents() {
    if (!userToken) {
        showPage('login');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.eventsAPI}/events`, {
            headers: {
                'Authorization': userToken
            }
        });
        
        const data = await response.json();
        const myEvents = data.events || [];
        
        const container = document.getElementById('myEventsList');
        
        if (myEvents.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:4rem;">
                    <div style="font-size:4rem;margin-bottom:1rem;">📊</div>
                    <h3 style="margin-bottom:1rem;">No events created yet</h3>
                    <p style="margin-bottom:2rem;">Start by creating your first event!</p>
                    <button onclick="showPage('createEvent')" class="btn btn-primary">
                        ➕ Create Your First Event
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = myEvents.map(event => {
                const registeredCount = event.registeredCount || 0;
                const revenue = event.price * registeredCount;
                const utilizationPercent = Math.round((registeredCount / event.capacity) * 100);
                
                return `
                    <div class="event-card" onclick="showEventAnalytics('${event.eventId}')" style="cursor:pointer;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                            <h3>${event.name}</h3>
                            <span style="background:var(--accent-color);color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;">
                                ${utilizationPercent}% FULL
                            </span>
                        </div>
                        <p style="margin-bottom:1rem;">${event.description || 'No description'}</p>
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                            <span style="color:var(--primary-color);">📍</span>
                            <span>${event.location}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
                            <span style="color:var(--primary-color);">📅</span>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="event-meta">
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <span style="color:var(--primary-color);">👥</span>
                                <span>${registeredCount}/${event.capacity}</span>
                            </div>
                            <span class="event-price">$${revenue.toFixed(2)}</span>
                        </div>
                        <button onclick="event.stopPropagation(); viewRegistrants('${event.eventId}')" class="btn btn-secondary" style="margin-top:1rem;width:100%;">
                            👥 View ${registeredCount} Registrant${registeredCount !== 1 ? 's' : ''}
                        </button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading my events:', error);
        showError('myEventsError', 'Failed to load your events');
    } finally {
        showLoading(false);
    }
}

// Enhanced My Tickets Functions
async function loadMyTickets() {
    if (!userToken) {
        showPage('login');
        return;
    }
    
    showLoading(true);
    const container = document.getElementById('myTicketsList');
    
    try {
        // Load events if not already loaded
        if (allEvents.length === 0) {
            const eventsResponse = await fetch(`${CONFIG.eventsAPI}/events`);
            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                allEvents = eventsData.events || [];
            }
        }
        
        // Get user's registrations
        const response = await fetch(`${CONFIG.eventsAPI}/registrations/my`, {
            headers: {
                'Authorization': userToken
            }
        });
        
        let registrations = [];
        if (response.ok) {
            const data = await response.json();
            registrations = data.registrations || [];
        }
        
        if (registrations.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;color:var(--gray-500);padding:4rem;">
                    <div style="font-size:4rem;margin-bottom:1rem;">🎫</div>
                    <h3 style="margin-bottom:1rem;">No tickets yet</h3>
                    <p style="margin-bottom:2rem;">Register for an event to get your first ticket!</p>
                    <button onclick="showPage('events')" class="btn btn-primary">
                        🎪 Browse Events
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = registrations.map(reg => {
                const event = allEvents.find(e => e.eventId === reg.eventId);
                const eventDate = event ? new Date(event.date) : new Date();
                const isUpcoming = eventDate > new Date();
                
                return `
                    <div class="ticket-card">
                        <div class="ticket-info">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                                <h3>${event ? event.name : 'Event'}</h3>
                                ${!isUpcoming ? '<span style="background:var(--gray-400);color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.75rem;">PAST</span>' : ''}
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                                <span style="color:var(--primary-color);">📍</span>
                                <span>${event ? event.location : 'Location'}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                                <span style="color:var(--primary-color);">📅</span>
                                <span>${event ? formatDate(event.date) : 'Date'}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <span style="color:var(--primary-color);">🎫</span>
                                <span style="font-family:monospace;font-size:0.875rem;">${reg.ticketId || reg.registrationId}</span>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <span class="ticket-status ${reg.paymentStatus === 'completed' ? 'valid' : reg.paymentStatus === 'pending' ? 'pending' : 'used'}">
                                ${reg.paymentStatus === 'completed' ? '✅ Valid' : reg.paymentStatus === 'pending' ? '⏳ Pending' : '❌ Invalid'}
                            </span>
                            ${reg.ticketId && reg.paymentStatus === 'completed' ? `
                                <button onclick="downloadTicket('${reg.ticketId}')" class="btn btn-primary" style="margin-top:1rem;width:100%;">
                                    📥 Download Ticket
                                </button>
                            ` : reg.paymentStatus === 'pending' ? `
                                <button class="btn btn-secondary" style="margin-top:1rem;width:100%;" disabled>
                                    ⏳ Processing...
                                </button>
                            ` : `
                                <button class="btn btn-secondary" style="margin-top:1rem;width:100%;" disabled>
                                    ❌ Unavailable
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        container.innerHTML = `
            <div style="text-align:center;color:var(--error-color);padding:4rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                <h3 style="margin-bottom:1rem;">Failed to Load Tickets</h3>
                <p style="margin-bottom:2rem;">Please check your connection and try again.</p>
                <button onclick="loadMyTickets()" class="btn btn-primary">
                    🔄 Retry
                </button>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Enhanced Download Ticket Function
async function downloadTicket(ticketId) {
    showLoading(true);
    
    try {
        const url = `${CONFIG.paymentsAPI}/tickets/${ticketId}/download`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': userToken
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.downloadUrl) {
            // Create a temporary success message
            const ticketCard = event.target.closest('.ticket-card');
            const originalContent = ticketCard.innerHTML;
            
            ticketCard.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--success-color);">
                    <div style="font-size:2rem;margin-bottom:1rem;">📥</div>
                    <p style="font-weight:600;">Downloading ticket...</p>
                </div>
            `;
            
            // Open download URL
            window.open(data.downloadUrl, '_blank');
            
            // Restore original content after 2 seconds
            setTimeout(() => {
                ticketCard.innerHTML = originalContent;
            }, 2000);
        } else {
            showError('downloadError', `Ticket download failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error downloading ticket:', error);
        showError('downloadError', `Failed to download ticket: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Enhanced Ticket Validation
async function validateTicket() {
    const ticketId = document.getElementById('ticketIdInput').value.trim();
    
    if (!ticketId) {
        showError('validationError', 'Please enter a ticket ID or QR code data');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.paymentsAPI}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userToken
            },
            body: JSON.stringify({ ticketId })
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('validationResult');
        
        if (response.ok && data.valid) {
            resultDiv.innerHTML = `
                <div style="background:linear-gradient(135deg, #dcfce7, #bbf7d0);border:2px solid var(--success-color);padding:2rem;border-radius:1rem;text-align:center;animation:slideIn 0.5s ease-out;">
                    <div style="font-size:4rem;margin-bottom:1rem;">✅</div>
                    <h2 style="color:var(--success-color);margin-bottom:1rem;font-weight:800;">Valid Ticket</h2>
                    <div style="background:white;padding:1.5rem;border-radius:0.75rem;margin-top:1rem;text-align:left;box-shadow:var(--shadow-md);">
                        <div style="display:grid;gap:0.75rem;">
                            <div><strong>Ticket ID:</strong> <span style="font-family:monospace;">${data.ticket.ticketId}</span></div>
                            <div><strong>Event:</strong> ${data.ticket.eventName || 'N/A'}</div>
                            <div><strong>Attendee:</strong> ${data.ticket.userName || 'N/A'}</div>
                            <div><strong>Email:</strong> ${data.ticket.userEmail || 'N/A'}</div>
                            <div><strong>Status:</strong> <span style="color:var(--success-color);font-weight:600;">${data.ticket.status}</span></div>
                        </div>
                    </div>
                    <div style="margin-top:1rem;font-size:0.875rem;color:var(--success-color);">
                        ✓ Entry authorized - Welcome to the event!
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="background:linear-gradient(135deg, #fee2e2, #fecaca);border:2px solid var(--error-color);padding:2rem;border-radius:1rem;text-align:center;animation:slideIn 0.5s ease-out;">
                    <div style="font-size:4rem;margin-bottom:1rem;">❌</div>
                    <h2 style="color:var(--error-color);margin-bottom:1rem;font-weight:800;">Invalid Ticket</h2>
                    <div style="background:white;padding:1.5rem;border-radius:0.75rem;margin-top:1rem;">
                        <p style="color:var(--error-color);font-weight:600;">${data.message || 'This ticket is not valid or has already been used.'}</p>
                    </div>
                    <div style="margin-top:1rem;font-size:0.875rem;color:var(--error-color);">
                        ⚠️ Entry denied - Please verify ticket details
                    </div>
                </div>
            `;
        }
        
        // Clear input with animation
        const input = document.getElementById('ticketIdInput');
        input.style.transform = 'scale(0.95)';
        setTimeout(() => {
            input.value = '';
            input.style.transform = 'scale(1)';
        }, 150);
        
    } catch (error) {
        console.error('Error validating ticket:', error);
        document.getElementById('validationResult').innerHTML = `
            <div style="background:linear-gradient(135deg, #fee2e2, #fecaca);border:2px solid var(--error-color);padding:2rem;border-radius:1rem;text-align:center;">
                <div style="font-size:4rem;margin-bottom:1rem;">⚠️</div>
                <h2 style="color:var(--error-color);margin-bottom:1rem;">Validation Failed</h2>
                <p>Unable to validate ticket. Please check your connection and try again.</p>
                <button onclick="validateTicket()" class="btn btn-primary" style="margin-top:1rem;">
                    🔄 Try Again
                </button>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Add remaining functions from original (viewRegistrants, showEventAnalytics, etc.)
async function viewRegistrants(eventId) {
    showLoading(true);
    
    try {
        let registrations = [];
        const cleanEventId = eventId.replace('EVENT#', '');
        
        try {
            const response = await fetch(`${CONFIG.eventsAPI}/events/${cleanEventId}/registrations`, {
                headers: {
                    'Authorization': userToken
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                registrations = data.registrations || [];
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
        }
        
        const event = allEvents.find(e => e.eventId === eventId);
        
        const registrantsHTML = `
            <div class="event-details">
                <h1>👥 Registrants for ${event ? event.name : 'Event'}</h1>
                <div style="background:var(--primary-light);padding:1.5rem;border-radius:1rem;margin-bottom:2rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h3 style="color:var(--primary-color);margin-bottom:0.5rem;">Total Registrations</h3>
                            <p style="font-size:2rem;font-weight:800;color:var(--primary-color);">${registrations.length}</p>
                        </div>
                        <div style="text-align:right;">
                            <h3 style="color:var(--primary-color);margin-bottom:0.5rem;">Revenue</h3>
                            <p style="font-size:2rem;font-weight:800;color:var(--primary-color);">$${((event?.price || 0) * registrations.length).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                ${registrations.length === 0 ? `
                    <div style="text-align:center;padding:4rem;color:var(--gray-500);">
                        <div style="font-size:4rem;margin-bottom:1rem;">👥</div>
                        <h3 style="margin-bottom:1rem;">No registrations yet</h3>
                        <p>Share your event to get your first registrants!</p>
                    </div>
                ` : `
                    <div class="registrants-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>👤 Name</th>
                                    <th>📧 Email</th>
                                    <th>📅 Registration Date</th>
                                    <th>💳 Payment Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${registrations.map(reg => `
                                    <tr>
                                        <td style="font-weight:600;">${reg.userName || 'N/A'}</td>
                                        <td>${reg.userEmail || 'N/A'}</td>
                                        <td>${formatDate(reg.registrationDate || reg.registeredAt)}</td>
                                        <td>
                                            <span class="ticket-status ${reg.paymentStatus === 'completed' ? 'valid' : reg.paymentStatus === 'pending' ? 'pending' : 'used'}">
                                                ${reg.paymentStatus === 'completed' ? '✅ Completed' : reg.paymentStatus === 'pending' ? '⏳ Pending' : '❌ Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
                
                <button onclick="showPage('myEvents')" class="btn btn-secondary" style="margin-top:2rem;width:100%;">
                    ← Back to My Events
                </button>
            </div>
        `;
        
        document.getElementById('eventDetailsContent').innerHTML = registrantsHTML;
        showPage('eventDetails');
        
    } catch (error) {
        console.error('Error loading registrants:', error);
        showError('registrantsError', 'Failed to load registrants');
    } finally {
        showLoading(false);
    }
}

async function showEventAnalytics(eventId) {
    const event = allEvents.find(e => e.eventId === eventId);
    if (!event) return;
    
    const registeredCount = event.registeredCount || 0;
    const capacity = event.capacity;
    const revenue = event.price * registeredCount;
    const utilizationPercent = Math.round((registeredCount / capacity) * 100);
    
    const analyticsHTML = `
        <div class="event-details">
            <h1>📊 ${event.name} - Analytics</h1>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="value" style="color:var(--primary-color);">${registeredCount}</div>
                    <div class="label">Total Registrations</div>
                </div>
                
                <div class="analytics-card">
                    <div class="value" style="color:var(--success-color);">$${revenue.toFixed(2)}</div>
                    <div class="label">Total Revenue</div>
                </div>
                
                <div class="analytics-card">
                    <div class="value" style="color:var(--warning-color);">${utilizationPercent}%</div>
                    <div class="label">Capacity Used</div>
                </div>
                
                <div class="analytics-card">
                    <div class="value" style="color:var(--error-color);">${capacity - registeredCount}</div>
                    <div class="label">Spots Remaining</div>
                </div>
            </div>
            
            <div style="background:var(--gray-50);padding:2rem;border-radius:1rem;margin:2rem 0;">
                <h3 style="margin-bottom:1.5rem;color:var(--gray-900);">📋 Event Details</h3>
                <div style="display:grid;gap:1rem;">
                    <div><strong>📍 Location:</strong> ${event.location}</div>
                    <div><strong>📅 Date:</strong> ${formatDate(event.date)}</div>
                    <div><strong>💰 Price:</strong> $${parseFloat(event.price).toFixed(2)}</div>
                    <div><strong>👥 Capacity:</strong> ${capacity} people</div>
                    <div><strong>📊 Fill Rate:</strong> ${utilizationPercent}%</div>
                </div>
            </div>
            
            <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                <button onclick="viewRegistrants('${eventId}')" class="btn btn-primary" style="flex:1;">
                    👥 View Registrants
                </button>
                <button onclick="showPage('myEvents')" class="btn btn-secondary" style="flex:1;">
                    ← Back to My Events
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = analyticsHTML;
    showPage('eventDetails');
}