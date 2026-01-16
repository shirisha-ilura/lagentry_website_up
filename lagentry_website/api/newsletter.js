import { sendNewsletterWelcomeEmail } from '../_shared/emailService.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    setCORSHeaders(res, req.headers.origin);

    const { email, name } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    sendNewsletterWelcomeEmail({
      email: email.trim(),
      name: name?.trim() || ''
    }).catch(console.error);

    return res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error(error);
    setCORSHeaders(res, req.headers.origin);
    return res.status(500).json({ success: false, message: 'Failed to process newsletter signup' });
  }
}
