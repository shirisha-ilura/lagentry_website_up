const crypto = require("crypto");
const { sendDemoConfirmationEmail } = require("./_shared/emailService");
const { saveBooking } = require("./_shared/bookingsStore");
const { upsertLead } = require("./_shared/leadsDb");

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    setCORSHeaders(res);
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    setCORSHeaders(res);
    return res.status(405).json({ success: false });
  }

  try {
    setCORSHeaders(res);

    const {
      name,
      email,
      phone,
      bookingDate,
      bookingTime,
      company,
      companySize,
      agentOfInterest,
      message,
    } = req.body;

    if (!name || !email || !phone || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const token = crypto.randomBytes(24).toString("hex");

    // 1) Persist booking metadata via existing in-memory store
    saveBooking(token, {
      name,
      email,
      phone,
      bookingDate,
      bookingTime,
      company: company || null,
      companySize: companySize || null,
      agentOfInterest: agentOfInterest || null,
      message: message || null,
    });

    // 2) Save lead to Neon / Vercel Postgres
    try {
      await upsertLead({
        email,
        source: "book_meeting",
        name,
        phone,
        company: company || null,
        message: message || null,
      });
    } catch (dbErr) {
      console.error("❌ Failed to save book-demo lead to Postgres:", dbErr);
      // Do not fail booking or email if DB write fails
    }

    await sendDemoConfirmationEmail({
      email,
      name,
      token,
      bookingDate,
      bookingTime,
    });

    return res.json({
      success: true,
      message: "Demo booked successfully",
    });
  } catch (err) {
    console.error("BOOK DEMO ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
