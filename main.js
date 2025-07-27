// CodeMentorX - Main JavaScript File

// Configuration - UPDATE THESE WITH YOUR ACTUAL KEYS
const DEMO_MODE = false;
const STRIPE_PUBLIC_KEY =
  "pk_test_51RpFLfBo8gcRN8wCGaXRGXVNvjsHqU8cQWsdoJ1AVvba5665F0eKGo5n1JQ82JKs5MYiNkHqIouRuAPUySswoEVy00dxAM9UML";

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_o1at7u5";
const EMAILJS_TEMPLATE_ID_UNIFIED = "template_unified"; // For booking confirmations
const EMAILJS_TEMPLATE_ID_MENTOR_NOTIFY = "template_mentor_notify"; // For mentor notifications
const EMAILJS_PUBLIC_KEY = "wOg80YI-6lWJ9HhIm";

let stripe, elements, cardElement;

// Initialize Stripe
if (
  !DEMO_MODE &&
  STRIPE_PUBLIC_KEY !== "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
) {
  stripe = Stripe(STRIPE_PUBLIC_KEY);
} else if (!DEMO_MODE) {
  console.error("Please add your Stripe publishable key to enable payments");
}

// Mentor data with accurate professional information
const mentors = {
  fyaz: {
    name: "Fyaz Qadir Ahmed Ikram",
    title: "Senior Cybersecurity Engineer",
    company: "Dell Technologies",
    location: "County Limerick, Ireland",
    icon: "fas fa-shield-alt",
    headerGradient: "from-blue-500 to-cyan-500",
    about:
      "Senior Cybersecurity Engineer at Dell Technologies with comprehensive experience in enterprise security operations, threat analysis, and infrastructure management. Completed strategic rotations across Infrastructure & Asset Management, Network Security Policy Management, and Cryptography Services. Recognized mentor with extensive experience in guiding professionals through successful career transitions into cybersecurity and technology roles.",
    topics: [
      "Strategic cybersecurity career planning and transition pathways",
      "Enterprise network security architecture and policy management",
      "CV and cover letter optimization for tech roles",
      "Security automation, scripting, and analytical methodologies",
      "Advanced data visualization and analysis using Power BI and Splunk",
      "Infrastructure compliance and asset management frameworks",
      "Professional interview preparation and technical assessment strategies",
      "Dell Technologies graduate program insights and corporate mentorship",
      "Blue team operations, threat analysis, and incident response protocols",
    ],
    priceIntro: 0,
    price30: 25,
    price60: 45,
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      times: "9 AM - 6 PM CET",
      busyDates: ["2025-07-28", "2025-08-01", "2025-08-05"],
    },
  },
  rida: {
    name: "Rida Khan",
    title: "UX Engineer & Platform Founder",
    company: "Bosch (ETAS)",
    location: "Stuttgart, Germany",
    icon: "fas fa-palette",
    headerGradient: "from-purple-500 to-pink-500",
    about:
      "User Experience Engineer at Bosch ETAS specializing in automotive software solutions and digital product design. Founder and technical lead of CodeMentorX, bringing comprehensive expertise in user-centered design, frontend development, and product strategy. Proven track record in bridging technical implementation with strategic design thinking, particularly in enterprise and automotive technology environments.",
    topics: [
      "Strategic UX/UI design principles and enterprise design systems",
      "Comprehensive portfolio development and professional presentation",
      "CV and cover letter review for design and tech positions",
      "Advanced frontend development with React, Next.js, and modern frameworks",
      "Backend fundamentals - API design, databases, and server architecture",
      "Design system architecture and component library development",
      "User research methodologies and data-driven design validation",
      "Strategic career development in technology and design leadership",
      "Professional transition strategies from development to UX roles",
      "Entrepreneurship, product strategy, and startup development insights",
    ],
    priceIntro: 0,
    price30: 30,
    price60: 50,
    availability: {
      days: ["Tuesday", "Thursday", "Saturday"],
      times: "10 AM - 7 PM CET",
      busyDates: ["2025-07-29", "2025-08-02", "2025-08-06"],
    },
  },
};

let selectedMentor = null;
let selectedSessionType = "intro";
let selectedSessionPrice = 0;

