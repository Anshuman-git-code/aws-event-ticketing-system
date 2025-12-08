// Main Application Logic
let allEvents = [];
let currentEventId = null;
const stripe = Stripe(CONFIG.stripePublishableKey);

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageName + 'Page').classList.add('active');
    
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

// Utility Functions
function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('show', show);
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 5000);
}

function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.textContent = message;
    successEl.classList.add('show');
    setTimeout(() => successEl.classList.remove('show'), 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Events Functions
async function loadEvents() {
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.eventsAPI}/events`);
        const data = await response.json();
        
        allEvents = data.events || [];
        displayEvents(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        showError('eventsError', 'Failed to load events');
    } finally {
        showLoading(false);
    }
}

function displayEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#6e6e73;">No events available</p>';
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="event-card" onclick="showEventDetails('${event.eventId}')">
            <h3>${event.name}</h3>
            <p>${event.description || 'No description'}</p>
            <p>📍 ${event.location}</p>
            <p>📅 ${formatDate(event.date)}</p>
            <div class="event-meta">
                <span>👥 ${event.capacity} spots</span>
                <span class="event-price">$${event.price}</span>
            </div>
        </div>
    `).join('');
}

async function createEvent() {
    if (!userToken) {
        alert('Please login first');
        showPage('login');
        return;
    }
    
    const name = document.getElementById('eventName').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const capacity = parseInt(document.getElementById('eventCapacity').value);
    const price = parseFloat(document.getElementById('eventPrice').value);
    
    if (!name || !date || !location || !capacity || price === undefined) {
        showError('createEventError', 'Please fill in all fields');
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
                date: new Date(date).toISOString(),
                location,
                capacity,
                price
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('createEventSuccess', 'Event created successfully!');
            // Clear form
            document.getElementById('eventName').value = '';
            document.getElementById('eventDescription').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventLocation').value = '';
            document.getElementById('eventCapacity').value = '';
            document.getElementById('eventPrice').value = '';
            
            setTimeout(() => showPage('myEvents'), 2000);
        } else {
            showError('createEventError', data.error || 'Failed to create event');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showError('createEventError', 'Failed to create event');
    } finally {
        showLoading(false);
    }
}

async function showEventDetails(eventId) {
    currentEventId = eventId;
    const event = allEvents.find(e => e.eventId === eventId);
    
    if (!event) {
        alert('Event not found');
        return;
    }
    
    const detailsHTML = `
        <div class="event-details">
            <h1>${event.name}</h1>
            <p style="font-size:1.125rem;color:#6e6e73;margin-bottom:2rem;">${event.description || 'No description'}</p>
            
            <div class="event-details-meta">
                <div class="meta-item">
                    <span class="meta-label">Date & Time</span>
                    <span class="meta-value">${formatDate(event.date)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Location</span>
                    <span class="meta-value">${event.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Capacity</span>
                    <span class="meta-value">${event.capacity} people</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Price</span>
                    <span class="meta-value">$${event.price}</span>
                </div>
            </div>
            
            ${userToken ? `
                <button onclick="registerForEvent('${event.eventId}', ${event.price})" class="btn btn-primary" style="margin-top:2rem;">
                    Register for $${event.price}
                </button>
            ` : `
                <p style="margin-top:2rem;text-align:center;">
                    <a href="#" onclick="showPage('login')" style="color:#0071e3;">Login</a> to register for this event
                </p>
            `}
            
            <button onclick="showPage('events')" class="btn btn-secondary" style="margin-top:1rem;">
                Back to Events
            </button>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = detailsHTML;
    showPage('eventDetails');
}

async function registerForEvent(eventId, price) {
    if (!userToken) {
        alert('Please login first');
        showPage('login');
        return;
    }
    
    if (!confirm(`Register for this event? You will be charged $${price}`)) {
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
        
        // Step 3: Show payment form
        showPaymentForm(paymentData.clientSecret, registrationId, eventId);
        
    } catch (error) {
        showLoading(false);
        console.error('Error registering:', error);
        alert('Registration failed: ' + error.message);
    }
}

function showPaymentForm(clientSecret, registrationId, eventId) {
    const paymentHTML = `
        <div class="event-details">
            <h2>Complete Payment</h2>
            <p style="margin-bottom:2rem;">Enter your card details to complete registration</p>
            
            <div id="card-element" style="padding:1rem;border:1px solid #d2d2d7;border-radius:8px;margin-bottom:1rem;"></div>
            <div id="card-errors" class="error"></div>
            
            <button onclick="submitPayment('${clientSecret}', '${registrationId}', '${eventId}')" class="btn btn-primary btn-block">
                Pay Now
            </button>
            <button onclick="showPage('events')" class="btn btn-secondary btn-block" style="margin-top:1rem;">
                Cancel
            </button>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = paymentHTML;
    
    // Mount Stripe card element
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');
    
    cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
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
        alert('Payment failed: ' + error.message);
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
            alert('Payment successful! Your ticket has been generated.');
            showPage('myTickets');
        } else {
            alert('Payment successful but ticket generation failed. Please contact support.');
        }
        
    } catch (error) {
        showLoading(false);
        console.error('Error generating ticket:', error);
        alert('Payment successful but ticket generation failed. Please contact support.');
    }
}

