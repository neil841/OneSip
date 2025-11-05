# 🔥 Firebase Authentication & Firestore Setup Guide

## Complete Step-by-Step Implementation Guide for One Sip Restaurant

---

## 📋 Table of Contents
1. [Firebase Console Setup](#step-1-firebase-console-setup)
2. [Get Firebase Configuration](#step-2-get-firebase-configuration)
3. [Update Configuration File](#step-3-update-configuration-file)
4. [Set up Firestore Security Rules](#step-4-firestore-security-rules)
5. [Test the Implementation](#step-5-test-implementation)
6. [User Data Structure](#user-data-structure)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Step 1: Firebase Console Setup

### 1.1 Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **"one-sip-restaurant"**
3. Click **"Authentication"** in the left sidebar
4. Click **"Get Started"** button
5. Go to **"Sign-in method"** tab
6. Click on **"Email/Password"**
7. Toggle **"Enable"** switch ON
8. Click **"Save"**

✅ **Authentication is now enabled!**

---

### 1.2 Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"** button
3. **Choose mode**:
   - Select **"Start in test mode"** (we'll add security rules later)
   - Click **"Next"**
4. **Choose location**:
   - Select closest region to your users (e.g., **"asia-south1"** for India)
   - Click **"Enable"**
5. Wait for database creation (takes ~1 minute)

✅ **Firestore is now enabled!**

---

## Step 2: Get Firebase Configuration

### 2.1 Get Your Firebase Config Object

1. In Firebase Console, click the **⚙️ gear icon** next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't see a web app:
   - Click the **Web icon** (`</>`) button
   - Register app with nickname: **"One Sip Web"**
   - **Don't check** "Set up Firebase Hosting" (we're using Firebase Hosting separately)
   - Click **"Register app"**
5. Copy the **firebaseConfig** object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "one-sip-restaurant.firebaseapp.com",
  projectId: "one-sip-restaurant",
  storageBucket: "one-sip-restaurant.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

⚠️ **Keep this config handy - you'll need it in the next step!**

---

## Step 3: Update Configuration File

### 3.1 Edit Firebase Config File

1. Open the file: `public/firebase/config.js`
2. Find this section:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "one-sip-restaurant.firebaseapp.com",
  projectId: "one-sip-restaurant",
  storageBucket: "one-sip-restaurant.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. **Replace the placeholder values** with your actual Firebase config from Step 2.1
4. **Save the file**

✅ **Configuration file updated!**

---

## Step 4: Firestore Security Rules

### 4.1 Set Up Security Rules

1. In Firebase Console, go to **"Firestore Database"**
2. Click on **"Rules"** tab
3. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Prevent user deletion
    }

    // Reservations collection - users can manage their own reservations
    match /reservations/{reservationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                      (resource.data.userId == request.auth.uid ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null &&
                      (resource.data.userId == request.auth.uid ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Admin-only collections
    match /settings/{document} {
      allow read: if true; // Public read
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

4. Click **"Publish"**

✅ **Security rules configured!**

---

## Step 5: Test Implementation

### 5.1 Start Local Server

```bash
cd /Users/neilbiswas/OneSip
firebase serve
```

Visit: `http://localhost:5000`

---

### 5.2 Test User Signup

1. Scroll to the **"Member Login"** section
2. Click **"Create New Account"**
3. Enter:
   - **Name**: Your Full Name
   - **Email**: your.email@example.com
   - **Password**: At least 6 characters
4. Click through the prompts
5. ✅ You should see: **"Account created successfully! Welcome!"**

---

### 5.3 Verify User in Firebase Console

1. Go to Firebase Console → **Authentication** → **Users** tab
2. You should see your newly created user with email and UID
3. Go to **Firestore Database** → **Data** tab
4. You should see a `users` collection with your user document

---

### 5.4 Test User Login

1. Refresh the page
2. Scroll to **"Member Login"** section
3. Enter your email and password
4. Click **"Sign In"**
5. ✅ You should see: **"Welcome back! Redirecting..."**

---

## User Data Structure

### Firestore Collections

#### **users** collection
```javascript
{
  uid: "abc123...",              // Firebase Auth User ID
  email: "user@example.com",     // User's email
  displayName: "John Doe",       // User's full name
  createdAt: Timestamp,          // Account creation date
  updatedAt: Timestamp,          // Last profile update
  lastLogin: Timestamp,          // Last successful login
  role: "customer",              // User role: 'customer' | 'admin'
  reservations: [],              // Array of reservation IDs
  preferences: {
    emailNotifications: true,    // Email notification preference
    smsNotifications: false      // SMS notification preference
  }
}
```

#### **reservations** collection (future use)
```javascript
{
  reservationId: "auto-generated",
  userId: "abc123...",           // User who made reservation
  name: "John Doe",
  email: "user@example.com",
  phone: "1234567890",
  guests: 4,
  date: "2025-11-15",
  time: "19:00",
  message: "Window seat preferred",
  status: "pending",             // pending | confirmed | cancelled
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Available Functions

### Authentication Functions (in `js/auth.js`)

```javascript
// Sign up new user
await signUpUser(email, password, name)

// Sign in existing user
await signInUser(email, password)

// Sign out current user
await signOutUser()

// Get current authenticated user
getCurrentUser()

// Get user data from Firestore
await getUserData(uid)

// Update user profile
await updateUserProfile(uid, { displayName: "New Name" })

// Send password reset email
await resetPassword(email)

// Listen to auth state changes
onAuthStateChanged((authState) => {
  if (authState.isAuthenticated) {
    console.log('User:', authState.user);
  } else {
    console.log('User signed out');
  }
})
```

---

## Common Issues & Solutions

### Issue 1: "Firebase not defined" error

**Solution**: Make sure Firebase scripts are loaded before `config.js` in your HTML:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="firebase/config.js"></script>
```

---

### Issue 2: "Permission denied" in Firestore

**Solution**:
1. Check that you're signed in (`firebase.auth().currentUser` should not be null)
2. Verify security rules in Firebase Console → Firestore → Rules
3. Make sure user document exists in `users` collection

---

### Issue 3: "Email already in use"

**Solution**: This email is already registered. User should:
1. Try signing in instead
2. Or use "Forgot password?" to reset their password

---

### Issue 4: Config file gitignored

**Correct!** The file `public/firebase/config.js` is intentionally gitignored to protect your API keys.

**To deploy**:
1. Add your config to production server manually
2. Or use Firebase environment variables
3. Or use a secure secrets management service

---

## Next Steps

### 1. Create a Proper Signup Modal
Instead of using browser `prompt()`, create a nice signup form modal with proper validation.

### 2. Add "Forgot Password" Functionality
```javascript
// In app.js, add this function
async function handleForgotPassword() {
  const email = prompt('Enter your email:');
  if (!email) return;

  const result = await resetPassword(email);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.error);
  }
}

// Connect to the "Forgot password?" link
document.querySelector('.forgot-link').addEventListener('click', (e) => {
  e.preventDefault();
  handleForgotPassword();
});
```

### 3. Show User Info When Logged In
```javascript
// In app.js, add auth state listener
onAuthStateChanged((authState) => {
  const loginSection = document.getElementById('login');

  if (authState.isAuthenticated) {
    // Replace login form with user info
    loginSection.innerHTML = `
      <div class="container">
        <h2>Welcome, ${authState.user.displayName}!</h2>
        <p>Email: ${authState.user.email}</p>
        <button onclick="signOutUser().then(() => window.location.reload())">
          Sign Out
        </button>
      </div>
    `;
  }
});
```

### 4. Link Reservations to User Account
When a user makes a reservation while logged in, save it with their user ID:

```javascript
// In reservation form handler
const user = getCurrentUser();
if (user) {
  formData.userId = user.uid;
  formData.userEmail = user.email;
  formData.userName = user.displayName;
}
```

---

## Testing Checklist

- [ ] Firebase Authentication enabled in console
- [ ] Firestore Database created
- [ ] Firebase config updated in `config.js`
- [ ] Security rules published
- [ ] Can create new account
- [ ] User appears in Authentication → Users
- [ ] User document created in Firestore → users collection
- [ ] Can sign in with created account
- [ ] Can sign out
- [ ] Error messages display correctly for invalid credentials
- [ ] Password reset email sent (test "Forgot password?")

---

## Resources

- **Firebase Auth Docs**: https://firebase.google.com/docs/auth/web/start
- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Security Rules Guide**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Console**: https://console.firebase.google.com/

---

## Need Help?

If you encounter any issues:
1. Check browser console for errors (F12 → Console tab)
2. Verify Firebase config is correct in `config.js`
3. Check Firebase Console → Authentication → Users to see if user was created
4. Check Firestore → Data to see if user document exists
5. Review security rules in Firestore → Rules

---

**Good luck with your implementation! 🚀**