// Smooth scroll function
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Initialize QR Code
function initQRCode() {
  try {
    const currentUrl = window.location.href;
    const qr = new QRious({
      element: document.createElement("canvas"),
      value: currentUrl,
      size: 200,
      background: "white",
      foreground: "#3B82F6",
      level: "M",
    });

    const qrContainer = document.getElementById("qr-code");
    if (qrContainer) {
      qrContainer.appendChild(qr.canvas);
    }
  } catch (error) {
    console.log("QR Code library not loaded");
    const qrContainer = document.getElementById("qr-code");
    if (qrContainer) {
      qrContainer.innerHTML =
        '<div class="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">QR Code</div>';
    }
  }
}

// QR Code functionality
function showQRTooltip() {
  const tooltip = document.getElementById("qr-tooltip");
  if (tooltip) {
    tooltip.classList.remove("hidden");
  }
}

function hideQRTooltip() {
  const tooltip = document.getElementById("qr-tooltip");
  if (tooltip) {
    tooltip.classList.add("hidden");
  }
}

// Modal functionality
function openMentorModal(mentorId) {
  selectedMentor = mentorId;
  const mentor = mentors[mentorId];

  if (!mentor) {
    console.error("Mentor not found:", mentorId);
    return;
  }

  // Update modal content
  document.getElementById("modal-mentor-name").textContent = mentor.name;
  document.getElementById(
    "modal-mentor-title"
  ).textContent = `${mentor.title} at ${mentor.company}`;
  document.getElementById("modal-mentor-about").textContent = mentor.about;
  document.getElementById(
    "modal-mentor-icon"
  ).innerHTML = `<i class="${mentor.icon}"></i>`;

  // Update header gradient
  const header = document.getElementById("modal-header");
  header.className = `bg-gradient-to-r ${mentor.headerGradient} px-6 py-4`;

  // Update topics
  const topicsList = document.getElementById("modal-mentor-topics");
  topicsList.innerHTML = "";
  mentor.topics.forEach((topic) => {
    const div = document.createElement("div");
    div.className = "flex items-start";
    div.innerHTML = `
      <i class="fas fa-check-circle text-blue-500 mt-1 mr-3"></i>
      <span class="text-gray-700">${topic}</span>
    `;
    topicsList.appendChild(div);
  });

  // Update session options with mentor-specific pricing
  const sessions = document.querySelectorAll(".session-option");
  if (sessions.length >= 3) {
    sessions[0].querySelector(".font-bold").textContent = "FREE";
    sessions[1].querySelector(".font-bold").textContent = `€${mentor.price30}`;
    sessions[2].querySelector(".font-bold").textContent = `€${mentor.price60}`;
  }

  // Update availability section
  const availabilityInfo = document.getElementById("availability-info");
  if (availabilityInfo) {
    availabilityInfo.innerHTML = `
      <span class="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">${mentor.availability.days.join(
        ", "
      )}</span>
      <span class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">${
        mentor.availability.times
      }</span>
    `;

    // Add busy dates if any
    if (mentor.availability.busyDates.length > 0) {
      const busyDatesSpan = document.createElement("span");
      busyDatesSpan.className =
        "px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium text-xs";
      busyDatesSpan.textContent = "Some dates unavailable - see calendar";
      availabilityInfo.appendChild(busyDatesSpan);
    }
  }

  // Reset selection to intro call
  sessions.forEach((session) =>
    session.classList.remove(
      "selected",
      "border-blue-500",
      "bg-blue-50",
      "border-green-500",
      "bg-green-50"
    )
  );
  if (sessions[0]) {
    sessions[0].classList.add("selected", "border-green-500", "bg-green-50");
  }

  selectedSessionType = "intro";
  selectedSessionPrice = 0;
  document.getElementById("book-session-btn").textContent =
    "Book FREE Intro Call";

  // Hide payment section for free intro call
  const paymentSection = document.getElementById("payment-section");
  if (paymentSection) {
    paymentSection.style.display = "none";
  }

  // Initialize Stripe Elements or Demo Card Input
  if (elements) {
    elements = null;
    cardElement = null;
  }

  if (DEMO_MODE) {
    // Create demo card input
    setTimeout(() => {
      const cardContainer = document.getElementById("card-element");
      if (cardContainer) {
        cardContainer.innerHTML = `
          <div class="demo-card-input">
            <div class="grid grid-cols-3 gap-3">
              <input type="text" placeholder="4242 4242 4242 4242" 
                     class="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                     maxlength="19" id="demo-card-number">
              <input type="text" placeholder="12/24" 
                     class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                     maxlength="5" id="demo-card-expiry">
            </div>
            <div class="grid grid-cols-2 gap-3 mt-3">
              <input type="text" placeholder="123" 
                     class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                     maxlength="4" id="demo-card-cvc">
              <input type="text" placeholder="12345" 
                     class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                     maxlength="5" id="demo-card-zip">
            </div>
            <p class="text-xs text-gray-500 mt-2">
              💡 Demo mode - Use any card number (try: 4242 4242 4242 4242)
            </p>
          </div>
        `;

        // Add formatting to card number
        const cardNumberInput = document.getElementById("demo-card-number");
        if (cardNumberInput) {
          cardNumberInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\s/g, "");
            let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
            if (formattedValue.length > 19)
              formattedValue = formattedValue.substring(0, 19);
            e.target.value = formattedValue;
          });
        }

        // Add formatting to expiry
        const expiryInput = document.getElementById("demo-card-expiry");
        if (expiryInput) {
          expiryInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length >= 2) {
              value = value.substring(0, 2) + "/" + value.substring(2, 4);
            }
            e.target.value = value;
          });
        }
      }
    }, 100);
  } else {
    // Real Stripe Elements
    elements = stripe.elements();
    cardElement = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    });

    setTimeout(() => {
      if (cardElement) {
        cardElement.mount("#card-element");

        // Handle real-time validation errors from the card Element
        cardElement.on("change", ({ error }) => {
          const displayError = document.getElementById("card-errors");
          if (displayError) {
            if (error) {
              displayError.textContent = error.message;
            } else {
              displayError.textContent = "";
            }
          }
        });
      }
    }, 100);
  }

  document.getElementById("mentor-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("mentor-modal").classList.add("hidden");
  document.body.style.overflow = "auto";

  // Clean up Stripe elements or demo inputs
  if (!DEMO_MODE && cardElement) {
    cardElement.destroy();
    cardElement = null;
  }
  if (!DEMO_MODE && elements) {
    elements = null;
  }

  // Reset form
  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.reset();
  }
  const cardErrors = document.getElementById("card-errors");
  if (cardErrors) {
    cardErrors.textContent = "";
  }
}

