// js/order-system.js
class OrderSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeFirebase();
    }

    initializeFirebase() {
        // Firebase config
        const firebaseConfig = {
            apiKey: "AIzaSyDvpv148pehFCPMwuw1hDYPPnWA67EOHOU",
            authDomain: "isaacski-restaurant.firebaseapp.com",
            projectId: "isaacski-restaurant",
            storageBucket: "isaacski-restaurant.firebasestorage.app",
            messagingSenderId: "793597481997",
            appId: "1:793597481997:web:fce9cb43ca442eee7b7144",
            measurementId: "G-CNYCFT8N3F"
        };

        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();
        console.log("Firebase initialized in order system");
    }

    setupEventListeners() {
        // Order form submission
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        }

        // Test button for debugging
        const testBtn = document.getElementById('testOrderBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testOrderSave());
        }
    }

    async handleOrderSubmit(e) {
        e.preventDefault();
        console.log("Order form submitted");
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Placing Order...';
            submitBtn.disabled = true;

            const orderData = this.collectOrderData();
            console.log("Order data collected:", orderData);

            // Save to Firebase
            const docRef = await this.db.collection('orders').add(orderData);
            console.log("Order saved with ID: ", docRef.id);
            
            // Show success message
            this.showMessage(`Order placed successfully! Order ID: ${docRef.id.substring(0, 8)}`, 'success');
            
            // Reset form
            e.target.reset();
            
        } catch (error) {
            console.error('Error placing order:', error);
            this.showMessage('Error placing order: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    collectOrderData() {
        // Get form values - adjust these selectors based on your actual form
        const orderData = {
            customerName: document.getElementById('customerName')?.value || 'Test Customer',
            customerEmail: document.getElementById('customerEmail')?.value || 'test@example.com',
            customerPhone: document.getElementById('customerPhone')?.value || '0000000000',
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

        console.log("Collected order data:", orderData);
        return orderData;
    }

    getOrderItems() {
        // This should match your actual cart/order items structure
        // For now, let's create sample items
        const items = [
            {
                name: "Sample Dish 1",
                price: 12.99,
                quantity: 1,
                specialInstructions: "No spicy"
            },
            {
                name: "Sample Drink", 
                price: 2.99,
                quantity: 2,
                specialInstructions: ""
            }
        ];
        
        // If you have a cart system, replace the above with code that reads from your cart
        return items;
    }

    calculateSubtotal() {
        const items = this.getOrderItems();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateTax() {
        return this.calculateSubtotal() * 0.08; // 8% tax
    }

    calculateTotal() {
        return this.calculateSubtotal() + this.calculateTax();
    }

    async testOrderSave() {
        console.log("Testing order save...");
        
        const testOrder = {
            customerName: "Test Customer " + Date.now(),
            customerEmail: "test@example.com",
            customerPhone: "1234567890",
            items: [
                { name: "Test Pizza", price: 15.99, quantity: 1, specialInstructions: "Extra cheese" },
                { name: "Test Drink", price: 2.99, quantity: 2, specialInstructions: "" }
            ],
            subtotal: 21.97,
            tax: 1.76,
            total: 23.73,
            status: "pending",
            paymentMethod: "cash",
            notes: "This is a test order",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = await this.db.collection('orders').add(testOrder);
            console.log("✅ Test order saved successfully! ID:", docRef.id);
            this.showMessage(`✅ Test order saved! ID: ${docRef.id.substring(0, 8)}`, 'success');
        } catch (error) {
            console.error("❌ Error saving test order:", error);
            this.showMessage("❌ Error saving test order: " + error.message, 'error');
        }
    }

    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.getElementById('orderMessage');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.id = 'orderMessage';
        messageDiv.style.cssText = `
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            font-weight: bold;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
        `;
        
        messageDiv.textContent = message;
        messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
        
        document.body.appendChild(messageDiv);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderSystem();
});