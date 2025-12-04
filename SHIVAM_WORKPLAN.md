# Work Plan: Shivam (Frontend Developer)
**Phase 4: Frontend Development**

---

## 👤 Your Role

**Name**: Shivam  
**Phase**: 4 (Frontend Development)  
**Duration**: 1 day (December 6, 2025)  
**Dependencies**: Phase 1, 2, 3 (Complete)  
**Handoff To**: All team (Phase 5 - Final Testing)

---

## 🎯 Your Mission

Build the React frontend application with:
1. User authentication (Cognito)
2. Organizer portal (create/manage events)
3. Attendee portal (browse/register for events)
4. Payment integration (Stripe)
5. Ticket download functionality

---

## 📋 Prerequisites

### What You Need Before Starting

#### 1. Information from Pavan
- [ ] API endpoints documentation
- [ ] Stripe publishable key
- [ ] Sample API calls
- [ ] Test data (event IDs, user credentials)
- [ ] Updated .env.dev file

#### 2. Technical Requirements
- Node.js 18+ installed
- npm or yarn
- Code editor (VS Code recommended)
- Git access
- AWS credentials

#### 3. Knowledge Required
- React.js (hooks, routing, state management)
- REST API integration
- JWT authentication
- Stripe Elements
- CSS/styling

---

## 📚 What to Read First

### Required Reading (2 hours)
1. **TEAM_ONBOARDING.md** - Team overview
2. **docs/ARCHITECTURE.md** - System design (focus on user flows)
3. **API_ENDPOINTS.md** - All API endpoints (from Pavan)
4. **frontend/.env.dev** - Configuration file

### Reference Documents
- **PROJECT_PLAN.md** - Phase 4 section
- **PHASE3_COMPLETION_REPORT.md** - What Pavan built

---

## 🛠️ Your Tasks (Detailed)

### Task 1: React App Setup (1 hour)

#### What to Do
Initialize React application with required dependencies

#### How to Do It

**Step 1: Create React app**
```bash
cd frontend
npx create-react-app . --template minimal
```

**Step 2: Install dependencies**
```bash
npm install \
  aws-amplify \
  @aws-amplify/ui-react \
  axios \
  react-router-dom \
  @stripe/stripe-js \
  @stripe/react-stripe-js \
  react-qr-code
```

**Step 3: Project structure**

```
frontend/
├── public/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API calls
│   ├── utils/          # Helper functions
│   ├── config/         # AWS config
│   ├── App.js
│   └── index.js
├── package.json
└── .env.dev
```

**Step 4: Configure AWS Amplify**

Create `src/config/aws-config.js`:
```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID
  }
});
```

#### Files to Create
- `src/config/aws-config.js`
- `src/services/api.js` (API client)
- `src/utils/constants.js`

#### Verification
```bash
npm start
# Should open http://localhost:3000
```

---

### Task 2: Authentication UI (2 hours)

#### What to Do
Build login, signup, and authentication flow

#### How to Do It

**Step 1: Create auth service**

`src/services/auth.js`:
```javascript
import { Auth } from 'aws-amplify';

export const signUp = async (email, password, name, role) => {
  return await Auth.signUp({
    username: email,
    password,
    attributes: {
      email,
      name,
      'custom:role': role
    }
  });
};

export const signIn = async (email, password) => {
  return await Auth.signIn(email, password);
};

export const signOut = async () => {
  return await Auth.signOut();
};

export const getCurrentUser = async () => {
  return await Auth.currentAuthenticatedUser();
};

export const getToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};
```

**Step 2: Create Login page**

`src/pages/Login.js`:
- Email and password fields
- Login button
- Link to signup
- Error handling
- Redirect after login

**Step 3: Create Signup page**

`src/pages/Signup.js`:
- Email, password, name fields
- Role selection (Organizer/Attendee)
- Signup button
- Email verification flow
- Link to login

**Step 4: Create protected routes**

`src/App.js`:
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const user = useAuth(); // Custom hook
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

#### Files to Create
- `src/services/auth.js`
- `src/pages/Login.js`
- `src/pages/Signup.js`
- `src/hooks/useAuth.js`
- `src/components/Navbar.js`

#### Verification
- [ ] User can sign up
- [ ] Email verification works
- [ ] User can log in
- [ ] Token stored correctly
- [ ] User can log out
- [ ] Protected routes work

---

### Task 3: API Service Layer (1 hour)

#### What to Do
Create service layer for all API calls

#### How to Do It

**Create `src/services/api.js`**:
```javascript
import axios from 'axios';
import { getToken } from './auth';

const API_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Events API
export const eventsAPI = {
  list: (params) => apiClient.get('/events', { params }),
  get: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`)
};

// Registrations API
export const registrationsAPI = {
  create: (data) => apiClient.post('/registrations', data),
  list: () => apiClient.get('/registrations'),
  get: (id) => apiClient.get(`/registrations/${id}`)
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => apiClient.post('/payments/create-intent', data)
};

