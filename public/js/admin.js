/**
 * Admin Dashboard for One Sip Restaurant
 * Manages reservations, authentication, and admin features
 */

let currentUser = null;
let allReservations = [];
let filteredReservations = [];

// DOM Elements
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('admin-login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('admin-user-email');
const reservationsTable = document.getElementById('reservations-table');
const loadingDiv = document.getElementById('loading');
const noReservationsDiv = document.getElementById('no-reservations');
const reservationModal = document.getElementById('reservation-modal');
const closeModal = document.getElementById('close-modal');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            showDashboard();
        } else {
            showLogin();
        }
    });

    // Login form submit
    loginForm.addEventListener('submit', handleLogin);

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Filter controls
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-date').addEventListener('change', applyFilters);
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Modal close
    closeModal.addEventListener('click', () => {
        reservationModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === reservationModal) {
            reservationModal.style.display = 'none';
        }
    });
});

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.className = 'form-message error';
        errorDiv.style.display = 'block';
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await firebase.auth().signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Show login screen
 */
function showLogin() {
    adminLogin.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

/**
 * Show dashboard
 */
function showDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    userEmailSpan.textContent = currentUser.email;
    loadReservations();
}

/**
 * Load reservations from Firestore
 */
function loadReservations() {
    const db = firebase.firestore();

    // Real-time listener
    db.collection('reservations')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            allReservations = [];

            snapshot.forEach(doc => {
                allReservations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            filteredReservations = [...allReservations];
            updateStats();
            renderReservations();
        }, error => {
            console.error('Error loading reservations:', error);
            loadingDiv.textContent = 'Error loading reservations: ' + error.message;
        });
}

/**
 * Update statistics
 */
function updateStats() {
    const today = new Date().toISOString().split('T')[0];

    const todayCount = allReservations.filter(r => r.reservationDate === today).length;
    const pendingCount = allReservations.filter(r => r.status === 'pending').length;
    const confirmedCount = allReservations.filter(r => r.status === 'confirmed').length;

    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-pending').textContent = pendingCount;
    document.getElementById('stat-confirmed').textContent = confirmedCount;
    document.getElementById('stat-total').textContent = allReservations.length;
}

/**
 * Render reservations table
 */
