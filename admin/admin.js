// admin/admin.js

// Check authentication
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log("Admin user:", user.email);
        initializeDashboard();
    } else {
        // No user signed in, redirect to login
        console.log("No user signed in, redirecting to login...");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

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
    setupCharts();
}

// Load today's orders
function loadTodayOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    db.collection('orders')
        .where('timestamp', '>=', today)
        .onSnapshot((snapshot) => {
            let totalOrders = 0;
            let totalRevenue = 0;
            let pendingOrders = 0;
            
            snapshot.forEach(doc => {
                totalOrders++;
                totalRevenue += doc.data().totalAmount || 0;
                if (doc.data().orderStatus === 'pending') {
                    pendingOrders++;
                }
            });
            
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
    
    db.collection('reservations')
        .where('reservationDate', '==', today)
        .onSnapshot((snapshot) => {
            document.getElementById('todayReservations').textContent = snapshot.size;
        }, (error) => {
            console.error('Error loading today reservations:', error);
        });
}

// Load recent orders for dashboard
function loadRecentOrders() {
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#recentOrdersTable tbody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            snapshot.forEach(doc => {
                const order = doc.data();
                const row = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${order.customerName}</td>
                        <td>${getOrderItemsCount(order)} items</td>
                        <td>¢${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                        <td><span class="badge bg-${getStatusBadge(order.orderStatus)}">${order.orderStatus || 'pending'}</span></td>
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
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#ordersTable tbody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            snapshot.forEach(doc => {
                const order = doc.data();
                const row = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>
                            <strong>${order.customerName}</strong><br>
                            <small class="text-muted">${order.vendorLocation || 'N/A'}</small>
                        </td>
                        <td>
                            ${order.customerEmail}<br>
                            ${order.customerPhone}
                        </td>
                        <td>
                            <strong>Main:</strong> ${order.mainDish?.split(' - ')[0] || 'N/A'}<br>
                            <strong>Protein:</strong> ${order.protein?.split(' - ')[0] || 'N/A'}<br>
                            <small class="text-muted">+${getOrderExtras(order)}</small>
                        </td>
                        <td>¢${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                        <td>
                            <select class="form-select form-select-sm status-select" data-order-id="${order.orderId}" data-type="order">
                                <option value="pending" ${order.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="preparing" ${order.orderStatus === 'preparing' ? 'selected' : ''}>Preparing</option>
                                <option value="ready" ${order.orderStatus === 'ready' ? 'selected' : ''}>Ready</option>
                                <option value="completed" ${order.orderStatus === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${formatDate(order.timestamp)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-order" data-order='${JSON.stringify(order)}'>
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Add event listeners for status changes
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', handleStatusChange);
            });

            // Add event listeners for view buttons
            document.querySelectorAll('.view-order').forEach(btn => {
                btn.addEventListener('click', viewOrderDetails);
            });
        }, (error) => {
            console.error('Error loading all orders:', error);
        });
}

// Load all reservations
function loadAllReservations() {
    db.collection('reservations')
        .orderBy('reservationDateTime', 'desc')
        .onSnapshot((snapshot) => {
            const tableBody = document.querySelector('#reservationsTable tbody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            snapshot.forEach(doc => {
                const reservation = doc.data();
                const row = `
                    <tr>
                        <td>${reservation.reservationId}</td>
                        <td>
                            <strong>${reservation.customerName}</strong>
                        </td>
                        <td>
                            ${reservation.customerEmail}<br>
                            ${reservation.customerPhone}
                        </td>
                        <td>
                            ${formatDate(reservation.reservationDate)}<br>
                            <small class="text-muted">${reservation.reservationTime}</small>
                        </td>
                        <td>${reservation.numberOfPeople} people</td>
                        <td>
                            <select class="form-select form-select-sm status-select" data-reservation-id="${reservation.reservationId}" data-type="reservation">
                                <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="seated" ${reservation.status === 'seated' ? 'selected' : ''}>Seated</option>
                                <option value="completed" ${reservation.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                <option value="no-show" ${reservation.status === 'no-show' ? 'selected' : ''}>No Show</option>
                            </select>
                        </td>
                        <td>${reservation.specialRequests || 'None'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-reservation" data-reservation='${JSON.stringify(reservation)}'>
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Add event listeners for status changes
            document.querySelectorAll('.status-select[data-type="reservation"]').forEach(select => {
                select.addEventListener('change', handleStatusChange);
            });

            // Add event listeners for view buttons
            document.querySelectorAll('.view-reservation').forEach(btn => {
                btn.addEventListener('click', viewReservationDetails);
            });
        }, (error) => {
            console.error('Error loading all reservations:', error);
        });
}

// Handle status changes
async function handleStatusChange(e) {
    const select = e.target;
    const newStatus = select.value;
    const orderId = select.getAttribute('data-order-id');
    const reservationId = select.getAttribute('data-reservation-id');
    
    try {
        if (orderId) {
            await db.collection('orders').doc(orderId).update({
                orderStatus: newStatus
            });
        } else if (reservationId) {
            await db.collection('reservations').doc(reservationId).update({
                status: newStatus
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// View order details
function viewOrderDetails(e) {
    const order = JSON.parse(e.target.closest('.view-order').getAttribute('data-order'));
    
    const details = `
        <strong>Order ID:</strong> ${order.orderId}<br>
        <strong>Customer:</strong> ${order.customerName}<br>
        <strong>Email:</strong> ${order.customerEmail}<br>
        <strong>Phone:</strong> ${order.customerPhone}<br>
        <strong>Location:</strong> ${order.vendorLocation}<br>
        <strong>Main Dish:</strong> ${order.mainDish}<br>
        <strong>Protein:</strong> ${order.protein}<br>
        <strong>Extra Protein:</strong> ${order.extraProtein || 'None'}<br>
        <strong>Accompaniment:</strong> ${order.accompaniment || 'None'}<br>
        <strong>Drinks:</strong> ${order.drinks || 'None'}<br>
        <strong>Packaging:</strong> ${order.packaging}<br>
        <strong>Delivery:</strong> ${order.deliveryPeriod}<br>
        <strong>Total:</strong> ¢${order.totalAmount?.toFixed(2) || '0.00'}<br>
        <strong>Notes:</strong> ${order.additionalNotes || 'None'}
    `;
    
    alert(details);
}

// View reservation details
function viewReservationDetails(e) {
    const reservation = JSON.parse(e.target.closest('.view-reservation').getAttribute('data-reservation'));
    
    const details = `
        <strong>Reservation ID:</strong> ${reservation.reservationId}<br>
        <strong>Customer:</strong> ${reservation.customerName}<br>
        <strong>Email:</strong> ${reservation.customerEmail}<br>
        <strong>Phone:</strong> ${reservation.customerPhone}<br>
        <strong>Date:</strong> ${reservation.reservationDate}<br>
        <strong>Time:</strong> ${reservation.reservationTime}<br>
        <strong>People:</strong> ${reservation.numberOfPeople}<br>
        <strong>Special Requests:</strong> ${reservation.specialRequests || 'None'}
    `;
    
    alert(details);
}

// Setup charts
function setupCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        const revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily Revenue (¢)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
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
    let count = 0;
    if (order.mainDish) count++;
    if (order.protein) count++;
    if (order.extraProtein && order.extraProtein !== 'None') count++;
    if (order.accompaniment && order.accompaniment !== 'None') count++;
    if (order.drinks && order.drinks !== 'None') count++;
    return count;
}

function getOrderExtras(order) {
    const extras = [];
    if (order.extraProtein && order.extraProtein !== 'None') extras.push(order.extraProtein.split(' - ')[0]);
    if (order.accompaniment && order.accompaniment !== 'None') extras.push(order.accompaniment.split(' - ')[0]);
    if (order.drinks && order.drinks !== 'None') extras.push(order.drinks.split(' - ')[0]);
    return extras.join(', ');
}