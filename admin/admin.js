// admin/admin.js

// Global variables
let auth, db;

// Initialize Firebase if not already initialized
function initializeFirebase() {
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyDvpv148pehFCPMwuw1hDYPPnWA67EOHOU",
            authDomain: "isaacski-restaurant.firebaseapp.com",
            projectId: "isaacski-restaurant",
            storageBucket: "isaacski-restaurant.firebasestorage.app",
            messagingSenderId: "793597481997",
            appId: "1:793597481997:web:fce9cb43ca442eee7b7144",
            measurementId: "G-CNYCFT8N3F"
        };

        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        db = firebase.firestore();
        
        console.log("Firebase initialized successfully");
        
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebase();
    setupAuthListener();
});

// Check authentication
function setupAuthListener() {
    auth.onAuthStateChanged((user) => {
        console.log("Auth state changed - User:", user);
        if (user) {
            // User is signed in
            console.log("Admin user:", user.email);
            initializeDashboard();
        } else {
            // No user signed in, redirect to login
            console.log("No user signed in, redirecting to login...");
            window.location.href = 'login.html';
        }
    });
}

function initializeDashboard() {
    try {
        loadDashboardData();
        setupEventListeners();
        showSection('dashboard');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Logout error:', error);
                alert('Error during logout. Please try again.');
            });
        }
    });
}

// Show specific section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Load all dashboard data
function loadDashboardData() {
    loadTodayOrders();
    loadTodayReservations();
    loadRecentOrders();
    loadAllOrders();
    loadAllReservations();
}

// Load today's orders
function loadTodayOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log("Loading today's orders...");
    
    db.collection('orders')
        .where('timestamp', '>=', today)
        .onSnapshot((snapshot) => {
            let totalOrders = 0;
            let totalRevenue = 0;
            let pendingOrders = 0;
            
            snapshot.forEach(doc => {
                totalOrders++;
                const orderData = doc.data();
                totalRevenue += orderData.total || orderData.totalAmount || 0;
                if (orderData.status === 'pending' || orderData.orderStatus === 'pending') {
                    pendingOrders++;
                }
            });
            
            console.log(`Today's stats - Orders: ${totalOrders}, Revenue: ${totalRevenue}, Pending: ${pendingOrders}`);
            
            document.getElementById('todayOrders').textContent = totalOrders;
            document.getElementById('todayRevenue').textContent = '¢' + totalRevenue.toFixed(2);
            document.getElementById('pendingOrders').textContent = pendingOrders;
        }, (error) => {
            console.error('Error loading today orders:', error);
        });
}

// Load today's reservations
function loadTodayReservations() {
    const today = new Date().toISOString().split('T')[0];
    
    console.log("Loading today's reservations for date:", today);
    
    db.collection('reservations')
        .where('date', '==', today)
        .onSnapshot((snapshot) => {
            console.log(`Today's reservations: ${snapshot.size}`);
            document.getElementById('todayReservations').textContent = snapshot.size;
        }, (error) => {
            console.error('Error loading today reservations:', error);
        });
}

