const { sql } = require('@vercel/postgres');

/**
 * Insert or update a lead in the `leads` table.
 *
 * Schema (from your Neon setup):
 *   id BIGSERIAL PRIMARY KEY,
 *   email TEXT NOT NULL,
 *   source TEXT NOT NULL,
 *   name TEXT,
 *   phone TEXT,
 *   company TEXT,
 *   message TEXT,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   UNIQUE (email, source)
 *
 * This helper:
 * - Normalizes and validates required fields
 * - Uses ON CONFLICT(email, source) DO NOTHING to avoid crashes on duplicates
 * - Returns { success, duplicate, row } so callers can decide what to show
 */
async function upsertLead({ email, source, name, phone, company, message }) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedSource = (source || '').trim();

  if (!trimmedEmail || !trimmedSource) {
    throw new Error('Missing required lead fields: email or source');
  }

  // Basic email sanity check (primary validation should already happen in the route)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error('Invalid email format for lead');
  }

  // Only allow known sources to avoid random junk in DB
  const allowedSources = ['waitlist', 'newsletter', 'book_meeting', 'lead_qualification'];
  if (!allowedSources.includes(trimmedSource)) {
    throw new Error(`Invalid lead source: ${trimmedSource}`);
  }

  // Insert lead; ignore duplicates using the UNIQUE (email, source) constraint
  const result = await sql`
    INSERT INTO leads (email, source, name, phone, company, message)
    VALUES (${trimmedEmail}, ${trimmedSource}, ${name || null}, ${phone || null}, ${company || null}, ${message || null})
    ON CONFLICT (email, source)
    DO NOTHING
    RETURNING *;
  `;

  const row = result.rows[0] || null;

  return {
    success: true,
    duplicate: !row, // if no row returned, the record already existed
    row,
  };
}

module.exports = {
  upsertLead,
};