function selectSession(element, type, price) {
  document.querySelectorAll(".session-option").forEach((option) => {
    option.classList.remove(
      "selected",
      "border-blue-500",
      "bg-blue-50",
      "border-green-500",
      "bg-green-50"
    );
  });

  if (type === "intro") {
    element.classList.add("selected", "border-green-500", "bg-green-50");
    document.getElementById("book-session-btn").textContent =
      "Book FREE Intro Call";
  } else {
    element.classList.add("selected", "border-blue-500", "bg-blue-50");
    document.getElementById("book-session-btn").textContent = `Pay €${price}`;
  }

  selectedSessionType = type;
  selectedSessionPrice = price;

  // Toggle payment fields visibility
  const paymentSection = document.getElementById("payment-section");
  if (paymentSection) {
    if (type === "intro") {
      paymentSection.style.display = "none";
    } else {
      paymentSection.style.display = "block";
    }
  }

  const cardErrors = document.getElementById("card-errors");
  if (cardErrors) {
    if (type === "intro") {
      cardErrors.style.display = "none";
    } else {
      cardErrors.style.display = "block";
    }
  }
}

// Enhanced Payment Processing - Demo and Real Mode
async function processPayment(event) {
  event.preventDefault();

  if (!selectedMentor) return;

  const mentor = mentors[selectedMentor];
  const email = document.getElementById("email").value;

  // Validate email
  if (!email || !validateEmail(email)) {
    const cardErrors = document.getElementById("card-errors");
    if (cardErrors) {
      cardErrors.textContent = "Please enter a valid email address.";
    }
    return;
  }

  document.getElementById("loading-overlay").style.display = "flex";
  document.getElementById("book-session-btn").disabled = true;

  try {
    if (selectedSessionType === "intro") {
      // Free intro call - no payment needed
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await sendBookingNotification(
        mentor,
        email,
        "Introductory Call (10 min)",
        "FREE"
      );
      showBookingSuccess(mentor, email);
      return;
    }

    if (DEMO_MODE) {
      // Demo mode - validate inputs and simulate payment
      const cardNumber = document.getElementById("demo-card-number")?.value;
      const cardExpiry = document.getElementById("demo-card-expiry")?.value;
      const cardCvc = document.getElementById("demo-card-cvc")?.value;

      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) {
        throw new Error("Please enter a valid card number");
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        throw new Error("Please enter a valid expiry date");
      }
      if (!cardCvc || cardCvc.length < 3) {
        throw new Error("Please enter a valid CVC");
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Send emails for demo mode
      const sessionTypeText =
        selectedSessionType === "30min" ? "30 minutes" : "60 minutes";
      await sendBookingNotification(
        mentor,
        email,
        sessionTypeText,
        `€${selectedSessionPrice}`
      );

      // Demo success
      showBookingSuccess(mentor, email);
    } else {
      // Real Stripe payment processing
      if (!cardElement) {
        throw new Error("Payment form not properly initialized");
      }

      // Create payment method
      const { paymentMethod, error: pmError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            email: email,
          },
        });

      if (pmError) {
        throw pmError;
      }

      // Create payment intent on your server
      const paymentIntent = await createPaymentIntent(
        selectedSessionPrice,
        email,
        paymentMethod.id
      );

      // Confirm the payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw confirmError;
      }

      // Payment succeeded - send emails
      const sessionTypeText =
        selectedSessionType === "30min" ? "30 minutes" : "60 minutes";
      await sendBookingNotification(
        mentor,
        email,
        sessionTypeText,
        `€${selectedSessionPrice}`
      );

      // Show success
      showBookingSuccess(mentor, email);
    }
  } catch (error) {
    console.error("Payment error:", error);
    const cardErrors = document.getElementById("card-errors");
    if (cardErrors) {
      cardErrors.textContent =
        error.message || "Payment failed. Please try again.";
    }
    document.getElementById("loading-overlay").style.display = "none";
    document.getElementById("book-session-btn").disabled = false;
  }
}

