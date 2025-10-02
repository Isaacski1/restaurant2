// js/reservation-system.js
class ReservationSystem {
  constructor() {
    this.init();
  }

  init() {
    this.setMinDate();
    this.setupEventListeners();
  }

  setMinDate() {
    // Set min date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  setupEventListeners() {
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
      reservationForm.addEventListener('submit', (e) => this.handleReservationSubmit(e));
    }
  }

  async handleReservationSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Making Reservation...';
      submitBtn.disabled = true;

      const reservationData = {
        name: document.getElementById('resName').value,
        email: document.getElementById('resEmail').value,
        phone: document.getElementById('resPhone').value,
        date: document.getElementById('resDate').value,
        time: document.getElementById('resTime').value,
        guests: parseInt(document.getElementById('resGuests').value),
        specialRequests: document.getElementById('specialRequests')?.value || '',
        status: 'confirmed',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firebase
      const docRef = await db.collection('reservations').add(reservationData);
      
      this.showMessage(`Reservation confirmed! Your confirmation ID: ${docRef.id.substring(0, 8)}`, 'success');
      e.target.reset();

    } catch (error) {
      console.error('Error making reservation:', error);
      this.showMessage('Error making reservation. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  showMessage(message, type) {
    let messageDiv = document.getElementById('reservationMessage');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'reservationMessage';
      messageDiv.style.cssText = `
        padding: 15px;
        margin: 15px 0;
        border-radius: 5px;
        font-weight: bold;
      `;
      const form = document.getElementById('reservationForm');
      form.parentNode.insertBefore(messageDiv, form);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ReservationSystem();
});