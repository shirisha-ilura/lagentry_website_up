# Email Templates Setup Guide for Lagentry

## Sender Identity
**All emails must be sent from:**
- **Sender Name:** Zoya – Founder, Lagentry
- **From Email:** info@lagentry.com
- **Reply To:** info@lagentry.com

**Important:** The sender email is configured in your EmailJS service settings, not in the code.

## Template 1: Waitlist Confirmation Email

**Template ID:** Create new template or use existing `template_oas6ews`

**Subject:** You're on the Lagentry waitlist 🚀

**To Email Field:** `{{email}}`

**Content:**
```
Hi {{first_name}},

I'm Zoya, the founder of Lagentry — and I just wanted to personally welcome you.

You're officially on our waitlist for MENA's first AI Workforce — production-ready AI agents designed to actually work inside real businesses.

Over the coming weeks, you'll get early access, priority onboarding, and a front-row seat as we launch.

If you ever want to reach out directly, you can reply to this email — I read these myself.

Talk soon,

Zoya
Founder, Lagentry
```

**Variables Used:**
- `{{email}}` - User's email address
- `{{first_name}}` - User's first name (extracted from full name)

---

## Template 2: Newsletter Signup Email

**Template ID:** Create new template

**Subject:** Welcome to Lagentry ✨

**To Email Field:** `{{email}}`

**Content:**
```
Hi {{first_name}},

Thanks for joining the Lagentry community.

I'll occasionally share how we're building AI employees for real businesses in MENA — what works, what doesn't, and what's coming next.

No spam. Just honest updates.

Glad to have you here,

Zoya
```

**Variables Used:**
- `{{email}}` - User's email address
- `{{first_name}}` - User's first name

---

## Template 3: Demo Booked - User Confirmation

**Template ID:** Update existing `template_oas6ews` or create new

**Subject:** Your Lagentry Demo is Confirmed ✅

**To Email Field:** `{{email}}`

**Content:**
```
Hi {{first_name}},

Your demo is confirmed. Here are the details:

Date & Time: {{DayDate}} at {{Time}}

Meeting Link: {{meeting_link}}

Agent of Interest: {{agent_of_interest}}

Your Notes: {{user_requirement}}

Looking forward to showing you how Lagentry works in real production environments.

You can reschedule or cancel anytime using the buttons below.

See you soon,

Zoya
```

**Variables Used:**
- `{{email}}` - User's email
- `{{first_name}}` or `{{Name}}` - User's name
- `{{DayDate}}` - Formatted date (e.g., "December 29, 2025")
- `{{Time}}` - Selected time
- `{{meeting_link}}` - Google Calendar/Calendly link
- `{{agent_of_interest}}` - Selected agent type
- `{{user_requirement}}` - User's message/requirements

---

## Template 4: Demo Booked - Internal Team Notification

**Template ID:** Update existing `template_vtyxfzt` or create new

**Subject:** New Demo Request: {{name}} - {{DayDate}} at {{Time}}

**To Email Field:** `ilura.ai.tech@gmail.com` (or your internal email)

**Content:**
```
New demo booking received:

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Company: {{company}}
Company Size: {{company_size}}
Agent of Interest: {{agent_of_interest}}

Date & Time: {{DayDate}} at {{Time}}

Meeting Link: {{meeting_link}}

User Requirements:
{{user_requirement}}

---
Booked at: {{timestamp}}
```

**Variables Used:**
- `{{name}}` - Full name
- `{{email}}` - Email address
- `{{phone}}` - Phone number
- `{{company}}` - Company name
- `{{company_size}}` - Company size
- `{{agent_of_interest}}` - Selected agent
- `{{DayDate}}` - Booking date
- `{{Time}}` - Booking time
- `{{meeting_link}}` - Meeting link
- `{{user_requirement}}` - User's message
- `{{timestamp}}` - Booking timestamp

---

## Template 5: Demo Rescheduled

**Template ID:** Create new template

**Subject:** Your Lagentry Demo Has Been Rescheduled 🔄

**To Email Field:** `{{email}}`

**Content:**
```
Hi {{first_name}},

Your demo has been successfully rescheduled.

New Date & Time: {{DayDate}} at {{Time}}

Meeting Link: {{meeting_link}}

Looking forward to it.

— Zoya
```

**Variables Used:**
- `{{email}}` - User's email
- `{{first_name}}` - User's first name
- `{{DayDate}}` - New date
- `{{Time}}` - New time
- `{{meeting_link}}` - Updated meeting link

---

## Template 6: Demo Cancelled

**Template ID:** Create new template

**Subject:** Demo Cancelled – Hope to See You Again

**To Email Field:** `{{email}}`

**Content:**
```
Hi {{first_name}},

I noticed you cancelled your demo — no worries at all.

If you ever want to reconnect, feel free to reach us at info@lagentry.com or simply book again when the time feels right.

Wishing you the best,

Zoya
```

**Variables Used:**
- `{{email}}` - User's email
- `{{first_name}}` - User's first name

---

## Setup Instructions

1. Go to https://www.emailjs.com/
2. Navigate to **Email Templates**
3. For each template above:
   - Click **New Template** or edit existing
   - Set **Subject** as specified
   - Set **To Email** field to use the variable (e.g., `{{email}}`)
   - Set **From Name** to: `Zoya – Founder, Lagentry`
   - Paste the **Content** exactly as provided
   - Replace variables with `{{variable_name}}` syntax
   - Save the template
   - Note the **Template ID**

4. Update your `.env` file with all template IDs:
```env
REACT_APP_EMAILJS_TEMPLATE_WAITLIST=template_xxxxx
REACT_APP_EMAILJS_TEMPLATE_NEWSLETTER=template_xxxxx
REACT_APP_EMAILJS_TEMPLATE_USER=template_xxxxx
REACT_APP_EMAILJS_TEMPLATE_ADMIN=template_xxxxx
REACT_APP_EMAILJS_TEMPLATE_RESCHEDULE=template_xxxxx
REACT_APP_EMAILJS_TEMPLATE_CANCEL=template_xxxxx
```

5. **Configure Sender Email Address:**
   
   **Option A: Set in EmailJS Service (Recommended)**
   - Go to EmailJS Dashboard → **Email Services**
   - Click on your service (e.g., `service_xj5lxrm`)
   - Click **"Reconnect"** or **"Edit"**
   - Connect with the Gmail account: **info@lagentry.com**
   - Authorize EmailJS to send emails from this account
   - Save the service
   
   **Option B: Set in Each Template**
   - For each email template:
   - Find the **"From Email"** field
   - Set it to: `info@lagentry.com`
   - Set **"From Name"** to: `Zoya – Founder, Lagentry`
   - Save the template

6. Make sure your EmailJS service is connected to Gmail and reconnected if needed.

