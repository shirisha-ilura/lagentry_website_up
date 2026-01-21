const { getBooking, deleteBooking } = require("./_shared/bookingsStore");

module.exports = (req, res) => {
  const { token } = req.query;

  const booking = getBooking(token);
  if (!booking) {
    return res.status(404).send("<h2>Invalid or expired link</h2>");
  }

  deleteBooking(token);

  res.send("<h2>Your demo has been cancelled successfully.</h2>");
};
