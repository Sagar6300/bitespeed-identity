## Bitespeed Backend Task – Identity Reconciliation
This project is a backend service built for the Bitespeed Identity Reconciliation task. The purpose of this service is to reconcile customer identities by linking different contact records (email and/or phone number) to a single user, even if the customer used different details in separate purchases.

## What the Project Does
Accepts a POST request with an email and/or phone number.

Checks the database to see if this contact is already linked to an existing user.

If it finds matching contacts, it links them to a primary user.

If it’s a completely new contact, it creates a new primary record.

Returns a consolidated response with all linked emails, phone numbers, and contact IDs.

## Technologies Used
Node.js – JavaScript runtime

TypeScript – Type-safe development

Express.js – Web server for handling API requests

PostgreSQL – Relational database to store contacts

Prisma ORM – To interact with the database easily

Render.com – For hosting the live API
## Features

- Matches users by email and/or phone number
- Establishes primary and secondary contact relationships
- Returns a consolidated contact response via `/identify` endpoint
- Follows a clean and maintainable architecture
## Use Case
Helps e-commerce platforms track user activity accurately, even when users use different contact details across sessions.
