const { getBooking, saveBooking } = require("./_shared/bookingsStore");

module.exports = (req, res) => {
  const { token } = req.query;

  const booking = getBooking(token);
  if (!booking) {
    return res.status(404).send("<h2>Invalid or expired link</h2>");
  }

  res.send(`
    <h2>Reschedule Demo</h2>
    <form method="POST">
      <input type="date" name="date" required /><br><br>
      <input type="time" name="time" required /><br><br>
      <button type="submit">Update</button>
    </form>
  `);
};
