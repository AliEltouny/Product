# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Contact Form Email Setup

The contact form sends mail through SMTP using `src/app/api/contact/route.ts`.

1. Copy `.env.example` to `.env.local`.
2. Set these values:
	- `SMTP_HOST`
	- `SMTP_PORT`
	- `SMTP_USER`
	- `SMTP_PASS`
	- `CONTACT_TO_EMAIL` (your inbox)
	- `CONTACT_FROM_EMAIL` (the sender shown by SMTP)
3. Restart the dev server.

Emails are delivered to `CONTACT_TO_EMAIL`, with the user's email included in the subject/reply-to and their message in the body.

## Checkout Verification + Confirmation Emails

Checkout uses two APIs:
- `src/app/api/checkout/send-code/route.ts`: sends a 6-digit verification code to the shopper email.
- `src/app/api/checkout/place-order/route.ts`: verifies code, creates order number, then sends a confirmation email with ETA and a Track Order button.

Add these to `.env.local` as well:
- `VERIFY_CODE_FROM_EMAIL` (set to `verifyemaildesd@gmail.com` if your SMTP provider allows it)
- `ORDER_FROM_EMAIL` (set to `verifyemaildesd@gmail.com` if your SMTP provider allows it)
- `NEXT_PUBLIC_APP_URL` (example `http://localhost:9002`)

Note: The sender email must be allowed by your SMTP account/provider; otherwise delivery can fail.