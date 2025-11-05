# One Sip Reservation System - Setup & Deployment Guide

## 🎉 What's Been Built

A complete, professional reservation system with:

1. ✅ **Beautiful Reservation Form** - Fully responsive, matches your branding
2. ✅ **Firebase Firestore Database** - Stores all reservations securely
3. ✅ **Email Notifications** - Automatic emails to managers AND customers via SendGrid
4. ✅ **Admin Dashboard** - View, manage, confirm/cancel reservations
5. ✅ **Security Rules** - Proper Firestore security configured

---

## 📋 Quick Setup Checklist

- [x] Reservation form created
- [x] Firestore database configured
- [x] Cloud Functions written
- [x] SendGrid integration ready
- [x] Admin dashboard built
- [ ] **Configure SendGrid API key** (YOU NEED TO DO THIS)
- [ ] **Create admin user** (YOU NEED TO DO THIS)
- [ ] Test on localhost
- [ ] Deploy to Firebase

---

## 🚀 Step-by-Step Deployment

### Step 1: Configure SendGrid API Key

Get your SendGrid API key from [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)

**Set it in Firebase:**

```bash
cd /Users/neilbiswas/OneSip

# Set SendGrid API key for Cloud Functions
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY_HERE"

# Or add to functions/.env file:
echo 'SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE' > functions/.env
```

