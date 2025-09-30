// Initialize EmailJS with YOUR actual keys
(function() {
    emailjs.init("-WX6aDIktn3nAw81E");
    console.log("EmailJS initialized");
})();

// ==================== RESERVATION FORM HANDLER ====================
document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.querySelector('.wrap-form-booking');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Generate reservation ID
            const reservationId = 'RES-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            // Get form data
            const formData = {
                date: document.querySelector('input[name="date"]').value,
                time: document.querySelector('input[name="Time"]').value,
                people: document.querySelector('select[name="people"]').value,
                name: document.querySelector('input[name="name"]').value,
                phone: document.querySelector('input[name="phone"]').value,
                email: document.querySelector('input[name="email"]').value,
                reservation_id: reservationId
            };
            
            console.log('Reservation Form Data:', formData);
            sendReservationEmail(formData);
        });
    }
});

// Function to send reservation email
function sendReservationEmail(formData) {
    const button = document.querySelector('.wrap-form-booking button[type="submit"]');
    const originalText = button?.textContent || 'Book Table';
    
    // Show loading state
    if (button) {
        button.textContent = 'Booking...';
        button.disabled = true;
    }
    
    // Prepare template parameters
    const templateParams = {
        date: formData.date || 'Not provided',
        time: formData.time || 'Not provided',
        people: formData.people || 'Not provided',
        name: formData.name || 'Not provided',
        phone: formData.phone || 'Not provided',
        email: formData.email || 'Not provided',
        timestamp: new Date().toLocaleString(),
        reservation_id: formData.reservation_id
    };
    
    console.log('Sending Reservation Email:', templateParams);
    
    // Send email using EmailJS
    emailjs.send('service_uvwuw6g', 'template_7xa0yxb', templateParams)
        .then(function(response) {
            console.log('RESERVATION SUCCESS!', response);
            alert('🎉 Reservation submitted successfully! We will confirm shortly.');
            document.querySelector('.wrap-form-booking').reset();
        })
        .catch(function(error) {
            console.error('RESERVATION FAILED...', error);
            alert('❌ Failed to submit reservation. Please try again or call us directly.');
        })
        .finally(function() {
            // Reset button
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
}

// ==================== FOOD ORDER FORM HANDLER ====================
document.getElementById("pay-now-btn").addEventListener("click", function() {
    const payButton = document.getElementById("pay-now-btn");
    const originalText = payButton.textContent;
    
    // Show "Initializing Payment..." immediately
    payButton.textContent = "Initializing Payment...";
    payButton.disabled = true;
    
    const form = document.getElementById("paymentForm");
    
    // Get ALL form data including select values with proper validation
    const getFormValue = (selector) => {
        const element = document.querySelector(selector);
        return element && element.value ? element.value.trim() : '';
    };

    const data = {
        // Customer Information
        fullname: getFormValue('input[name="fullname"]'),
        email: getFormValue('input[name="email"]'),
        telephone: getFormValue('input[name="telephone"]'),
        vendor_location: getFormValue('select[name="vendor_location"]'),
        message: getFormValue('textarea[name="message"]'),
        
        // Food Selection - Get ACTUAL selected values
        main_dishes: getFormValue('select[name="main_dishes"]'),
        protein: getFormValue('select[name="protein"]'),
        protein2: getFormValue('select[name="protein2"]'),
        accompaniment: getFormValue('select[name="Accompaniment"]'),
        drinks: getFormValue('select[name="Drinks"]'),
        packaging: getFormValue('select[name="Packaging"]'),
        delivery: getFormValue('select[name="Delivery"]'),
        
        // Total cost
        total_cost: document.getElementById('total-cost').textContent || '¢0.00'
    };

    console.log("Form data collected:", data);

    // Basic validation
    if (!data.fullname || !data.email || !data.telephone) {
        alert("Please fill in Full Name, Email, and Telephone.");
        payButton.textContent = originalText;
        payButton.disabled = false;
        return;
    }

    // Get total
    const totalText = document.getElementById("total-cost").textContent;
    const total = totalText.replace(/[^\d.]/g, "");
    if (!total || isNaN(parseFloat(total)) || parseFloat(total) <= 0) {
        alert("Please select your meal to calculate total cost.");
        payButton.textContent = originalText;
        payButton.disabled = false;
        return;
    }

    if (typeof PaystackPop === "undefined") {
        alert("Paystack is not loaded. Check your internet connection.");
        payButton.textContent = originalText;
        payButton.disabled = false;
        return;
    }

    // Generate order ID
    const orderId = 'ORDER-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const handler = PaystackPop.setup({
        key: "pk_test_daec5eba6470db795511d6c5b8b29469f938ea34",
        email: data.email,
        amount: parseFloat(total) * 100,
        currency: "GHS",
        ref: orderId,
        metadata: {
            custom_fields: [
                {
                    display_name: "Full Name",
                    variable_name: "full_name",
                    value: data.fullname
                },
                {
                    display_name: "Telephone", 
                    variable_name: "telephone",
                    value: data.telephone
                },
                {
                    display_name: "Order ID",
                    variable_name: "order_id",
                    value: orderId
                }
            ]
        },
        callback: function(response) {
            handlePaymentSuccess(response, data, orderId, payButton, originalText);
        },
        onClose: function() {
            // Reset button when payment window is closed
            payButton.textContent = originalText;
            payButton.disabled = false;
            alert("Payment was cancelled.");
        },
    });

    // Open Paystack payment window
    handler.openIframe();
    
    // Safety timeout to reset button if Paystack doesn't open
    setTimeout(() => {
        if (payButton.disabled) {
            payButton.textContent = originalText;
            payButton.disabled = false;
        }
    }, 5000);
});