// Load recent orders for dashboard
function loadRecentOrders() {
    console.log("Loading recent orders...");
    
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#recentOrdersTable tbody');
            if (!tableBody) {
                console.log("Recent orders table not found");
                return;
            }
            
            tableBody.innerHTML = '';
            
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const order = doc.data();
                const row = `
                    <tr>
                        <td>${doc.id.substring(0, 8)}</td>
                        <td>${order.customerName || 'N/A'}</td>
                        <td>${getOrderItemsCount(order)} items</td>
                        <td>¢${(order.total || order.totalAmount || 0).toFixed(2)}</td>
                        <td><span class="badge bg-${getStatusBadge(order.status || order.orderStatus)}">${order.status || order.orderStatus || 'pending'}</span></td>
                        <td>${formatDate(order.timestamp)}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }, (error) => {
            console.error('Error loading recent orders:', error);
        });
}

// Load all orders for orders section
function loadAllOrders() {
    console.log("Loading all orders...");
    
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#ordersTable tbody');
            if (!tableBody) {
                console.log("Orders table not found");
                return;
            }
            
            tableBody.innerHTML = '';
            
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
                console.log("No orders in database");
                return;
            }
            
            console.log(`Found ${snapshot.size} orders`);
            
            snapshot.forEach(doc => {
                const order = doc.data();
                console.log("Order data:", order);
                
                const row = `
                    <tr>
                        <td>${doc.id.substring(0, 8)}</td>
                        <td>
                            <strong>${order.customerName || 'N/A'}</strong>
                        </td>
                        <td>
                            ${order.customerEmail || 'N/A'}<br>
                            <small>${order.customerPhone || 'N/A'}</small>
                        </td>
                        <td>
                            ${getOrderItemsDisplay(order)}
                        </td>
                        <td>¢${(order.total || 0).toFixed(2)}</td>
                        <td>
                            <select class="form-select form-select-sm status-select" data-order-id="${doc.id}">
                                <option value="pending" ${(order.status || order.orderStatus) === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="preparing" ${(order.status || order.orderStatus) === 'preparing' ? 'selected' : ''}>Preparing</option>
                                <option value="ready" ${(order.status || order.orderStatus) === 'ready' ? 'selected' : ''}>Ready</option>
                                <option value="completed" ${(order.status || order.orderStatus) === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${(order.status || order.orderStatus) === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${formatDate(order.timestamp)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-order" onclick="viewOrderDetails('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Add event listeners for status changes
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', handleOrderStatusChange);
            });

        }, (error) => {
            console.error('Error loading all orders:', error);
        });
}

// Load all reservations
function loadAllReservations() {
    console.log("Loading all reservations...");
    
    db.collection('reservations')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#reservationsTable tbody');
            if (!tableBody) {
                console.log("Reservations table not found");
                return;
            }
            
            tableBody.innerHTML = '';
            
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No reservations found</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const reservation = doc.data();
                const row = `
                    <tr>
                        <td>${doc.id.substring(0, 8)}</td>
                        <td>
                            <strong>${reservation.name || 'N/A'}</strong>
                        </td>
                        <td>
                            ${reservation.email || 'N/A'}<br>
                            ${reservation.phone || 'N/A'}
                        </td>
                        <td>
                            ${reservation.date || 'N/A'}<br>
                            <small class="text-muted">${reservation.time || 'N/A'}</small>
                        </td>
                        <td>${reservation.guests || 'N/A'} people</td>
                        <td>
                            <select class="form-select form-select-sm status-select" data-reservation-id="${doc.id}">
                                <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="seated" ${reservation.status === 'seated' ? 'selected' : ''}>Seated</option>
                                <option value="completed" ${reservation.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                <option value="no-show" ${reservation.status === 'no-show' ? 'selected' : ''}>No Show</option>
                            </select>
                        </td>
                        <td>${reservation.specialRequests || 'None'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-reservation" onclick="viewReservationDetails('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Add event listeners for status changes
            document.querySelectorAll('.status-select[data-reservation-id]').forEach(select => {
                select.addEventListener('change', handleReservationStatusChange);
            });

        }, (error) => {
            console.error('Error loading all reservations:', error);
        });
}

// Handle order status changes
async function handleOrderStatusChange(e) {
    const select = e.target;
    const newStatus = select.value;
    const orderId = select.getAttribute('data-order-id');
    
    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus
        });
        console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Handle reservation status changes
async function handleReservationStatusChange(e) {
    const select = e.target;
    const newStatus = select.value;
    const reservationId = select.getAttribute('data-reservation-id');
    
    try {
        await db.collection('reservations').doc(reservationId).update({
            status: newStatus
        });
        console.log(`Reservation ${reservationId} status updated to ${newStatus}`);
    } catch (error) {
        console.error('Error updating reservation status:', error);
        alert('Error updating status. Please try again.');
    }
}

// View order details
function viewOrderDetails(orderId) {
    db.collection('orders').doc(orderId).get()
        .then((doc) => {
            if (doc.exists) {
                const order = doc.data();
                const details = `
                    <strong>Order ID:</strong> ${orderId}<br>
                    <strong>Customer:</strong> ${order.customerName}<br>
                    <strong>Email:</strong> ${order.customerEmail || 'N/A'}<br>
                    <strong>Phone:</strong> ${order.customerPhone || 'N/A'}<br>
                    <strong>Address:</strong> ${order.customerAddress || 'N/A'}<br>
                    <strong>Items:</strong><br>
                    ${order.items ? order.items.map(item => 
                        `- ${item.name} x${item.quantity} @ ¢${item.price} = ¢${(item.price * item.quantity).toFixed(2)}` +
                        (item.specialInstructions ? ` (${item.specialInstructions})` : '')
                    ).join('<br>') : 'No items'}<br>
                    <strong>Subtotal:</strong> ¢${order.subtotal?.toFixed(2) || '0.00'}<br>
                    <strong>Tax:</strong> ¢${order.tax?.toFixed(2) || '0.00'}<br>
                    <strong>Total:</strong> ¢${order.total?.toFixed(2) || '0.00'}<br>
                    <strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}<br>
                    <strong>Notes:</strong> ${order.notes || 'None'}<br>
                    <strong>Order Time:</strong> ${formatDate(order.timestamp)}
                `;
                
                // Create a modal or use alert for simplicity
                alert(details);
            } else {
                alert("Order not found");
            }
        })
        .catch((error) => {
            console.error("Error getting order:", error);
            alert("Error loading order details");
        });
}

// View reservation details
function viewReservationDetails(reservationId) {
    db.collection('reservations').doc(reservationId).get()
        .then((doc) => {
            if (doc.exists) {
                const reservation = doc.data();
                const details = `
                    <strong>Reservation ID:</strong> ${reservationId}<br>
                    <strong>Customer:</strong> ${reservation.name}<br>
                    <strong>Email:</strong> ${reservation.email || 'N/A'}<br>
                    <strong>Phone:</strong> ${reservation.phone || 'N/A'}<br>
                    <strong>Date:</strong> ${reservation.date || 'N/A'}<br>
                    <strong>Time:</strong> ${reservation.time || 'N/A'}<br>
                    <strong>People:</strong> ${reservation.guests || 'N/A'}<br>
                    <strong>Special Requests:</strong> ${reservation.specialRequests || 'None'}<br>
                    <strong>Reservation Time:</strong> ${formatDate(reservation.timestamp)}
                `;
                alert(details);
            } else {
                alert("Reservation not found");
            }
        })
        .catch((error) => {
            console.error("Error getting reservation:", error);
            alert("Error loading reservation details");
        });
}

// Helper functions
function getStatusBadge(status) {
    const statusMap = {
        'completed': 'success',
        'pending': 'warning',
        'preparing': 'info',
        'ready': 'primary',
        'cancelled': 'danger',
        'confirmed': 'success',
        'seated': 'info',
        'no-show': 'secondary'
    };
    return statusMap[status] || 'secondary';
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
        return 'Invalid Date';
    }
}

function getOrderItemsCount(order) {
    // Count items based on your order structure
    if (order.items && Array.isArray(order.items)) {
        return order.items.length;
    }
    return 1; // Default count
}

function getOrderItemsSummary(order) {
    if (order.items && Array.isArray(order.items)) {
        return order.items.map(item => `${item.name} (x${item.quantity})`).join('<br>');
    }
    return 'Order details';
}

function getOrderItemsDisplay(order) {
    if (order.items && Array.isArray(order.items)) {
        return order.items.map(item => 
            `${item.name} x${item.quantity} - ¢${(item.price * item.quantity).toFixed(2)}`
        ).join('<br>');
    }
    return 'No items';
}

// Debug function to check Firebase data
function debugCheckOrders() {
    console.log("=== DEBUG: Checking orders collection ===");
    db.collection('orders').get()
        .then((snapshot) => {
            console.log(`Total orders in database: ${snapshot.size}`);
            snapshot.forEach(doc => {
                console.log(`Order ${doc.id}:`, doc.data());
            });
        })
        .catch(error => {
            console.error("Debug error:", error);
        });
}

// Add this debug function to check if admin can read orders
function debugCheckAdminAccess() {
    console.log("🔍 Checking admin access to orders...");
    
    db.collection('orders').limit(1).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                console.log("✅ Can read orders, but no orders found");
            } else {
                console.log("✅ Can read orders, found:", snapshot.size, "orders");
                snapshot.forEach(doc => {
                    console.log("Sample order:", doc.data());
                });
            }
        })
        .catch((error) => {
            console.error("❌ Cannot read orders:", error);
        });
}

// Call this in your admin dashboard
// debugCheckAdminAccess();

// Call this function to debug
// debugCheckOrders();