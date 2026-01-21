const crypto = require("crypto");
const { sendDemoConfirmationEmail } = require("./_shared/emailService");
const { saveBooking } = require("./_shared/bookingsStore");

function setCORSHeaders(res, origin) {
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

    const { name, email, phone, bookingDate, bookingTime } = req.body;

    if (!name || !email || !phone || !bookingDate || !bookingTime) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const token = crypto.randomBytes(24).toString("hex");

    saveBooking(token, {
      name,
      email,
      phone,
      bookingDate,
      bookingTime,
    });

    await sendDemoConfirmationEmail({
      email,
      name,
      token,
    });

    return res.json({
      success: true,
      message: "Demo booked successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