// Tickets API
export const ticketsAPI = {
  getDownloadUrl: (id) => apiClient.get(`/tickets/${id}/download`),
  validate: (qrCode) => apiClient.post('/tickets/validate', { qrCode })
};
```

#### Files to Create
- `src/services/api.js`
- `src/services/events.js`
- `src/services/registrations.js`
- `src/services/payments.js`
- `src/services/tickets.js`

#### Verification
```javascript
// Test API calls
import { eventsAPI } from './services/api';

const events = await eventsAPI.list();
console.log(events);
```

---

### Task 4: Organizer Portal (3 hours)

#### What to Do
Build dashboard for event organizers

#### Components Needed

**1. Organizer Dashboard** (`src/pages/OrganizerDashboard.js`)
- List of organizer's events
- Create new event button
- Event statistics
- Navigation to event details

**2. Create Event Form** (`src/pages/CreateEvent.js`)
```javascript
// Form fields:
- Event name (required)
- Description
- Date and time (required)
- End date
- Location (required)
- Venue
- Capacity (required)
- Price (required)
- Category
- Image URL
- Tags
```

**3. Event Details Page** (`src/pages/EventDetails.js`)
- Event information
- Edit button
- Delete button
- Registrations list
- Analytics (total registrations, revenue)

**4. Registrations List** (`src/components/RegistrationsList.js`)
- Table of attendees
- Search/filter
- Export to CSV
- Ticket validation status

#### How to Implement

**Create Event Form Example**:
```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  date: '',
  location: '',
  capacity: '',
  price: ''
});

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await eventsAPI.create(formData);
    navigate(`/organizer/events/${response.data.event.eventId}`);
  } catch (error) {
    setError(error.message);
  }
};
```

#### Files to Create
- `src/pages/OrganizerDashboard.js`
- `src/pages/CreateEvent.js`
- `src/pages/EditEvent.js`
- `src/pages/EventDetails.js`
- `src/components/EventCard.js`
- `src/components/RegistrationsList.js`
- `src/components/EventForm.js`

#### Verification
- [ ] Organizer can create event
- [ ] Events list displays correctly
- [ ] Event details show all info
- [ ] Registrations list works
- [ ] Edit event works
- [ ] Delete event works

---

### Task 5: Attendee Portal (3 hours)

#### What to Do
Build interface for event attendees

#### Components Needed

**1. Attendee Dashboard** (`src/pages/AttendeeDashboard.js`)
- Browse all upcoming events
- Search bar
- Category filter
- Event cards with details

**2. Event Browse Page** (`src/pages/BrowseEvents.js`)
- Grid/list view of events
- Filters (category, date, price)
- Search functionality
- Pagination

**3. Event Registration Flow** (`src/pages/RegisterEvent.js`)
- Event details display
- Registration confirmation
- Payment form (Stripe)
- Success message

**4. My Tickets Page** (`src/pages/MyTickets.js`)
- List of user's tickets
- Download button for each
- QR code display
- Event details

#### How to Implement

**Event Registration with Stripe**:
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ registrationId, amount }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create payment intent
    const { data } = await paymentsAPI.createIntent({
      registrationId,
      amount
    });
    
    // Confirm payment
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    
    if (result.error) {
      setError(result.error.message);
    } else {
      // Payment successful
      navigate('/tickets');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay ${amount/100}</button>
    </form>
  );
}
```

**Ticket Download**:
```javascript
const handleDownload = async (ticketId) => {
  try {
    const { data } = await ticketsAPI.getDownloadUrl(ticketId);
    window.open(data.downloadUrl, '_blank');
  } catch (error) {
    setError('Failed to download ticket');
  }
};
```

#### Files to Create
- `src/pages/AttendeeDashboard.js`
- `src/pages/BrowseEvents.js`
- `src/pages/RegisterEvent.js`
- `src/pages/MyTickets.js`
- `src/components/EventCard.js`
- `src/components/PaymentForm.js`
- `src/components/TicketCard.js`
- `src/components/SearchBar.js`
- `src/components/FilterPanel.js`

#### Verification
- [ ] Events display correctly
- [ ] Search works
- [ ] Filters work
- [ ] Registration flow works
- [ ] Payment processes
- [ ] Tickets display
- [ ] Download works

---

### Task 6: Styling & UX (2 hours)

#### What to Do
Make the application look professional

#### How to Do It

**Option 1: Use CSS Framework**
```bash
npm install @mui/material @emotion/react @emotion/styled
# or
npm install tailwindcss
```

**Option 2: Custom CSS**
Create `src/styles/` folder with:
- `App.css` - Global styles
- `components.css` - Component styles
- `pages.css` - Page styles

**Key UI Elements**:
1. Responsive navbar
2. Loading spinners
3. Error messages
4. Success notifications
5. Modal dialogs
6. Form validation feedback
7. Mobile-responsive design

**Color Scheme Example**:
```css
:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
}
```

#### Files to Create
- `src/styles/App.css`
- `src/styles/components.css`
- `src/components/Loading.js`
- `src/components/ErrorMessage.js`
- `src/components/SuccessMessage.js`

#### Verification
- [ ] Consistent styling
- [ ] Responsive on mobile
- [ ] Loading states
- [ ] Error handling
- [ ] Professional look

---

### Task 7: Testing (2 hours)

