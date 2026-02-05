# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of **Literaku** seriously. If you have found a security issue, please adhere to the following guidelines:

1.  **Do NOT open a public issue.** Security vulnerabilities should be reported privately to prevent exploitation before a fix is released.
2.  Email us at **security@literaku.app** (or replace with your email).
3.  Provide a detailed description of the vulnerability, including steps to reproduce it.

We will acknowledge your report within 48 hours and provide an estimated timeline for a fix.

### What is covered?
- Cross-Site Scripting (XSS)
- SQL Injection via Supabase RLS bypass
- Authentication bypass (NextAuth)

### What is NOT covered?
- Issues related to user-generated content (e.g., spam reviews) unless it involves a security exploit.
- DDoS attacks (handled by our infrastructure provider).
