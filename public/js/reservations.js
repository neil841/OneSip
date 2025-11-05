/**
 * Reservations Management
 * Handles reservation form submission and Firestore integration
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const reservationForm = document.getElementById('reservation-form');
    const submitButton = document.getElementById('submit-reservation');
    const messageDiv = document.getElementById('reservation-message');

    // Set minimum date to today
    const dateInput = document.getElementById('reservation-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Set maximum date to 1 month from today
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

    // Handle form submission
    if (reservationForm) {
        reservationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Disable submit button
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            // Clear previous messages
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';

            try {
                // Get form data
                const formData = {
                    customerName: document.getElementById('customer-name').value.trim(),
                    customerPhone: document.getElementById('customer-phone').value.trim(),
                    customerEmail: document.getElementById('customer-email').value.trim() || null,
                    partySize: document.getElementById('party-size').value,
                    reservationDate: document.getElementById('reservation-date').value,
                    reservationTime: document.getElementById('reservation-time').value,
                    specialRequests: document.getElementById('special-requests').value.trim() || null,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Validate phone number (Indian format)
                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(formData.customerPhone)) {
                    throw new Error('Please enter a valid 10-digit Indian phone number');
                }

                // Validate date is not in the past
                const selectedDate = new Date(formData.reservationDate);
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);

                if (selectedDate < todayDate) {
                    throw new Error('Please select a future date');
                }

                // Check if Firebase is initialized
                if (typeof firebase === 'undefined' || !firebase.apps.length) {
                    throw new Error('Firebase is not initialized. Please check your configuration.');
                }

                // Get Firestore instance
                const db = firebase.firestore();

                // Save to Firestore
                const docRef = await db.collection('reservations').add(formData);

                console.log('Reservation created with ID:', docRef.id);

                // Show success message
                messageDiv.textContent = '✓ Reservation request submitted successfully! We will contact you shortly to confirm.';
                messageDiv.className = 'form-message form-message-success';

                // Reset form
                reservationForm.reset();

                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Re-enable button after 3 seconds
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Reserve Table';
                }, 3000);

            } catch (error) {
                console.error('Error submitting reservation:', error);

                // Show error message
                let errorMessage = 'An error occurred. Please try again or call us directly.';

                if (error.message) {
                    errorMessage = error.message;
                }

                messageDiv.textContent = '✗ ' + errorMessage;
                messageDiv.className = 'form-message form-message-error';

                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Reserve Table';

                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // Phone number formatting (add spaces for readability as user types)
    const phoneInput = document.getElementById('customer-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove all non-digits
            let value = e.target.value.replace(/\D/g, '');

            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }

            e.target.value = value;
        });
    }
});
