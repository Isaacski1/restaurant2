// js/order-system.js
class OrderSystem {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        console.log("Initializing Order System...");
        this.initializeFirebase();
        this.setupEventListeners();
    }

    initializeFirebase() {
        try {
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

            // Initialize Firebase if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log("✅ Firebase initialized in order system");
            } else {
                console.log("✅ Firebase already initialized");
            }

            this.db = firebase.firestore();
            this.initialized = true;
            
        } catch (error) {
            console.error("❌ Firebase initialization error:", error);
            this.showMessage("Firebase initialization failed: " + error.message, 'error');
        }
    }

    setupEventListeners() {
        // Order form submission
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
            console.log("✅ Order form event listener added");
        } else {
            console.error("❌ Order form not found");
        }

        // Test button
        const testBtn = document.getElementById('testOrderBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testOrderSave());
        }
    }

    async handleOrderSubmit(e) {
        e.preventDefault();
        console.log("📦 Order form submitted");

        if (!this.initialized) {
            this.showMessage("System not ready. Please wait...", 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Placing Order...';
            submitBtn.disabled = true;

            // Collect order data
            const orderData = this.collectOrderData();
            console.log("📊 Order data:", orderData);

            // Validate required fields
            if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone) {
                throw new Error("Please fill in all required fields");
            }

            // Save to Firebase
            const docRef = await this.db.collection('orders').add(orderData);
            console.log("✅ Order saved with ID:", docRef.id);
            
            // Show success message
            this.showMessage(`✅ Order placed successfully! Order ID: ${docRef.id.substring(0, 8)}`, 'success');
            
            // Reset form
            e.target.reset();
            
        } catch (error) {
            console.error('❌ Error placing order:', error);
            this.showMessage('❌ Error: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    collectOrderData() {
        // Get form values - adjust these based on your actual form fields
        const orderData = {
            customerName: this.getValue('customerName') || 'Unknown Customer',
            customerEmail: this.getValue('customerEmail') || 'no-email@example.com',
            customerPhone: this.getValue('customerPhone') || '0000000000',
            customerAddress: this.getValue('customerAddress') || '',
            
            // Sample order items - REPLACE THIS WITH YOUR ACTUAL CART DATA
            items: [
                {
                    name: "Jollof Rice",
                    price: 25.00,
                    quantity: 1,
                    specialInstructions: "Extra spicy"
                },
                {
                    name: "Chicken",
                    price: 15.00,
                    quantity: 2,
                    specialInstructions: ""
                }
            ],
            
            subtotal: 55.00,
            tax: 4.40,
            total: 59.40,
            status: 'pending',
            paymentMethod: 'cash',
            notes: this.getValue('orderNotes') || '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            
            // Additional fields for tracking
            source: 'website',
            orderType: 'delivery' // or 'pickup'
        };

        return orderData;
    }

    getValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : null;
    }

    async testOrderSave() {
        console.log("🧪 Testing order save...");
        
        if (!this.initialized) {
            this.showMessage("Firebase not initialized", 'error');
            return;
        }

        const testOrder = {
            customerName: "Test Customer " + new Date().toLocaleTimeString(),
            customerEmail: "test@example.com",
            customerPhone: "1234567890",
            customerAddress: "123 Test Street",
            
            items: [
                { name: "Test Pizza", price: 12.99, quantity: 1, specialInstructions: "Test order" },
                { name: "Test Drink", price: 2.99, quantity: 2, specialInstructions: "" }
            ],
            
            subtotal: 18.97,
            tax: 1.52,
            total: 20.49,
            status: "pending",
            paymentMethod: "cash",
            notes: "This is a test order from the test button",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            source: 'website-test',
            orderType: 'delivery'
        };

        try {
            const docRef = await this.db.collection('orders').add(testOrder);
            console.log("✅ Test order saved! ID:", docRef.id);
            this.showMessage(`✅ Test order saved! ID: ${docRef.id.substring(0, 8)}`, 'success');
            
            // Check if order appears in Firebase console
            setTimeout(() => {
                this.checkOrderInFirebase(docRef.id);
            }, 2000);
            
        } catch (error) {
            console.error("❌ Error saving test order:", error);
            this.showMessage("❌ Test failed: " + error.message, 'error');
        }
    }

    async checkOrderInFirebase(orderId) {
        try {
            const doc = await this.db.collection('orders').doc(orderId).get();
            if (doc.exists) {
                console.log("✅ Order verified in Firebase:", doc.data());
                this.showMessage("✅ Order verified in Firebase database!", 'success');
            } else {
                console.error("❌ Order not found in Firebase");
                this.showMessage("❌ Order not found in database", 'error');
            }
        } catch (error) {
            console.error("Error checking order:", error);
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
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            min-width: 300px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        messageDiv.textContent = message;
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }
        
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
    console.log("🚀 Starting order system...");
    window.orderSystem = new OrderSystem();
});