async function handlePaymentSuccess(response, data, orderId, payButton, originalText) {
    console.log("Payment successful, starting Email.js process...");
    
    // Show processing state
    payButton.textContent = "Processing...";
    
    try {
        // 1. Prepare email data - NO CONDITIONAL LOGIC, ALL VALUES POPULATED
        const templateParams = {
            // Customer Information
            fullname: data.fullname || 'Not provided',
            email: data.email || 'Not provided',
            telephone: data.telephone || 'Not provided',
            vendor_location: data.vendor_location || 'Not provided',
            message: data.message || 'No additional notes',
            
            // Food Selection - ALL VALUES POPULATED, NO EMPTY STRINGS
            main_dishes: data.main_dishes || 'Not selected',
            protein: data.protein || 'Not selected',
            protein2: data.protein2 || 'None selected', // Always has a value
            accompaniment: data.accompaniment || 'Not selected',
            drinks: data.drinks || 'Not selected',
            packaging: data.packaging || 'Not selected',
            delivery: data.delivery || 'Not selected',
            
            // Order & Payment Details
            total_cost: data.total_cost || '¢0.00',
            order_id: orderId,
            payment_reference: response.reference,
            timestamp: new Date().toLocaleString()
        };

        console.log("📧 FINAL Email.js template parameters:", templateParams);

        // 2. Send email using Email.js
        const emailResult = await emailjs.send(
            'service_uvwuw6g',
            'template_phvfhln', 
            templateParams
        );
        
        console.log("✅ Email.js SUCCESS! Status:", emailResult.status);
        console.log("✅ Email sent successfully!");

        // 3. Format and send WhatsApp message - GUARANTEED TO WORK
        const whatsappMessage = `New Order Payment Successful! 💰
Order ID: ${orderId}
Payment Ref: ${response.reference}

Customer Details:
👤 Full Name: ${data.fullname}
📧 Email: ${data.email}
📞 Phone: ${data.telephone}
📍 Vendor Location: ${data.vendor_location}

Order Details:
🍛 Main Dish: ${data.main_dishes}
🥩 Protein: ${data.protein}
🥩 Extra Protein: ${data.protein2 || 'None'}
🥗 Accompaniment: ${data.accompaniment}
🥤 Drinks: ${data.drinks}
📦 Packaging: ${data.packaging}
🚚 Delivery: ${data.delivery}

💰 Total: ${data.total_cost}

📝 Additional Notes: ${data.message || 'None'}`;

        const whatsappLink = `https://wa.me/233549175604?text=${encodeURIComponent(whatsappMessage)}`;

        // ALWAYS SHOW WHATSAPP BUTTON - GUARANTEED SOLUTION
        const whatsappButton = document.createElement('div');
        whatsappButton.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border: 3px solid #25D366; border-radius: 15px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.4); text-align: center; max-width: 90%; width: 400px;">
                <div style="font-size: 24px; margin-bottom: 10px;">📱</div>
                <h3 style="color: #25D366; margin-bottom: 15px; font-size: 20px;">Send Order to WhatsApp</h3>
                <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">Click the button below to send this order to WhatsApp automatically:</p>
                <a href="${whatsappLink}" target="_blank" style="background: #25D366; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 15px; width: 80%;">
                    📲 Open WhatsApp with Order
                </a>
                <br>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #DC2626; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Close
                </button>
            </div>
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
        `;
        document.body.appendChild(whatsappButton);

        // Auto-remove after 60 seconds
        setTimeout(() => {
            if (document.body.contains(whatsappButton)) {
                document.body.removeChild(whatsappButton);
            }
        }, 60000);

        alert("🎉 Order submitted successfully and payment completed! Order ID: " + orderId + "\n\nA WhatsApp button has appeared - click it to send the order details.");
        document.getElementById('paymentForm').reset();
        document.getElementById('total-cost').textContent = '¢0.00';

    } catch (error) {
        console.error("❌ Email.js ERROR:", error);
        
        if (error.text) {
            console.error("Email.js error details:", error.text);
        }
        
        let errorMessage = "Payment successful but email failed. Order ID: " + orderId;
        errorMessage += "\nError: " + (error.text || error.message);
        alert(errorMessage);
    } finally {
        // Always reset the button
        payButton.textContent = originalText;
        payButton.disabled = false;
    }
}