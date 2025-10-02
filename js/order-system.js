// js/order-system.js
class OrderSystem {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
    }
  }

  async handleOrderSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Placing Order...';
      submitBtn.disabled = true;

      const orderData = {
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress')?.value || '',
        items: this.getOrderItems(),
        subtotal: this.calculateSubtotal(),
        tax: this.calculateTax(),
        total: this.calculateTotal(),
        status: 'pending',
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'cash',
        notes: document.getElementById('orderNotes')?.value || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firebase
      const docRef = await db.collection('orders').add(orderData);
      
      // Show success message
      this.showMessage('Order placed successfully! Your order ID: ' + docRef.id.substring(0, 8), 'success');
      
      // Reset form
      e.target.reset();
      
      // Update cart display
      this.updateCartDisplay();

    } catch (error) {
      console.error('Error placing order:', error);
      this.showMessage('Error placing order. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  getOrderItems() {
    // This would get items from your cart system
    const items = [];
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
      items.push({
        name: item.querySelector('.item-name').textContent,
        price: parseFloat(item.querySelector('.item-price').textContent.replace('$', '')),
        quantity: parseInt(item.querySelector('.item-quantity').value),
        specialInstructions: item.querySelector('.special-instructions')?.value || ''
      });
    });
    
    return items;
  }

  calculateSubtotal() {
    let subtotal = 0;
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
      const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', ''));
      const quantity = parseInt(item.querySelector('.item-quantity').value);
      subtotal += price * quantity;
    });
    
    return subtotal;
  }

  calculateTax() {
    const subtotal = this.calculateSubtotal();
    return subtotal * 0.08; // 8% tax
  }

  calculateTotal() {
    return this.calculateSubtotal() + this.calculateTax();
  }

  updateCartDisplay() {
    const subtotalElement = document.getElementById('cartSubtotal');
    const taxElement = document.getElementById('cartTax');
    const totalElement = document.getElementById('cartTotal');
    
    if (subtotalElement) subtotalElement.textContent = '$' + this.calculateSubtotal().toFixed(2);
    if (taxElement) taxElement.textContent = '$' + this.calculateTax().toFixed(2);
    if (totalElement) totalElement.textContent = '$' + this.calculateTotal().toFixed(2);
  }

  showMessage(message, type) {
    // Create or use existing message element
    let messageDiv = document.getElementById('orderMessage');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'orderMessage';
      messageDiv.style.cssText = `
        padding: 15px;
        margin: 15px 0;
        border-radius: 5px;
        font-weight: bold;
      `;
      const form = document.getElementById('orderForm');
      form.parentNode.insertBefore(messageDiv, form);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OrderSystem();
});