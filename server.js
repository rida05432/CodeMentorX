// server.js - CodeMentorX Backend
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize Stripe with your secret key
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_SECRET_KEY_HERE"
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Create payment intent endpoint
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "eur", metadata } = req.body;

    // Validate amount
    if (!amount || amount < 50) {
      // Minimum 50 cents
      return res.status(400).json({
        error: "Invalid amount. Minimum amount is €0.50",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(
      `✅ Payment intent created: ${paymentIntent.id} for €${amount / 100}`
    );

    res.json({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    res.status(400).json({
      error: error.message || "Failed to create payment intent",
    });
  }
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("⚠️ Stripe webhook secret not configured");
      return res.status(200).send("Webhook secret not configured");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
        console.log(`💰 Amount: €${paymentIntent.amount / 100}`);
        console.log(`📧 Customer: ${paymentIntent.metadata.email || "N/A"}`);
        console.log(`👨‍🏫 Mentor: ${paymentIntent.metadata.mentorId || "N/A"}`);
        console.log(
          `⏰ Session: ${paymentIntent.metadata.sessionType || "N/A"}`
        );

        // Here you could:
        // 1. Send confirmation emails
        // 2. Update your database
        // 3. Trigger calendar booking
        // 4. Send notifications to mentors
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log(`❌ Payment failed: ${failedPayment.id}`);
        console.log(`📧 Customer: ${failedPayment.metadata.email || "N/A"}`);
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    webhook_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
});

// API endpoint to get payment status
app.get("/payment-intent/:id", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error("❌ Error retrieving payment intent:", error);
    res.status(404).json({ error: "Payment intent not found" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Server error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodeMentorX server running on port ${PORT}`);
  console.log(`🌍 Server URL: http://localhost:${PORT}`);
  console.log(
    `💳 Stripe integration: ${
      process.env.STRIPE_SECRET_KEY ? "✅ Configured" : "❌ Not configured"
    }`
  );
  console.log(
    `🔗 Webhook endpoint: ${
      process.env.STRIPE_WEBHOOK_SECRET ? "✅ Configured" : "❌ Not configured"
    }`
  );

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn(
      "⚠️  Please set STRIPE_SECRET_KEY in your environment variables"
    );
  }
});