This stores your API key securely in Firebase (won't be committed to git).

---

### Step 2: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "One Sip Restaurant" project
3. Click **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in production mode** (we have custom rules)
6. Select location: **asia-south1** (Mumbai - closest to Kolkata)
7. Click **Enable**

---

### Step 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This sets up security so:
- Anyone can create reservations (from your website)
- Only authenticated admins can view/edit them

---

### Step 4: Create Admin User

You need at least one admin account to access the dashboard.

**Option A: Via Firebase Console (Easiest)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Authentication** → **Get Started**
4. Click **Sign-in method** tab
5. Enable **Email/Password**
6. Click **Users** tab
7. Click **Add User**
8. Enter:
   - Email: `admin@onesip.com` (or any email you want)
   - Password: Create a strong password
9. Click **Add User**

**Option B: Via Firebase CLI**
```bash
# This will be done in Firebase Console (easier)
```

---

### Step 5: Deploy Cloud Functions

```bash
cd /Users/neilbiswas/OneSip

# Deploy functions
firebase deploy --only functions
```

This deploys the email notification system. Every time someone makes a reservation:
- Managers get an email at `biswas31@yahoo.com` and `neilbiswas13@gmail.com`
- Customer gets a confirmation email (if they provided email)

**Note:** First deployment may take 3-5 minutes.

---

### Step 6: Test Locally First

```bash
# Make sure you're in the OneSip directory
cd /Users/neilbiswas/OneSip

# Start local server
firebase serve
```

Visit: `http://localhost:5000`

**Test the reservation form:**
1. Go to `http://localhost:5000/reservations.html`
2. Fill out the form with test data
3. Submit the form
4. You should see: "Reservation request submitted successfully!"

**Check Firestore:**
1. Go to Firebase Console → Firestore Database
2. You should see a new document in the `reservations` collection

**Check Email (after deploying functions):**
- Managers should receive email
- Customer should receive confirmation (if email was provided)

**Test Admin Dashboard:**
1. Go to `http://localhost:5000/admin.html`
2. Login with the admin credentials you created
3. You should see your test reservation
4. Try confirming/cancelling it

---

### Step 7: Full Deployment

Once everything works on localhost:

```bash
# Deploy EVERYTHING
firebase deploy

# Or deploy individually:
firebase deploy --only hosting    # Website
firebase deploy --only firestore   # Database rules
firebase deploy --only functions   # Email notifications
```

---

## 🔐 Security Notes

### What's Protected:
- SendGrid API key is stored in Firebase (not in code)
- Firestore rules prevent unauthorized access
- Admin dashboard requires authentication
- Customer data is secure

### Important Files (NEVER COMMIT THESE):
- `public/firebase/config.js` - Contains Firebase credentials
- `functions/node_modules/` - Auto-generated
- `.firebaserc` - Project ID (already in .gitignore)

---

## 📧 Email Configuration

### Sender Verification (SendGrid Requirement)

SendGrid requires you to verify the sender email (`reservations@onesip.co.in`).

**Steps:**
1. Go to [SendGrid Settings → Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Click **Verify a Single Sender**
3. Fill in:
   - From Name: `One Sip Restaurant`
   - From Email Address: `reservations@onesip.co.in`
   - Reply To: `biswas31@yahoo.com`
   - Company Name: `One Sip`
   - Address: `5th Floor, Terminus Building, BG-12, Newtown, Kolkata`
4. Click **Create**
5. SendGrid will send a verification email to `reservations@onesip.co.in`
6. **YOU MUST CHECK THAT EMAIL AND CLICK THE VERIFICATION LINK**

**Alternative (if you don't have access to reservations@onesip.co.in yet):**

For now, you can use a verified email you DO have access to:
1. Update `functions/index.js` line 16:
   ```javascript
   const FROM_EMAIL = 'biswas31@yahoo.com'; // Temporary, change after domain setup
   ```
2. Verify `biswas31@yahoo.com` in SendGrid
3. Later, when your domain is set up, switch to `reservations@onesip.co.in`

---

## 📱 How the System Works

### Customer Flow:
1. Customer visits `onesip.co.in/reservations.html`
2. Fills out reservation form
3. Clicks "Reserve Table"
4. Form saves to Firestore
5. Customer sees success message
6. Customer receives confirmation email (if provided)

### Manager Flow:
1. Firestore detects new reservation
2. Cloud Function automatically triggers
3. Emails sent to:
   - `biswas31@yahoo.com`
   - `neilbiswas13@gmail.com`
4. Emails contain all reservation details
5. Manager calls customer to confirm

### Admin Dashboard Flow:
1. Manager visits `onesip.co.in/admin.html`
2. Logs in with admin credentials
3. Sees all reservations in real-time
4. Can filter by status, date, search names
5. Click any reservation to see full details
6. Can confirm/cancel/delete reservations

---

## 🎯 Testing Checklist

### Before Going Live:

- [ ] Test reservation form on desktop (1920x1080)
- [ ] Test reservation form on tablet (768x1024)
- [ ] Test reservation form on mobile (375x667)
- [ ] Verify reservation appears in Firestore
- [ ] Verify managers receive email
- [ ] Verify customer receives confirmation email
- [ ] Test admin login
- [ ] Test viewing reservations in admin dashboard
- [ ] Test confirming a reservation
- [ ] Test cancelling a reservation
- [ ] Test search and filters
- [ ] Verify no console errors

---

## 🆘 Troubleshooting

### "Firebase is not defined"
- Make sure `firebase/config.js` exists
- Check Firebase SDK is loaded in HTML

### "Permission denied" when creating reservation
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check Firestore is enabled in Firebase Console

### Emails not sending
- Check SendGrid API key is configured: `firebase functions:config:get`
- Verify sender email in SendGrid
- Check Cloud Functions are deployed: `firebase deploy --only functions`
- Check Functions logs in Firebase Console

### Can't login to admin dashboard
- Make sure you created an admin user
- Check Authentication is enabled in Firebase Console
- Verify you're using the correct email/password

### Reservation form shows error
- Check browser console for error messages
- Verify Firestore rules are deployed
- Check Firebase config is correct

---

## 📊 Viewing Logs

### Firebase Console Logs:
1. Go to Firebase Console
2. Click **Functions** → **Logs**
3. See all function executions and errors

### Local Testing Logs:
```bash
# Check browser console (F12 → Console tab)
# Check terminal output where firebase serve is running
```

---

## 🎨 Customization

### Change Time Slots:
Edit `public/reservations.html` lines 98-113 to modify available reservation times.

### Change Manager Emails:
Edit `functions/index.js` line 18:
```javascript
const MANAGER_EMAILS = ['your@email.com', 'another@email.com'];
```

Then redeploy:
```bash
firebase deploy --only functions
```

### Change Email Templates:
Edit `functions/index.js` starting at line 51 (manager email) and line 154 (customer email).

---

## 🔄 Updating After Changes

### Update Hosting (HTML/CSS/JS):
```bash
firebase deploy --only hosting
```

### Update Functions (Email logic):
```bash
firebase deploy --only functions
```

### Update Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

---

## 💰 Cost Estimate

**Firebase:**
- Hosting: FREE (for your traffic)
- Firestore: FREE (for ~50-100 reservations/month)
- Functions: FREE (for ~125k invocations/month)

**SendGrid:**
- FREE tier: 100 emails/day
- Cost: $0/month for low volume

**Total:** $0/month for a small restaurant! 🎉

If you grow to 100+ reservations/day, costs stay under $10/month.

---

## 🚀 Next Steps

1. **Right now:** Configure SendGrid API key
2. **Right now:** Create admin user
3. **Next:** Test on localhost
4. **Tomorrow:** Deploy to production
5. **Future:** Add SMS notifications (optional)

---

## 📞 Support

If something doesn't work:
1. Check Firebase Console → Functions → Logs
2. Check browser console (F12 → Console)
3. Verify all steps in this guide
4. Ask me for help! 😊

---

**Built with ❤️ for One Sip Restaurant**
