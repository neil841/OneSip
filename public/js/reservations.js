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

                // Hide the form message
                messageDiv.style.display = 'none';

                // Show premium success UI
                showSuccessUI(formData);

                // Reset form (but keep it hidden)
                reservationForm.reset();

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

/**
 * Show Premium Success UI
 * Replaces the reservation form with a celebratory success message
 */
function showSuccessUI(reservationData) {
    const bookingWidget = document.querySelector('.booking-widget');

    if (!bookingWidget) return;

    // Format the date nicely
    const date = new Date(reservationData.reservationDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', options);

    // Create success UI
    const successHTML = `
        <div class="reservation-success">
            <div class="success-icon">
                <svg viewBox="0 0 100 100" class="success-checkmark">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" stroke-width="3" class="checkmark-circle"/>
                    <path d="M30 50 L45 65 L70 35" fill="none" stroke="#D4AF37" stroke-width="4" stroke-linecap="round" class="checkmark-path"/>
                </svg>
            </div>

            <h2 class="success-title">Reservation Confirmed!</h2>
            <p class="success-subtitle">Thank you for choosing One Sip</p>

            <div class="success-details">
                <div class="success-detail-item">
                    <span class="detail-icon">📅</span>
                    <div class="detail-content">
                        <p class="detail-label">Date & Time</p>
                        <p class="detail-value">${formattedDate}<br>${reservationData.reservationTime}</p>
                    </div>
                </div>

                <div class="success-detail-item">
                    <span class="detail-icon">👥</span>
                    <div class="detail-content">
                        <p class="detail-label">Party Size</p>
                        <p class="detail-value">${reservationData.partySize} ${reservationData.partySize === '1' ? 'Guest' : 'Guests'}</p>
                    </div>
                </div>

                <div class="success-detail-item">
                    <span class="detail-icon">👤</span>
                    <div class="detail-content">
                        <p class="detail-label">Reserved For</p>
                        <p class="detail-value">${reservationData.customerName}</p>
                    </div>
                </div>
            </div>

            <div class="success-message-box">
                <h3>What's Next?</h3>
                <p>We've sent confirmation emails to both you and our team. Our staff will contact you shortly at <strong>${reservationData.customerPhone}</strong> to finalize your reservation.</p>
                ${reservationData.customerEmail ? `<p class="email-note">Check your inbox at <strong>${reservationData.customerEmail}</strong> for confirmation details.</p>` : ''}
            </div>

            <div class="success-actions">
                <button class="btn btn-book" onclick="location.href='index.html'">Back to Home</button>
                <button class="btn btn-outline" onclick="makeAnotherReservation()">Make Another Reservation</button>
            </div>

            <div class="success-footer">
                <p>Need to make changes? Call us at <strong>9477742555 | 6292200353</strong></p>
                <p class="footer-tagline">We look forward to serving you! 🍽️</p>
            </div>
        </div>
    `;

    // Fade out form, then replace with success UI
    bookingWidget.style.opacity = '0';
    bookingWidget.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
        bookingWidget.innerHTML = successHTML;
        bookingWidget.style.opacity = '1';

        // Scroll to top of success UI
        bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Trigger celebration animation
        setTimeout(() => {
            const successIcon = document.querySelector('.success-icon');
            if (successIcon) {
                successIcon.classList.add('animate');
            }
        }, 200);
    }, 400);
}

/**
 * Make Another Reservation
 * Reloads the page to show fresh form
 */
function makeAnotherReservation() {
    window.location.reload();
}
