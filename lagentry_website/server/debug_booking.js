const { sendDemoConfirmationEmail, sendDemoInternalNotification, COMPANY_EMAIL } = require('./emailService');
const fs = require('fs');
const path = require('path');

// Mock request-like data
const body = {
    name: "Siri",
    email: "nshirisha1712@gmail.com",
    phone: "2222223123",
    bookingDate: "2026-02-17T18:30:00.000Z",
    bookingTime: "02:00 PM",
    bookingDateTime: "February 18, 2026 at 02:00 PM" // Simulating the formatted string that caused issues
};

async function test() {
    try {
        console.log('Testing business logic...');
        console.log('COMPANY_EMAIL:', COMPANY_EMAIL);

        // Simulate the logic in /api/book-demo
        const name = body.name;
        const email = body.email;
        const phone = body.phone;
        const bookingDate = body.bookingDate;
        const bookingTime = body.bookingTime;
        const bookingDateTime = body.bookingDateTime;
        const agentOfInterest = "General";
        const message = "Test requirement";

        const meetingDate = new Date(bookingDate);

        // Robustly parse time (handles '14:00', '02:00 PM', '2 PM', etc.)
        let hours = 0, minutes = 0;
        const timeStr = bookingTime.trim().toUpperCase();
        const isPM = timeStr.includes('PM');
        const isAM = timeStr.includes('AM');

        // Remove AM/PM for simple numeric parsing
        const numericTime = timeStr.replace(/[AP]M/g, '').trim();
        const timeParts = numericTime.split(':');

        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;

        // Convert to 24-hour format if AM/PM is present
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;

        meetingDate.setHours(hours, minutes, 0);
        const endDate = new Date(meetingDate);
        endDate.setHours(endDate.getHours() + 1);

        console.log('--- DEBUG INFO ---');
        console.log('Original bookingDate:', body.bookingDate);
        console.log('Original bookingTime:', body.bookingTime);
        console.log('Original bookingDateTime:', body.bookingDateTime);
        console.log('Calculated hours:', hours);
        console.log('Calculated minutes:', minutes);
        console.log('Parsed meetingDate (ISO):', meetingDate.toISOString());
        console.log('Parsed endDate (ISO):', endDate.toISOString());
        console.log('------------------');

        // Mock link generation
        const rescheduleLink = "http://mock/reschedule";
        const cancelLink = "http://mock/cancel";
        const meetingLink = "http://mock/calendar";

        console.log('Attempting to call sendDemoConfirmationEmail...');
        const result1 = await sendDemoConfirmationEmail({
            email: email.trim(),
            name: name.trim(),
            dateTime: bookingDateTime || meetingDate.toISOString(),
            meetingLink: meetingLink,
            agentName: agentOfInterest || 'General',
            userRequirement: message?.trim() || '',
            rescheduleLink: rescheduleLink,
            cancelLink: cancelLink
        });
        console.log('Result 1:', result1);

        console.log('Attempting to call sendDemoInternalNotification...');
        const result2 = await sendDemoInternalNotification({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            company: '',
            companySize: '',
            dateTime: bookingDateTime || meetingDate.toISOString(),
            meetingLink: meetingLink,
            agentName: agentOfInterest || 'General',
            userRequirement: message?.trim() || ''
        });
        console.log('Result 2:', result2);

    } catch (err) {
        console.error('ERROR DETECTED:', err);
    }
}

test();
