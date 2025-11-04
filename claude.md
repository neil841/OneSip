# One Sip - Claude Code Behavior Guide

## Project Overview

One Sip is a modern restaurant website built with vanilla JavaScript, HTML5, CSS3, and deployed on Firebase Hosting. It features a multi-page architecture with a homepage (index.html) and dedicated pages for Menu and Reservations, along with sections for News, Locations, and Login on the homepage.

**Tech Stack:**
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Backend: Firebase Authentication, Firestore Database (future)
- Hosting: Firebase Hosting
- Testing: Chrome DevTools MCP for UI testing and debugging

**Production URL:** [To be deployed]
**Local Development:** `firebase serve` (typically runs on port 5000-5004) or `npx serve public`

---

## 🚨 CRITICAL: Local Testing Protocol

**NEVER deploy without local verification first!**

### Required Workflow for ALL Changes:
1. **Develop locally** - Make changes in `/public` directory
2. **Start local server** - `firebase serve` or `npx serve public`
3. **Test with Chrome DevTools MCP on localhost** - `http://localhost:5000`
   - Navigate to the page
   - Take snapshots of page structure
   - Take screenshots
   - Check console for errors
   - Test user interactions
   - Verify responsiveness across viewports
4. **Fix issues found** - Repeat steps 2-3 until everything is perfect
5. **Wait for explicit deploy confirmation** - Ask user before deploying
6. **Deploy only after approval** - `firebase deploy`
7. **Post-deploy sanity check** - Quick smoke test (NOT full testing)

### Why This Matters:
- **Client safety first** - Production users should never encounter broken features
- **Local = safe testing ground** - Chrome DevTools MCP catches issues before they harm anyone
- **Deployment is intentional** - Only deploy when user explicitly confirms readiness

---

## Core Architecture

### File Structure
```
/public/              # Static assets and entry point
  - index.html        # Homepage with hero, features, news, locations, login
  - menu.html         # Standalone menu page
  - reservations.html # Standalone reservations page
  - css/
    - style.css       # Main stylesheet with custom properties
  - js/
    - app.js          # Core application logic
  - images/           # Restaurant images and assets
  - firebase/         # Firebase config (gitignored)
    - config.js       # Firebase configuration (NEVER COMMIT)
/scripts/            # Backend scripts (future use)
/.claude/            # Claude Code commands and agents
  - commands/
    - git-commit.md  # Custom git commit command
/firebase.json       # Firebase hosting config
/.firebaserc         # Firebase project config (gitignored)
/claude.md           # This behavior guide
/changelog.md        # Session-by-session change log
/.gitignore          # Sensitive file protection
```

### Page Structure
- **Multi-page website** with the following architecture:
  - **index.html** (Homepage):
    - `#home` - Hero section with "Inspired Thai Cuisine" heading
    - Featured "Eat Together" section with "Make a Reservation" button → links to reservations.html
    - Feature cards section with "View Menu" button → links to menu.html
    - `#news` - Latest news section
    - `#locations` - Restaurant location information with room details
    - `#login` - User authentication section
  - **menu.html** (Menu Page):
    - Dedicated page for restaurant menu display
    - Currently shows placeholder for menu content
  - **reservations.html** (Reservations Page):
    - Dedicated page for reservation booking
    - Includes reservations hero section
    - Tock booking widget with party size, date, and time selectors