// My Events (Organizer)
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
            container.innerHTML = '<p style="text-align:center;color:#6e6e73;">You haven\'t created any events yet</p>';
        } else {
            container.innerHTML = myEvents.map(event => `
                <div class="event-card" onclick="showEventAnalytics('${event.eventId}')">
                    <h3>${event.name}</h3>
                    <p>${event.description || 'No description'}</p>
                    <p>📍 ${event.location}</p>
                    <p>📅 ${formatDate(event.date)}</p>
                    <div class="event-meta">
                        <span>👥 ${event.registeredCount || 0}/${event.capacity}</span>
                        <span class="event-price">$${event.price * (event.registeredCount || 0)}</span>
                    </div>
                    <button onclick="event.stopPropagation(); viewRegistrants('${event.eventId}')" class="btn btn-secondary" style="margin-top:1rem;width:100%;">
                        View Registrants
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading my events:', error);
    } finally {
        showLoading(false);
    }
}

// View Registrants for an Event
async function viewRegistrants(eventId) {
    showLoading(true);
    
    try {
        // For now, fetch all registrations and filter by eventId
        // In production, you'd want a dedicated endpoint
        let registrations = [];
        
        // Fetch registrations for this event
        // Remove EVENT# prefix if present for the API call
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
                console.log('Fetched registrations:', registrations);
            } else {
                console.error('Failed to fetch registrations:', response.status);
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
        }
        
        // Get event details
        const event = allEvents.find(e => e.eventId === eventId);
        
        const registrantsHTML = `
            <div class="event-details">
                <h1>Registrants for ${event ? event.name : 'Event'}</h1>
                <p style="margin-bottom:2rem;">Total Registrations: ${registrations.length}</p>
                
                ${registrations.length === 0 ? `
                    <p style="text-align:center;color:#6e6e73;">No registrations yet</p>
                ` : `
                    <div class="registrants-table">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f5f5f7;">
                                    <th style="padding:1rem;text-align:left;">Name</th>
                                    <th style="padding:1rem;text-align:left;">Email</th>
                                    <th style="padding:1rem;text-align:left;">Date</th>
                                    <th style="padding:1rem;text-align:left;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${registrations.map(reg => `
                                    <tr style="border-bottom:1px solid #f5f5f7;">
                                        <td style="padding:1rem;">${reg.userName || 'N/A'}</td>
                                        <td style="padding:1rem;">${reg.userEmail || 'N/A'}</td>
                                        <td style="padding:1rem;">${formatDate(reg.registrationDate)}</td>
                                        <td style="padding:1rem;">
                                            <span class="ticket-status ${reg.paymentStatus === 'completed' ? 'valid' : 'used'}">
                                                ${reg.paymentStatus || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
                
                <button onclick="showPage('myEvents')" class="btn btn-secondary" style="margin-top:2rem;">
                    Back to My Events
                </button>
            </div>
        `;
        
        document.getElementById('eventDetailsContent').innerHTML = registrantsHTML;
        showPage('eventDetails');
        
    } catch (error) {
        console.error('Error loading registrants:', error);
        alert('Failed to load registrants');
    } finally {
        showLoading(false);
    }
}

// Show Event Analytics
async function showEventAnalytics(eventId) {
    const event = allEvents.find(e => e.eventId === eventId);
    if (!event) return;
    
    const registeredCount = event.registeredCount || 0;
    const capacity = event.capacity;
    const revenue = event.price * registeredCount;
    const utilizationPercent = Math.round((registeredCount / capacity) * 100);
    
    const analyticsHTML = `
        <div class="event-details">
            <h1>${event.name} - Analytics</h1>
            
            <div class="analytics-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:2rem 0;">
                <div class="analytics-card" style="background:#f5f5f7;padding:1.5rem;border-radius:8px;">
                    <div style="font-size:2rem;font-weight:600;color:#0071e3;">${registeredCount}</div>
                    <div style="color:#6e6e73;">Total Registrations</div>
                </div>
                
                <div class="analytics-card" style="background:#f5f5f7;padding:1.5rem;border-radius:8px;">
                    <div style="font-size:2rem;font-weight:600;color:#34c759;">$${revenue}</div>
                    <div style="color:#6e6e73;">Total Revenue</div>
                </div>
                
                <div class="analytics-card" style="background:#f5f5f7;padding:1.5rem;border-radius:8px;">
                    <div style="font-size:2rem;font-weight:600;color:#ff9500;">${utilizationPercent}%</div>
                    <div style="color:#6e6e73;">Capacity Used</div>
                </div>
                
                <div class="analytics-card" style="background:#f5f5f7;padding:1.5rem;border-radius:8px;">
                    <div style="font-size:2rem;font-weight:600;color:#ff3b30;">${capacity - registeredCount}</div>
                    <div style="color:#6e6e73;">Spots Remaining</div>
                </div>
            </div>
            
            <div style="margin:2rem 0;">
                <h3>Event Details</h3>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                <p><strong>Price:</strong> $${event.price}</p>
                <p><strong>Capacity:</strong> ${capacity}</p>
            </div>
            
            <button onclick="viewRegistrants('${eventId}')" class="btn btn-primary" style="margin-right:1rem;">
                View Registrants
            </button>
            <button onclick="showPage('myEvents')" class="btn btn-secondary">
                Back to My Events
            </button>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = analyticsHTML;
    showPage('eventDetails');
}

// My Tickets (Attendee)
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
            console.log('Loaded registrations:', registrations);
        }
        
        if (registrations.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#6e6e73;">No tickets yet. Register for an event to get your first ticket!</p>';
        } else {
            container.innerHTML = registrations.map(reg => {
                const event = allEvents.find(e => e.eventId === reg.eventId);
                return `
                    <div class="ticket-card">
                        <div class="ticket-info">
                            <h3>${event ? event.name : 'Event'}</h3>
                            <p>📍 ${event ? event.location : 'Location'}</p>
                            <p>📅 ${event ? formatDate(event.date) : 'Date'}</p>
                            <p>🎫 Ticket ID: ${reg.ticketId || reg.registrationId}</p>
                        </div>
                        <div>
                            <span class="ticket-status ${reg.paymentStatus === 'completed' ? 'valid' : 'used'}">
                                ${reg.paymentStatus === 'completed' ? 'Valid' : 'Pending'}
                            </span>
                            ${reg.ticketId ? `
                                <button onclick="downloadTicket('${reg.ticketId}')" class="btn btn-primary" style="margin-top:1rem;">
                                    Download Ticket
                                </button>
                            ` : `
                                <button class="btn btn-secondary" style="margin-top:1rem;" disabled>
                                    Processing...
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        container.innerHTML = '<p style="text-align:center;color:#6e6e73;">No tickets yet. Register for an event to get your first ticket!</p>';
    } finally {
        showLoading(false);
    }
}

// Download Ticket
async function downloadTicket(ticketId) {
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.paymentsAPI}/tickets/${ticketId}/download`, {
            headers: {
                'Authorization': userToken
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.downloadUrl) {
            // Open download URL in new tab
            window.open(data.downloadUrl, '_blank');
        } else {
            alert('Ticket download not available yet. Please try again in a moment.');
        }
    } catch (error) {
        console.error('Error downloading ticket:', error);
        alert('Failed to download ticket. Please try again.');
    } finally {
        showLoading(false);
    }
}


// Validate Ticket (Organizer)
async function validateTicket() {
    const ticketId = document.getElementById('ticketIdInput').value.trim();
    
    if (!ticketId) {
        alert('Please enter a ticket ID or QR code');
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
                <div style="background:#e5ffe5;padding:2rem;border-radius:8px;text-align:center;">
                    <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
                    <h2 style="color:#34c759;margin-bottom:1rem;">Valid Ticket</h2>
                    <div style="text-align:left;background:white;padding:1rem;border-radius:8px;margin-top:1rem;">
                        <p><strong>Ticket ID:</strong> ${data.ticket.ticketId}</p>
                        <p><strong>Event:</strong> ${data.ticket.eventName || 'N/A'}</p>
                        <p><strong>Attendee:</strong> ${data.ticket.userName || 'N/A'}</p>
                        <p><strong>Status:</strong> ${data.ticket.status}</p>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="background:#ffe5e5;padding:2rem;border-radius:8px;text-align:center;">
                    <div style="font-size:3rem;margin-bottom:1rem;">❌</div>
                    <h2 style="color:#ff3b30;margin-bottom:1rem;">Invalid Ticket</h2>
                    <p>${data.message || 'This ticket is not valid or has already been used.'}</p>
                </div>
            `;
        }
        
        // Clear input
        document.getElementById('ticketIdInput').value = '';
        
    } catch (error) {
        console.error('Error validating ticket:', error);
        document.getElementById('validationResult').innerHTML = `
            <div style="background:#ffe5e5;padding:2rem;border-radius:8px;text-align:center;">
                <div style="font-size:3rem;margin-bottom:1rem;">❌</div>
                <h2 style="color:#ff3b30;">Validation Failed</h2>
                <p>Unable to validate ticket. Please try again.</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}