#### What to Do
Test all functionality end-to-end

#### Test Scenarios

**Organizer Flow**:
1. Sign up as organizer
2. Log in
3. Create event
4. View event details
5. See registrations (after attendee registers)
6. Edit event
7. Log out

**Attendee Flow**:
1. Sign up as attendee
2. Log in
3. Browse events
4. Search for event
5. Register for event
6. Enter payment (use test card: 4242 4242 4242 4242)
7. View my tickets
8. Download ticket PDF
9. Log out

**Edge Cases**:
- Invalid login
- Expired session
- Network errors
- Payment failures
- Capacity full
- Invalid form data

#### Create Test Checklist
```markdown
## Organizer Tests
- [ ] Sign up works
- [ ] Login works
- [ ] Create event works
- [ ] Event appears in list
- [ ] Event details correct
- [ ] Edit event works
- [ ] View registrations works
- [ ] Logout works

## Attendee Tests
- [ ] Sign up works
- [ ] Login works
- [ ] Browse events works
- [ ] Search works
- [ ] Filter works
- [ ] Event details display
- [ ] Registration works
- [ ] Payment works
- [ ] Ticket appears
- [ ] Download works
- [ ] Logout works

## Error Handling
- [ ] Invalid credentials
- [ ] Network error
- [ ] Payment declined
- [ ] Form validation
- [ ] Session expired
```

---

### Task 8: Build & Prepare for Deployment (1 hour)

#### What to Do
Build production version and prepare for deployment

#### How to Do It

**Step 1: Environment variables**
Create `.env.production`:
```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_LSO6RslSb
REACT_APP_USER_POOL_CLIENT_ID=712kg88tji37pcn6b3miqfbdlf
REACT_APP_API_URL=https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Step 2: Build**
```bash
npm run build
```

**Step 3: Test build locally**
```bash
npx serve -s build
```

**Step 4: Prepare deployment script**
```bash
# Create deploy-frontend.sh
#!/bin/bash
npm run build
aws s3 sync build/ s3://event-ticketing-frontend-dev-264449293739
aws cloudfront create-invalidation --distribution-id E3A54MN5Q7TR2P --paths "/*"
```

#### Files to Create
- `.env.production`
- `deploy-frontend.sh`
- `README.md` (frontend docs)

#### Verification
- [ ] Build succeeds
- [ ] No console errors
- [ ] All features work in build
- [ ] Ready for S3 deployment

---

## 📤 Handoff to Team (Phase 5)

### What to Provide

#### 1. Frontend Documentation
Create `frontend/README.md`:
```markdown
# Frontend Application

## Setup
npm install
npm start

## Build
npm run build

## Deploy
./deploy-frontend.sh

## Environment Variables
See .env.dev and .env.production

## Pages
- /login - Login page
- /signup - Signup page
- /organizer - Organizer dashboard
- /attendee - Attendee dashboard
- /events/:id - Event details
- /tickets - My tickets

## Components
See src/components/README.md
```

#### 2. User Guide
Create `USER_GUIDE.md`:
- How to sign up
- How to create event
- How to register
- How to download ticket
- Screenshots

#### 3. Known Issues
Document any bugs or limitations

#### 4. Deployment Instructions
Step-by-step deployment to S3

---

## 📝 Documentation to Create

### Required Documents

#### 1. PHASE4_COMPLETION_REPORT.md
- What was built
- Pages created
- Components created
- Test results
- Screenshots
- Known issues

#### 2. frontend/README.md
- Setup instructions
- Available scripts
- Project structure
- Environment variables
- Deployment

#### 3. USER_GUIDE.md
- User flows
- Screenshots
- Common tasks
- Troubleshooting

---

## ⚠️ Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Verify API Gateway has CORS enabled

### Issue 2: Authentication Fails
**Solution**: Check Cognito configuration in aws-config.js

### Issue 3: Payment Not Processing
**Solution**: Verify Stripe publishable key is correct

### Issue 4: Ticket Download Fails
**Solution**: Check pre-signed URL hasn't expired

### Issue 5: Build Fails
**Solution**: Check for console errors, missing dependencies

---

## ✅ Completion Checklist

- [ ] React app initialized
- [ ] All dependencies installed
- [ ] AWS Amplify configured
- [ ] Authentication working
- [ ] API service layer complete
- [ ] Organizer portal complete
- [ ] Attendee portal complete
- [ ] Payment integration working
- [ ] Ticket download working
- [ ] Styling complete
- [ ] Responsive design
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Ready for deployment
- [ ] Team briefed for Phase 5

---

## 🎯 Success Criteria

Phase 4 complete when:
1. ✅ Users can sign up and log in
2. ✅ Organizers can create events
3. ✅ Attendees can browse events
4. ✅ Registration flow works
5. ✅ Payment processes successfully
6. ✅ Tickets can be downloaded
7. ✅ UI is professional and responsive
8. ✅ All features tested
9. ✅ Build ready for deployment

---

**Good luck, Shivam! Build something amazing! 🎨**

---

*Work Plan Created: December 4, 2025*  
*Phase 4: Frontend Development*  
*Estimated Duration: 1 day*
