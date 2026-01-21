const bookings = new Map();

function saveBooking(token, data) {
  bookings.set(token, { ...data, createdAt: Date.now() });
}

function getBooking(token) {
  return bookings.get(token);
}

function deleteBooking(token) {
  bookings.delete(token);
}

module.exports = { saveBooking, getBooking, deleteBooking };