function renderReservations() {
    loadingDiv.style.display = 'none';

    if (filteredReservations.length === 0) {
        noReservationsDiv.style.display = 'block';
        reservationsTable.style.display = 'none';
        return;
    }

    noReservationsDiv.style.display = 'none';
    reservationsTable.style.display = 'block';

    reservationsTable.innerHTML = filteredReservations.map(reservation => `
        <div class="reservation-item" onclick="showReservationDetails('${reservation.id}')">
            <div class="reservation-item-header">
                <div class="reservation-customer">${reservation.customerName}</div>
                <div class="reservation-status status-${reservation.status}">
                    ${reservation.status}
                </div>
            </div>
            <div class="reservation-item-details">
                <div class="reservation-detail">
                    <span class="reservation-detail-label">Date</span>
                    <span class="reservation-detail-value">${formatDate(reservation.reservationDate)}</span>
                </div>
                <div class="reservation-detail">
                    <span class="reservation-detail-label">Time</span>
                    <span class="reservation-detail-value">${reservation.reservationTime}</span>
                </div>
                <div class="reservation-detail">
                    <span class="reservation-detail-label">Party Size</span>
                    <span class="reservation-detail-value">${reservation.partySize} guests</span>
                </div>
                <div class="reservation-detail">
                    <span class="reservation-detail-label">Phone</span>
                    <span class="reservation-detail-value">${reservation.customerPhone}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Apply filters
 */
function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const dateFilter = document.getElementById('filter-date').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    filteredReservations = allReservations.filter(reservation => {
        // Status filter
        if (statusFilter !== 'all' && reservation.status !== statusFilter) {
            return false;
        }

        // Date filter
        if (dateFilter && reservation.reservationDate !== dateFilter) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const searchText = `${reservation.customerName} ${reservation.customerPhone}`.toLowerCase();
            if (!searchText.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    renderReservations();
}

/**
 * Clear filters
 */
function clearFilters() {
    document.getElementById('filter-status').value = 'all';
    document.getElementById('filter-date').value = '';
    document.getElementById('search-input').value = '';
    applyFilters();
}

/**
 * Show reservation details modal
 */
function showReservationDetails(reservationId) {
    const reservation = allReservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="reservation-detail-modal">
            <div class="detail-group">
                <span class="detail-label">Customer Name</span>
                <div class="detail-value">${reservation.customerName}</div>
            </div>

            <div class="detail-group">
                <span class="detail-label">Phone Number</span>
                <div class="detail-value">
                    <a href="tel:${reservation.customerPhone}">${reservation.customerPhone}</a>
                </div>
            </div>

            ${reservation.customerEmail ? `
            <div class="detail-group">
                <span class="detail-label">Email</span>
                <div class="detail-value">
                    <a href="mailto:${reservation.customerEmail}">${reservation.customerEmail}</a>
                </div>
            </div>
            ` : ''}

            <div class="detail-group">
                <span class="detail-label">Date</span>
                <div class="detail-value">${formatDate(reservation.reservationDate)}</div>
            </div>

            <div class="detail-group">
                <span class="detail-label">Time</span>
                <div class="detail-value">${reservation.reservationTime}</div>
            </div>

            <div class="detail-group">
                <span class="detail-label">Party Size</span>
                <div class="detail-value">${reservation.partySize} guests</div>
            </div>

            ${reservation.specialRequests ? `
            <div class="detail-group">
                <span class="detail-label">Special Requests</span>
                <div class="detail-value">${reservation.specialRequests}</div>
            </div>
            ` : ''}

            <div class="detail-group">
                <span class="detail-label">Status</span>
                <div class="detail-value">
                    <span class="reservation-status status-${reservation.status}">
                        ${reservation.status}
                    </span>
                </div>
            </div>

            <div class="detail-group">
                <span class="detail-label">Reservation ID</span>
                <div class="detail-value" style="font-family: monospace; font-size: 0.85rem;">
                    ${reservation.id}
                </div>
            </div>

            <div class="detail-group">
                <span class="detail-label">Created At</span>
                <div class="detail-value">${formatTimestamp(reservation.createdAt)}</div>
            </div>

            <div class="modal-actions">
                ${reservation.status === 'pending' ? `
                    <button class="btn btn-primary" onclick="updateReservationStatus('${reservation.id}', 'confirmed')">
                        Confirm
                    </button>
                ` : ''}
                ${reservation.status !== 'cancelled' ? `
                    <button class="btn btn-secondary" onclick="updateReservationStatus('${reservation.id}', 'cancelled')">
                        Cancel
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="deleteReservation('${reservation.id}')">
                    Delete
                </button>
            </div>
        </div>
    `;

    reservationModal.style.display = 'block';
}

/**
 * Update reservation status
 */
async function updateReservationStatus(reservationId, newStatus) {
    try {
        const db = firebase.firestore();
        await db.collection('reservations').doc(reservationId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        reservationModal.style.display = 'none';
        alert(`Reservation ${newStatus} successfully!`);
    } catch (error) {
        console.error('Error updating reservation:', error);
        alert('Error updating reservation: ' + error.message);
    }
}

/**
 * Delete reservation
 */
async function deleteReservation(reservationId) {
    if (!confirm('Are you sure you want to delete this reservation? This cannot be undone.')) {
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('reservations').doc(reservationId).delete();

        reservationModal.style.display = 'none';
        alert('Reservation deleted successfully!');
    } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation: ' + error.message);
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        date = new Date(timestamp);
    }

    return date.toLocaleString('en-IN');
}
