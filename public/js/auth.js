/**
 * One Sip Restaurant - Authentication Service
 * Handles user login, signup, and authentication state
 */

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} name - User's full name
 * @returns {Promise<Object>} - User object with additional data
 */
async function signUpUser(email, password, name) {
    try {
        // Create user with email and password
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with display name
        await user.updateProfile({
            displayName: name
        });

        // Create user document in Firestore
        await firebaseDB.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            displayName: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'customer', // Default role
            reservations: [], // Array of reservation IDs
            preferences: {
                emailNotifications: true,
                smsNotifications: false
            }
        });

        console.log('✅ User account created successfully:', user.uid);

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: name
            }
        };
    } catch (error) {
        console.error('❌ Signup error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User object or error
 */
async function signInUser(email, password) {
    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update last login time in Firestore
        await firebaseDB.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ User signed in successfully:', user.uid);

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }
        };
    } catch (error) {
        console.error('❌ Signin error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} - Success status
 */
async function signOutUser() {
    try {
        await firebaseAuth.signOut();
        console.log('✅ User signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Signout error:', error);
        return {
            success: false,
            error: 'Failed to sign out. Please try again.'
        };
    }
}

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null
 */
function getCurrentUser() {
    return firebaseAuth.currentUser;
}

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} - User data from Firestore
 */
async function getUserData(uid) {
    try {
        const doc = await firebaseDB.collection('users').doc(uid).get();
        if (doc.exists) {
            return {
                success: true,
                data: doc.data()
            };
        } else {
            return {
                success: false,
                error: 'User data not found'
            };
        }
    } catch (error) {
        console.error('❌ Error fetching user data:', error);
        return {
            success: false,
            error: 'Failed to fetch user data'
        };
    }
}

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} - Success status
 */
async function updateUserProfile(uid, data) {
    try {
        await firebaseDB.collection('users').doc(uid).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ User profile updated successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        return {
            success: false,
            error: 'Failed to update profile'
        };
    }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Success status
 */
async function resetPassword(email) {
    try {
        await firebaseAuth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent');
        return {
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        };
    } catch (error) {
        console.error('❌ Password reset error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 */
function onAuthStateChanged(callback) {
    firebaseAuth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            const userData = await getUserData(user.uid);
            callback({
                isAuthenticated: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    ...userData.data
                }
            });
        } else {
            // User is signed out
            callback({
                isAuthenticated: false,
                user: null
            });
        }
    });
}

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/user-not-found': 'No account found with this email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        signUpUser,
        signInUser,
        signOutUser,
        getCurrentUser,
        getUserData,
        updateUserProfile,
        resetPassword,
        onAuthStateChanged
    };
}