// Email validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Real payment intent creation (for production)
async function createPaymentIntent(amount, email, paymentMethodId) {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amount * 100, // Convert to cents
      currency: "eur",
      payment_method: paymentMethodId,
      metadata: {
        mentorId: selectedMentor,
        sessionType: selectedSessionType,
        email: email,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  return await response.json();
}

// Show booking success
function showBookingSuccess(mentor, email) {
  document.getElementById("loading-overlay").style.display = "none";

  const sessionTypeText =
    selectedSessionType === "intro"
      ? "Introductory Call (10 min)"
      : selectedSessionType === "30min"
      ? "30 minutes"
      : "60 minutes";
  const amountText =
    selectedSessionType === "intro" ? "FREE" : `€${selectedSessionPrice}`;

  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
  modal.innerHTML = `
    <div class="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-check text-2xl text-green-600"></i>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed! 🎉</h3>
      <p class="text-gray-600 mb-6">
        Your ${sessionTypeText} with ${
    mentor.name
  } has been booked successfully.
        You'll receive a confirmation email with meeting details shortly.
      </p>
      <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl mb-6 text-left">
        <h4 class="font-semibold text-gray-900 mb-3">📋 Booking Details</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Mentor:</span>
            <span class="font-medium">${mentor.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Session:</span>
            <span class="font-medium">${sessionTypeText}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Amount:</span>
            <span class="font-medium ${
              selectedSessionType === "intro"
                ? "text-green-600"
                : "text-blue-600"
            }">${amountText}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="font-medium">${email}</span>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <button onclick="this.closest('.fixed').remove(); closeModal();" 
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg">
          Great! 🚀
        </button>
        <p class="text-xs text-gray-500">
          📧 Check your email for calendar invite and meeting link
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Updated Send booking notification email function
async function sendBookingNotification(
  mentor,
  clientEmail,
  sessionType,
  amount
) {
  try {
    const currentDate = new Date();
    const bookingDate = currentDate.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log("📧 Sending booking confirmation emails...");

    // 1. Send confirmation email to the client using template_unified
    const clientEmailParams = {
      // Basic email fields
      to_email: clientEmail,
      to_name: clientEmail.split("@")[0],
      from_name: "CodeMentorX",
      reply_to: "codementorx@outlook.com",

      // Email content
      email_title: "🎉 Booking Confirmed!",
      email_subtitle: `Your mentorship session with ${mentor.name} is all set`,
      email_intro:
        "Great news! Your booking has been confirmed. Here are the details:",

      // Booking details
      details_title: "📋 Booking Details",
      mentor_name: mentor.name,
      mentor_title: mentor.title,
      mentor_company: mentor.company,
      session_type: sessionType,
      session_amount: amount,
      booking_date: bookingDate,

      // Additional info
      next_steps: "true", // This will show the "What's Next" section
      email_closing: "We're excited to help accelerate your career growth!",
      platform_name: "CodeMentorX",
      support_email: "codementorx@outlook.com",

      // Simple message field as backup
      message: `Your ${sessionType} session with ${mentor.name} has been confirmed for ${amount}. You'll receive further details within 24 hours.`,
    };

    // Send email to client
    const clientResult = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_UNIFIED,
      clientEmailParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Client confirmation email sent:", clientResult);

    // 2. Send notification email to mentor using template_mentor_notify
    const mentorEmail = getMentorEmail(mentor.name);
    const mentorEmailParams = {
      // Basic email fields
      to_email: mentorEmail,
      to_name: mentor.name,
      from_name: "CodeMentorX Platform",
      reply_to: "codementorx@outlook.com",

      // Client details
      client_email: clientEmail,
      client_name: clientEmail.split("@")[0],

      // Booking details
      mentor_name: mentor.name,
      session_type: sessionType,
      session_amount: amount,
      booking_date: bookingDate,
      booking_time: "To be scheduled",

      // Platform info
      platform_name: "CodeMentorX",

      // Simple message field as backup
      message: `New booking: ${sessionType} session with ${clientEmail} for ${amount}`,
    };

    // Send email to mentor
    const mentorResult = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_MENTOR_NOTIFY,
      mentorEmailParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Mentor notification email sent:", mentorResult);

    return true;
  } catch (error) {
    console.error("❌ Error sending booking notification emails:", error);
    console.error("Error details:", error);

    // Show a user-friendly warning
    showEmailWarning();
    return false;
  }
}