### Key Navigation Pattern
- Fixed/sticky header with navigation links on all pages
- Navigation links to separate pages (menu.html, reservations.html)
- Hash links (#news, #locations, #login) for sections on homepage
- Mobile-responsive hamburger menu
- Buttons throughout the site link to appropriate pages (not smooth scroll)

---

## Development Guidelines

### Code Style
- Use ES6+ features (async/await, arrow functions, template literals)
- Maintain consistent indentation (2 spaces)
- Add meaningful comments for complex logic
- Use descriptive variable and function names
- Avoid global scope pollution - use modules or IIFE patterns

### CSS Approach
- Use CSS custom properties (variables) for theming
- Mobile-first responsive design
- BEM or semantic class naming conventions
- Smooth transitions and animations
- Consider restaurant aesthetic: warm colors, elegant typography

### JavaScript Organization
- Modular code structure
- Event delegation for dynamic content
- Debounce scroll events for performance
- Use IntersectionObserver for scroll spy
- Handle errors gracefully with try/catch

### Firebase Integration
- Always check user authentication before Firestore operations
- Use async/await for all Firebase operations
- Handle errors gracefully with user-friendly messages
- Log Firebase operations for debugging

---

## Chrome DevTools MCP Workflows

### When to Use Chrome DevTools MCP

**Always test with Chrome DevTools MCP on localhost for:**
1. UI component changes (navigation, cards, forms, modals)
2. Layout and responsive design modifications
3. Authentication flow updates
4. JavaScript functionality changes
5. Before committing any frontend changes
6. After fixing console errors or bugs
7. Performance optimization verification

### Testing Workflow (ALWAYS ON LOCALHOST)

#### 1. Quick Visual Check (Small Changes)
```bash
# Step 1: Start local server
firebase serve  # or: npx serve public

# Step 2: List open pages
mcp__chrome-devtools__list_pages

# Step 3: Navigate to localhost
mcp__chrome-devtools__navigate_page --url="http://localhost:5000"

# Step 4: Test DESKTOP view (1920x1080)
mcp__chrome-devtools__resize_page --width=1920 --height=1080
mcp__chrome-devtools__take_snapshot  # Capture page structure
mcp__chrome-devtools__take_screenshot  # Visual verification
mcp__chrome-devtools__list_console_messages  # Check for errors

# Step 5: Test TABLET view (768x1024)
mcp__chrome-devtools__resize_page --width=768 --height=1024
mcp__chrome-devtools__take_screenshot  # Visual verification
mcp__chrome-devtools__list_console_messages  # Check for errors

# Step 6: Test MOBILE view (375x667 - iPhone SE)
mcp__chrome-devtools__resize_page --width=375 --height=667
mcp__chrome-devtools__take_screenshot  # Visual verification
mcp__chrome-devtools__list_console_messages  # Check for errors

# Step 7: Verify responsive behavior
# - No horizontal scroll on mobile
# - Text is readable (min 16px for body text)
# - Buttons are tappable (min 44x44px)
# - Navigation works on mobile (hamburger menu)
# - Images scale properly
# - No layout breaks or overlapping elements
```

#### 2. Navigation Flow Testing
```bash
# MUST run on localhost:5000
# Test on ALL THREE viewport sizes: Desktop, Tablet, Mobile

# DESKTOP (1920x1080)
mcp__chrome-devtools__resize_page --width=1920 --height=1080
1. Navigate to http://localhost:5000
2. Take snapshot of home section
3. Click "Menu" navigation link
4. Verify smooth scroll to menu section
5. Click "Reservations" link
6. Verify smooth scroll to reservations
7. Click "Locations" link
8. Verify smooth scroll to locations
9. Click "Login" link
10. Verify login modal/section appears
11. Check console for errors at each step

# TABLET (768x1024)
mcp__chrome-devtools__resize_page --width=768 --height=1024
Repeat steps 1-11, verify responsive layout

# MOBILE (375x667)
mcp__chrome-devtools__resize_page --width=375 --height=667
Repeat steps 1-11, verify:
- No horizontal scroll
- Navigation menu (hamburger) works
- Buttons are easily tappable
- Text is readable
- Smooth scroll works on mobile
```

#### 3. Form Testing (Reservations/Login)
```bash
# Test form functionality on localhost:5000
# Test on ALL viewport sizes

# DESKTOP
mcp__chrome-devtools__resize_page --width=1920 --height=1080
1. Navigate to reservations section
2. Take snapshot to get form element UIDs
3. Fill form using mcp__chrome-devtools__fill_form
4. Submit form
5. Verify validation errors display correctly
6. Verify success message appears
7. Check console for errors

# MOBILE
mcp__chrome-devtools__resize_page --width=375 --height=667
Repeat steps 1-7, verify:
- Form fields are accessible with mobile keyboard
- Submit button is easily tappable
- Validation messages are readable
- No layout breaks when keyboard appears
```

#### 4. Interactive Elements Testing
```bash
# Test buttons, links, hover states on localhost:5000

# DESKTOP (hover states matter)
mcp__chrome-devtools__resize_page --width=1920 --height=1080
1. Take snapshot to identify clickable elements
2. Use mcp__chrome-devtools__hover to test hover states
3. Use mcp__chrome-devtools__click to test button interactions
4. Verify animations and transitions work smoothly
5. Check console for errors

# MOBILE (tap states, no hover)
mcp__chrome-devtools__resize_page --width=375 --height=667
1. Test tap/touch interactions
2. Verify active states on mobile
3. Test swipe gestures (if applicable)
```

#### 5. Console Error Detection
```bash
# After every interaction, check console
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]

# Get detailed error information
mcp__chrome-devtools__get_console_message --msgid=<message-id>

# Common issues to look for:
# - JavaScript syntax errors
# - Firebase configuration errors
# - Missing image/asset 404 errors
# - CORS issues
# - Uncaught promise rejections
```

#### 6. Network Request Monitoring
```bash
# Monitor API calls and asset loading
mcp__chrome-devtools__list_network_requests

# Get detailed request information
mcp__chrome-devtools__get_network_request --reqid=<request-id>

# Check for:
# - Failed asset loads (images, fonts, CSS, JS)
# - Slow loading resources
# - Firebase API errors
# - Large file sizes affecting performance
```

#### 7. Performance Testing
```bash
# Test page load performance on localhost:5000

# Start performance trace
mcp__chrome-devtools__performance_start_trace --reload=true --autoStop=false

# Interact with page (navigate sections, submit forms)

# Stop trace and analyze
mcp__chrome-devtools__performance_stop_trace

# Review Core Web Vitals:
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms
# - Cumulative Layout Shift (CLS) < 0.1

# Get detailed insights
mcp__chrome-devtools__performance_analyze_insight --insightName="LCPBreakdown"
```

### Automated UI Iteration with Chrome DevTools MCP

**Pattern for UI Improvements (ON LOCALHOST):**
1. Start local server: `firebase serve`
2. Navigate to `http://localhost:5000` with Chrome DevTools MCP
3. Take snapshot and screenshot of current state
4. Identify visual/UX issues
5. Make code changes in `/public` directory
6. Reload localhost page: `mcp__chrome-devtools__navigate_page --url="http://localhost:5000"`
7. Take new snapshot and screenshot
8. Compare and verify improvements
9. Repeat steps 5-8 until satisfactory
10. **Ask user for deployment approval**

**Example Checklist (TEST ON ALL VIEWPORTS):**
- [ ] Proper color contrast for restaurant branding (WCAG AA)
- [ ] Smooth scroll transitions between sections
- [ ] No layout shift on page load
- [ ] Navigation highlights active section
- [ ] Hero image loads quickly and looks sharp
- [ ] Buttons have clear hover/active states (desktop) and tap feedback (mobile)
- [ ] **MOBILE (375x667):** No horizontal scroll, readable text (16px+), tappable buttons (44x44px)
- [ ] **TABLET (768x1024):** Proper layout adaptation, no element overlap
- [ ] **DESKTOP (1920x1080):** Full-width hero image, proper spacing, readable navigation
- [ ] Forms validate input properly
- [ ] Error messages are user-friendly on all devices
- [ ] Loading states for async operations (Firebase auth, form submission)

---

## Common Tasks

### Adding New Sections
1. Add section HTML in `public/index.html`
2. Add section styles in `public/css/style.css`
3. Update navigation links in header
4. Add smooth scroll target in `public/js/app.js`
5. Test with Chrome DevTools MCP on localhost (all viewports)

### Updating Menu Content
1. Update menu section in `public/index.html`
2. Or fetch from Firestore if using dynamic data
3. Test layout on all viewport sizes
4. Verify images load properly
5. Check for console errors

### Styling Changes
1. Modify CSS custom properties for global theme changes
2. Test on localhost with Chrome DevTools MCP
3. Take screenshots on all three viewport sizes
4. Verify responsive behavior
5. Check for layout breaks

### Adding Firebase Features
1. Update `public/firebase/config.js` (keep in .gitignore!)
2. Implement Firebase service (auth, Firestore)
3. Handle async operations with try/catch
4. Test authentication flow on localhost
5. Check console for Firebase errors
6. Verify error handling for failed operations

---

## Debugging Protocol

### Step 1: Console Messages
```bash
mcp__chrome-devtools__list_console_messages
mcp__chrome-devtools__get_console_message --msgid=<id>
```

### Step 2: Page Structure
```bash
mcp__chrome-devtools__take_snapshot --verbose=true
# Inspect element hierarchy and accessibility tree
```

### Step 3: Network Inspection
```bash
mcp__chrome-devtools__list_network_requests --resourceTypes=["document", "script", "stylesheet", "image"]
mcp__chrome-devtools__get_network_request --reqid=<id>
```

### Step 4: JavaScript Debugging
```bash
# Execute JavaScript to inspect state
mcp__chrome-devtools__evaluate_script --function="() => { return window.myGlobalState; }"

# Test specific functionality
mcp__chrome-devtools__evaluate_script --function="() => { document.querySelector('.nav-link').click(); return 'clicked'; }"
```

### Step 5: Visual Debugging
```bash
# Take screenshots to identify visual issues
mcp__chrome-devtools__take_screenshot --fullPage=true

# Take screenshot of specific element
mcp__chrome-devtools__take_screenshot --uid=<element-uid>
```

---

## Chrome DevTools MCP Best Practices

### Navigation Testing
- Always wait for page load before taking snapshots
- Use `mcp__chrome-devtools__wait_for` for dynamic content
- Verify smooth scroll behavior
- Test scroll spy highlighting

### Form Testing
```bash
# Get form structure first
mcp__chrome-devtools__take_snapshot

# Fill multiple form fields at once
mcp__chrome-devtools__fill_form --elements='[{"uid":"input-name","value":"John Doe"},{"uid":"input-email","value":"john@example.com"}]'

# Or fill individual fields
mcp__chrome-devtools__fill --uid="input-phone" --value="555-1234"
```

### Screenshot Strategy
- Take full-page screenshots for landing/home page
- Take viewport screenshots for specific sections
- Take element screenshots for isolated components
- Compare before/after for iterative improvements
- Always test all three viewport sizes

### Performance Monitoring
- Use performance traces for page load optimization
- Analyze LCP for hero image loading
- Check for layout shifts (CLS)
- Monitor JavaScript execution time
- Optimize images for web (WebP, lazy loading)

---

## Testing Checklist

### Before Every Commit
- [ ] Start local server: `firebase serve`
- [ ] Test on localhost:5000 with Chrome DevTools MCP
- [ ] **Test on DESKTOP (1920x1080)** - Take snapshot + screenshot, check console
- [ ] **Test on TABLET (768x1024)** - Take screenshot, check console
- [ ] **Test on MOBILE (375x667)** - Take screenshot, check console
- [ ] No console errors on localhost (any viewport)
- [ ] Navigation smooth scrolls to all sections (all viewports)
- [ ] Forms validate and submit properly (all viewports)
- [ ] Images load correctly (all viewports)
- [ ] No horizontal scroll on mobile
- [ ] All interactive elements tappable on mobile (min 44x44px)
- [ ] Text readable on all devices (min 16px body text)

### Before Deploying (User Must Approve)
- [ ] All "Before Every Commit" checks passed on localhost
- [ ] Full navigation flow tested on `http://localhost:5000` (all viewports)
- [ ] Zero console errors on localhost (all viewports)
- [ ] Screenshots show UI is perfect on desktop, tablet, AND mobile
- [ ] Mobile responsiveness verified (no horizontal scroll, tappable buttons, readable text)
- [ ] Performance trace shows acceptable Core Web Vitals
- [ ] User explicitly confirms: "ready to deploy"
- [ ] **ONLY THEN:** Run `firebase deploy`

### After Deploying (Quick Sanity Check Only)
- [ ] Navigate to production URL
- [ ] Quick smoke test (home page loads, navigation works)
- [ ] Check for critical console errors
- [ ] **NOT for full testing - that was done on localhost!**

---

## Performance Optimization

### Images
- Use WebP format for modern browsers with PNG/JPG fallback
- Implement lazy loading for below-the-fold images
- Optimize hero image size (max 1920px width)
- Use responsive images with `srcset` and `sizes`

### CSS
- Use CSS custom properties for theming
- Minimize CSS file size
- Use CSS transforms for animations (not position)
- Load critical CSS inline, defer non-critical

### JavaScript
- Debounce scroll event listeners
- Use IntersectionObserver for scroll spy (more performant)
- Minimize DOM manipulation
- Load non-critical JS asynchronously

### Firebase
- Lazy load Firebase SDK modules
- Use Firebase Performance Monitoring
- Optimize Firestore queries (if used)
- Cache Firebase config

---

## Security Considerations

### Sensitive Files (NEVER COMMIT)
- `public/firebase/config.js` - Contains Firebase API keys
- `scripts/serviceAccountKey.json` - Firebase Admin SDK credentials
- `.env` files - Environment variables
- `.firebaserc` - Firebase project configuration

### Client-Side Security
- Validate all user input before submission
- Sanitize user input to prevent XSS
- Use Firebase Security Rules for Firestore
- Implement rate limiting for forms
- Use HTTPS (automatic with Firebase Hosting)

### Firebase Security Rules (Future)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{reservation} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Deployment

### ⚠️ CRITICAL: Deployment is ONLY after localhost verification

### Pre-Deployment Checklist (MANDATORY)
- [ ] All changes tested on `http://localhost:5000` with Chrome DevTools MCP
- [ ] Zero console errors on localhost (all viewports)
- [ ] All user flows work perfectly on localhost (all viewports)
- [ ] Screenshots confirm UI is correct on desktop, tablet, mobile
- [ ] Performance trace shows acceptable metrics
- [ ] User explicitly says: "deploy now" or "ready to deploy"

### Firebase Setup (First Time)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select options:
# - Hosting
# - Use existing project or create new
# - Public directory: public
# - Single-page app: Yes
# - Automatic builds: No

# This creates firebase.json and .firebaserc
```

### Firebase Hosting Commands
```bash
# Test locally before deploying
firebase serve
# Visit http://localhost:5000

# ONLY run after user approval!

# Deploy everything
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy with custom message
firebase deploy -m "Deploying One Sip restaurant website v1.0"
```

### Custom Domain Setup (via Firebase)
```bash
# After initial deploy, add custom domain in Firebase Console:
# 1. Go to Firebase Console > Hosting
# 2. Click "Add custom domain"
# 3. Enter your domain (e.g., onesip.com)
# 4. Follow DNS verification steps
# 5. Add DNS records provided by Firebase
# 6. Wait for SSL certificate provisioning (can take 24-48 hours)

# Or use Firebase CLI:
firebase hosting:channel:deploy live --domain onesip.com
```

### Post-Deploy Sanity Check (NOT Full Testing)
1. Navigate to production URL
2. Quick smoke test (home page loads, hero image displays)
3. Check one navigation link works
4. Check for critical console errors only
5. **Full testing was done on localhost - this is just verification**

---

## Common Issues & Solutions

### Issue: Smooth scroll not working
- **Cause:** CSS `scroll-behavior` not supported or JS not bound
- **Debug:** Check browser console, verify event listeners attached
- **Solution:** Use JS polyfill for smooth scroll, check CSS support

### Issue: Navigation not highlighting active section
- **Cause:** IntersectionObserver not set up or scroll spy logic broken
- **Debug:** Log scroll position and section positions
- **Solution:** Verify IntersectionObserver configuration, check section IDs match

### Issue: Mobile menu not opening
- **Cause:** Event listener not attached or CSS classes not toggling
- **Debug:** Check console for JS errors, inspect element classes
- **Solution:** Verify hamburger click handler, check CSS display properties

### Issue: Hero image not loading or too slow
- **Cause:** Image too large, wrong path, or not optimized
- **Debug:** Check Network tab for 404 or slow load times
- **Solution:** Optimize image (compress, resize), use WebP format, implement lazy loading

### Issue: Form submission fails
- **Cause:** Validation error, Firebase error, or network issue
- **Debug:** Check console for errors, inspect network requests
- **Solution:** Verify form validation logic, check Firebase configuration, handle errors gracefully

### Issue: Console errors on production but not localhost
- **Cause:** Different Firebase config, CORS issues, or caching
- **Debug:** Hard refresh production (Cmd+Shift+R), compare Firebase configs
- **Solution:** Verify production Firebase config, clear browser cache, check CORS settings

---

## Feature Development Template

### Adding a New Feature
1. **Plan:** Define requirements, mockup UI, identify data needs
2. **HTML:** Add semantic structure in `public/index.html`
3. **CSS:** Style in `public/css/style.css` with responsive design
4. **JavaScript:** Implement logic in `public/js/app.js`
5. **Test with Chrome DevTools MCP:**
   - Visual check (snapshot + screenshots on all viewports)
   - User flow test (navigate, interact, submit)
   - Console error check
   - Network request monitoring
   - Performance trace
6. **Document:** Update this guide and changelog.md
7. **Deploy:** Get user approval → Firebase deploy → Post-deploy verification

---

## AI Assistant Instructions

### When Asked to Make Changes
1. Read relevant files first (don't assume structure)
2. Understand current implementation before modifying
3. Make changes in `/public` directory
4. Start local server: `firebase serve`
5. **Test on localhost:5000 with Chrome DevTools MCP**
6. **Test ALL three viewports:**
   - Desktop (1920x1080) - Take snapshot + screenshot, check console
   - Tablet (768x1024) - Take screenshot, check console
   - Mobile (375x667) - Take screenshot, check console
7. Verify responsiveness:
   - No horizontal scroll on mobile
   - Buttons are tappable (min 44x44px)
   - Text is readable (min 16px)
   - Layouts adapt properly
   - Navigation works on all devices
8. Check console for errors on all viewports
9. Show all screenshots to user (desktop, tablet, mobile)
10. Fix any issues found
11. Repeat steps 5-10 until perfect on all devices
12. **Ask user: "Ready to deploy?" - wait for explicit approval**
13. Only deploy after user confirms

### When Debugging Issues
1. Ask for reproduction steps (which device/viewport?)
2. Start local server: `firebase serve`
3. Navigate to `http://localhost:5000` with Chrome DevTools MCP
4. Reproduce issue on localhost (test all viewports if device-specific)
5. Capture console logs (`list_console_messages`) and screenshots
6. Inspect network requests if API/loading issue
7. Identify root cause before proposing fix
8. Make fix in `/public` directory
9. Test fix on localhost with Chrome DevTools MCP (all three viewports)
10. Verify fix completely resolves issue on all devices
11. Take screenshots showing fix works on desktop, tablet, mobile
12. **Ask user: "Ready to deploy?" - wait for approval**
13. Document issue and solution in changelog.md

### Chrome DevTools MCP Integration Principles (ALL ON LOCALHOST)
- **Agentic UI Iteration:** Analyze localhost snapshots/screenshots (all viewports) → identify issues → make changes → verify on localhost → repeat
- **Automated UI Fixes:** Use localhost console logs to find errors → fix in code → verify with Chrome DevTools MCP on localhost (all viewports)
- **Reproduce User Flows:** Record user steps → automate with Chrome DevTools MCP on localhost:5000 → verify expected behavior (all viewports)
- **Responsive Testing:** Always test desktop (1920x1080), tablet (768x1024), mobile (375x667) for every change
- **Performance Optimization:** Use performance traces to identify bottlenecks → optimize → verify improvements
- **Deploy Only After:** All localhost tests pass on all viewports + user approval

### Update Changelog
After completing any significant feature or fix:
1. Open `/changelog.md`
2. Add entry with date, description, and files changed
3. Use clear, concise language
4. Group related changes together

---

## Quick Reference

### Key Files
- `public/index.html` - Main page structure with semantic sections
- `public/css/style.css` - Styles with CSS custom properties
- `public/js/app.js` - Application logic, navigation, interactivity
- `public/firebase/config.js` - Firebase configuration (NEVER COMMIT)
- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project ID (gitignored)
- `claude.md` - This behavior guide
- `changelog.md` - Development history
- `.gitignore` - Sensitive file protection

### Key Sections (index.html)
- `#home` - Hero section with specialty meal image
- `#menu` - Menu display
- `#reservations` - Reservation form
- `#locations` - Location information
- `#login` - Authentication

### Key CSS Classes (style.css)
- `.hero` - Full-screen hero section
- `.nav-header` - Fixed navigation header
- `.nav-link` - Navigation menu items
- `.section` - Main content sections
- `.btn` - Button styles
- `.form-group` - Form field containers

### Key Functions (app.js)
- `smoothScrollTo(target)` - Smooth scroll to section
- `highlightActiveSection()` - Update active nav link
- `initScrollSpy()` - Set up IntersectionObserver
- `handleReservationForm()` - Process reservation submission
- `toggleMobileMenu()` - Open/close mobile navigation

### Chrome DevTools MCP Key Commands
```bash
# Navigation
mcp__chrome-devtools__navigate_page --url="http://localhost:5000"
mcp__chrome-devtools__list_pages
mcp__chrome-devtools__select_page --pageIdx=0

# Viewport Testing
mcp__chrome-devtools__resize_page --width=1920 --height=1080  # Desktop
mcp__chrome-devtools__resize_page --width=768 --height=1024   # Tablet
mcp__chrome-devtools__resize_page --width=375 --height=667    # Mobile

# Page Analysis
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__list_console_messages
mcp__chrome-devtools__list_network_requests

# Interaction
mcp__chrome-devtools__click --uid="<element-uid>"
mcp__chrome-devtools__fill --uid="<input-uid>" --value="text"
mcp__chrome-devtools__fill_form --elements='[...]'
mcp__chrome-devtools__hover --uid="<element-uid>"

# Debugging
mcp__chrome-devtools__get_console_message --msgid=<id>
mcp__chrome-devtools__get_network_request --reqid=<id>
mcp__chrome-devtools__evaluate_script --function="() => { ... }"

# Performance
mcp__chrome-devtools__performance_start_trace --reload=true
mcp__chrome-devtools__performance_stop_trace
mcp__chrome-devtools__performance_analyze_insight --insightName="..."
```

---

## Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Hosting:** https://firebase.google.com/docs/hosting
- **Chrome DevTools MCP:** https://github.com/microsoft/playwright-mcp (similar tools)
- **MDN Web Docs:** https://developer.mozilla.org/
- **Restaurant Website Best Practices:** [Research modern restaurant websites]

---

**Restaurant:** One Sip
**Last Updated:** November 2025
**Maintained By:** One Sip Development Team
