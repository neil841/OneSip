/**
 * Firebase Cloud Functions for One Sip Restaurant
 * Handles reservation email notifications via SendGrid
 */

const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const {defineSecret} = require('firebase-functions/params');

// Initialize Firebase Admin
admin.initializeApp();

// SendGrid API Key from environment variable
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

// Configuration
const FROM_EMAIL = 'noreply@onesip.co.in'; // Domain authenticated with SendGrid
const MANAGER_EMAILS = ['biswas31@yahoo.com', 'neilbiswas13@gmail.com'];
const RESTAURANT_NAME = 'One Sip';
const RESTAURANT_PHONE = '9477742555 | 6292200353';

/**
 * Firestore Trigger: Send emails when new reservation is created
 */
exports.sendReservationEmails = onDocumentCreated('reservations/{reservationId}', async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log('No data associated with the event');
      return;
    }
    const reservationId = event.params.reservationId;
    const reservation = snap.data();

    console.log(`New reservation created: ${reservationId}`, reservation);

    try {
      // Email to Managers
      const managerEmailPromises = MANAGER_EMAILS.map(email =>
        sendManagerNotification(email, reservation, reservationId)
      );

      // Email to Customer (if email provided)
      const customerEmailPromise = reservation.customerEmail
        ? sendCustomerConfirmation(reservation)
        : Promise.resolve();

      // Send all emails
      await Promise.all([...managerEmailPromises, customerEmailPromise]);

      console.log(`Emails sent successfully for reservation ${reservationId}`);
      return { success: true };

    } catch (error) {
      console.error('Error sending emails:', error);

      // Log error to Firestore
      await snap.ref.update({
        emailError: error.message,
        emailErrorTimestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      throw new Error('Failed to send emails: ' + error.message);
    }
});

/**
 * Send notification to restaurant managers
 */
async function sendManagerNotification(managerEmail, reservation, reservationId) {
  const subject = `🍽️ New Reservation - ${reservation.customerName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .detail { margin: 15px 0; padding: 10px; background: #fff; border-left: 3px solid #D4AF37; }
        .label { font-weight: bold; color: #1a1a1a; }
        .value { color: #555; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${RESTAURANT_NAME}</h1>
          <p>New Reservation Request</p>
        </div>

        <div class="content">
          <h2>Reservation Details</h2>

          <div class="detail">
            <span class="label">Customer Name:</span> <span class="value">${reservation.customerName}</span>
          </div>

          <div class="detail">
            <span class="label">Phone:</span> <span class="value">${reservation.customerPhone}</span>
          </div>

          ${reservation.customerEmail ? `
          <div class="detail">
            <span class="label">Email:</span> <span class="value">${reservation.customerEmail}</span>
          </div>
          ` : ''}

          <div class="detail">
            <span class="label">Party Size:</span> <span class="value">${reservation.partySize} ${reservation.partySize === '1' ? 'guest' : 'guests'}</span>
          </div>

          <div class="detail">
            <span class="label">Date:</span> <span class="value">${formatDate(reservation.reservationDate)}</span>
          </div>

          <div class="detail">
            <span class="label">Time:</span> <span class="value">${reservation.reservationTime}</span>
          </div>

          ${reservation.specialRequests ? `
          <div class="detail">
            <span class="label">Special Requests:</span> <span class="value">${reservation.specialRequests}</span>
          </div>
          ` : ''}

          <div class="detail">
            <span class="label">Status:</span> <span class="value" style="color: #ff9800; font-weight: bold;">PENDING CONFIRMATION</span>
          </div>

          <div class="detail">
            <span class="label">Reservation ID:</span> <span class="value">${reservationId}</span>
          </div>

          <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 3px solid #ffc107;">
            <strong>Action Required:</strong> Please contact the customer to confirm this reservation.
          </p>
        </div>

        <div class="footer">
          <p>${RESTAURANT_NAME} | ${RESTAURANT_PHONE}</p>
          <p>5th Floor, Terminus Building, BG-12, Newtown, Kolkata, West Bengal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Reservation Request

Customer: ${reservation.customerName}
Phone: ${reservation.customerPhone}
${reservation.customerEmail ? `Email: ${reservation.customerEmail}\n` : ''}
Party Size: ${reservation.partySize}
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
${reservation.specialRequests ? `Special Requests: ${reservation.specialRequests}\n` : ''}
Status: PENDING CONFIRMATION

Reservation ID: ${reservationId}

Please contact the customer to confirm this reservation.

${RESTAURANT_NAME} | ${RESTAURANT_PHONE}
  `;

  const msg = {
    to: managerEmail,
    from: FROM_EMAIL,
    subject: subject,
    text: text,
    html: html
  };

  return sgMail.send(msg);
}

/**
 * Send confirmation email to customer
 */
async function sendCustomerConfirmation(reservation) {
  const subject = `Reservation Request Received - ${RESTAURANT_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #1a1a1a; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${RESTAURANT_NAME}</h1>
          <p>Thank You for Your Reservation Request</p>
        </div>

        <div class="content">
          <p>Dear ${reservation.customerName},</p>

          <p>Thank you for choosing ${RESTAURANT_NAME}! We have received your reservation request with the following details:</p>

          <div class="detail">
            <span class="label">Date:</span> ${formatDate(reservation.reservationDate)}
          </div>
          <div class="detail">
            <span class="label">Time:</span> ${reservation.reservationTime}
          </div>
          <div class="detail">
            <span class="label">Party Size:</span> ${reservation.partySize} ${reservation.partySize === '1' ? 'guest' : 'guests'}
          </div>
          ${reservation.specialRequests ? `
          <div class="detail">
            <span class="label">Special Requests:</span> ${reservation.specialRequests}
          </div>
          ` : ''}

          <p style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 3px solid #2196f3;">
            <strong>What's Next?</strong><br>
            Our team will contact you shortly at <strong>${reservation.customerPhone}</strong> to confirm your reservation.
          </p>

          <p>If you have any questions or need to make changes, please call us at <strong>${RESTAURANT_PHONE}</strong>.</p>

          <p>We look forward to serving you!</p>

          <p>Best regards,<br>
          <strong>The ${RESTAURANT_NAME} Team</strong></p>
        </div>

        <div class="footer">
          <p>${RESTAURANT_NAME} | ${RESTAURANT_PHONE}</p>
          <p>5th Floor, Terminus Building, BG-12, Newtown, Kolkata, West Bengal</p>
          <p><a href="https://www.instagram.com/onesipgastropub/">Instagram</a> | <a href="https://www.facebook.com/onesiprestrocafe">Facebook</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank You for Your Reservation Request

Dear ${reservation.customerName},

Thank you for choosing ${RESTAURANT_NAME}! We have received your reservation request with the following details:

Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Party Size: ${reservation.partySize}
${reservation.specialRequests ? `Special Requests: ${reservation.specialRequests}\n` : ''}

Our team will contact you shortly at ${reservation.customerPhone} to confirm your reservation.

If you have any questions or need to make changes, please call us at ${RESTAURANT_PHONE}.

We look forward to serving you!

Best regards,
The ${RESTAURANT_NAME} Team

${RESTAURANT_NAME} | ${RESTAURANT_PHONE}
5th Floor, Terminus Building, BG-12, Newtown, Kolkata, West Bengal
  `;

  const msg = {
    to: reservation.customerEmail,
    from: FROM_EMAIL,
    subject: subject,
    text: text,
    html: html
  };

  return sgMail.send(msg);
}

/**
 * Helper function to format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}