// Helper function to get mentor emails
function getMentorEmail(mentorName) {
  // All mentor notifications go to the main CodeMentorX email
  return "codementorx@outlook.com";
}

// Show warning if email sending fails
function showEmailWarning() {
  const warningModal = document.createElement("div");
  warningModal.className =
    "fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-sm";
  warningModal.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      <div>
        <strong>Booking Confirmed!</strong>
        <p class="text-sm">Email notification may be delayed. We'll contact you within 24 hours.</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-yellow-700 hover:text-yellow-900">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  document.body.appendChild(warningModal);

  // Auto remove after 8 seconds
  setTimeout(() => {
    if (warningModal.parentElement) {
      warningModal.remove();
    }
  }, 8000);
}

// Updated Contact form handling with proper EmailJS integration
function handleContactForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  // Send contact form email
  sendContactFormEmail(data);

  // Show success message
  const successModal = document.createElement("div");
  successModal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
  successModal.innerHTML = `
    <div class="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-paper-plane text-2xl text-blue-600"></i>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Message Sent! 📨</h3>
      <p class="text-gray-600 mb-6">
        Thank you for reaching out! We'll get back to you within 4 hours during business hours.
      </p>
      <button onclick="this.closest('.fixed').remove();" 
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg">
        Perfect! ✨
      </button>
    </div>
  `;
  document.body.appendChild(successModal);

  // Reset form
  event.target.reset();
}

// Updated Contact form email function using template_unified
async function sendContactFormEmail(formData) {
  try {
    console.log("📧 Sending contact form email...");

    const contactEmailParams = {
      // Basic email fields
      to_email: "codementorx@outlook.com",
      to_name: "CodeMentorX Team",
      from_name: formData.name,
      reply_to: formData.email,

      // Email content
      email_title: "📨 New Contact Form Submission",
      email_subtitle: `Message from ${formData.name}`,
      email_intro:
        "You've received a new message through the CodeMentorX contact form:",

      // Contact details
      details_title: "📋 Contact Details",
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,

      // Additional info
      next_steps: "false", // Don't show the "What's Next" section for contact forms
      email_closing:
        "Please respond to this inquiry within 4 hours during business hours.",
      platform_name: "CodeMentorX",
      support_email: "codementorx@outlook.com",
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_UNIFIED,
      contactEmailParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Contact form email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("❌ Error sending contact form email:", error);
    return false;
  }
}

// Calendar booking function
function openCalendarBooking() {
  // In a real implementation, this would open a calendar booking widget
  alert(
    "Calendar booking system would open here. Integration with Calendly, Cal.com, or similar service."
  );
}

// Test function - call this from browser console to test your setup
window.testEmailJS = async function (testEmail = "your-email@gmail.com") {
  try {
    console.log("🧪 Testing EmailJS with template_unified...");

    const testParams = {
      to_email: testEmail,
      to_name: "Test User",
      from_name: "CodeMentorX Test",
      reply_to: "codementorx@outlook.com",

      email_title: "🧪 Test Email",
      email_subtitle: "This is a test email from CodeMentorX",
      email_intro: "If you're seeing this, EmailJS is working correctly!",

      details_title: "📋 Test Details",
      mentor_name: "Test Mentor",
      mentor_title: "Test Title",
      mentor_company: "Test Company",
      session_type: "Test Session",
      session_amount: "€0",
      booking_date: new Date().toLocaleDateString(),

      next_steps: "true",
      email_closing: "This was a test email.",
      platform_name: "CodeMentorX",
      support_email: "codementorx@outlook.com",

      message: "This is a test message to verify EmailJS configuration.",
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_UNIFIED,
      testParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Test email sent successfully:", result);
    alert(`✅ Test email sent successfully to ${testEmail}! Check your inbox.`);
    return result;
  } catch (error) {
    console.error("❌ Test email failed:", error);
    alert("❌ Test email failed. Check console for details.");
    throw error;
  }
};

// Simple test function for mentor notification
window.testMentorEmail = async function (testEmail = "your-email@gmail.com") {
  try {
    console.log("🧪 Testing mentor notification email...");

    const testParams = {
      to_email: testEmail,
      to_name: "Test Mentor",
      from_name: "CodeMentorX Platform",
      reply_to: "codementorx@outlook.com",

      client_email: "testclient@example.com",
      client_name: "Test Client",
      mentor_name: "Test Mentor",
      session_type: "30 minutes",
      session_amount: "€25",
      booking_date: new Date().toLocaleDateString(),
      booking_time: "To be scheduled",
      platform_name: "CodeMentorX",

      message: "This is a test mentor notification.",
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_MENTOR_NOTIFY,
      testParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Test mentor email sent successfully:", result);
    alert(
      `✅ Test mentor email sent successfully to ${testEmail}! Check your inbox.`
    );
    return result;
  } catch (error) {
    console.error("❌ Test mentor email failed:", error);
    alert("❌ Test mentor email failed. Check console for details.");
    throw error;
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize EmailJS
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("✅ EmailJS initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize EmailJS:", error);
  }

  // Initialize QR Code
  initQRCode();

  // Add payment form event listener
  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", processPayment);
  }

  // Add contact form event listener
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm);
  }

  // Add explore specializations button
  const exploreBtn = document.getElementById("explore-specializations-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      smoothScrollTo("mentors");
    });
  }

  // Enhanced button navigation
  const browseMentorsButtons = [
    document.getElementById("browse-mentors-btn"),
    document.getElementById("cta-browse-mentors-btn"),
  ];

  const howItWorksButtons = [
    document.getElementById("how-it-works-btn"),
    document.getElementById("cta-how-it-works-btn"),
  ];

  // Browse Mentors button functionality
  browseMentorsButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        smoothScrollTo("mentors");
      });
    }
  });

  // How It Works button functionality
  howItWorksButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        smoothScrollTo("how-it-works");
      });
    }
  });

  // Navigation links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      smoothScrollTo(targetId);
    });
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      // Add mobile menu functionality here
      alert("Mobile menu would open here");
    });
  }

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all sections for animations
  document.querySelectorAll("section").forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  // Set initial opacity for home section to avoid flash
  const homeSection = document.getElementById("home");
  if (homeSection) {
    homeSection.style.opacity = "1";
    homeSection.style.transform = "translateY(0)";
  }
});

// Global functions that need to be accessible from HTML onclick attributes
window.openMentorModal = openMentorModal;
window.closeModal = closeModal;
window.selectSession = selectSession;
window.showQRTooltip = showQRTooltip;
window.hideQRTooltip = hideQRTooltip;
window.openCalendarBooking = openCalendarBooking;
