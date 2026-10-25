# Architecture and API

## Request flow

React interface -> `/api/...` Worker route -> `handleApi` -> parameterized SQL -> D1.

Local development emulates D1 with SQLite. Production uses a persistent hosted D1 database. The client stores no complaint records or role credentials in localStorage. The session token is an HttpOnly cookie; only its SHA-256 digest is stored in the database.

## Main tables

| Table | Purpose and relationships |
| --- | --- |
| users | Student/staff/admin identity, email, password hash and department |
| sessions | Token digest, user reference and expiry |
| complaints | Student owner, optional staff assignee, details, status and revision |
| comments | Complaint reference, author reference, body and timestamp |
| events | Complaint reference, actor reference, description and timestamp |
| login_attempts | Failed-login count and expiry per normalized email digest |
| settings | Demo-seeding marker |

One student can own many complaints. One staff member can be assigned many complaints. One complaint can have many comments and events. Foreign keys enforce these references. Indices cover owner, assignee and complaint-history lookups.

## Roles and permissions

| Action | Student | Staff | Admin |
| --- | --- | --- | --- |
| Submit complaint | Yes | No | No |
| View complaint | Own only | Assigned only | All |
| Comment | Own only | Assigned only | All |
| Assign/reassign | No | No | Yes |
| Update progress | No | Assigned only | All valid transitions |
| View staff directory | No | No | Yes |

Permissions are checked by the server on every request. Hiding a button is not considered authorization. A student-supplied `role`, `student_id` or initial `status` does not override server rules.

## Status transitions

Open -> Assigned: an administrator assigns a valid staff account.

Assigned -> In Progress: assigned staff or an administrator starts work.

In Progress -> Resolved: assigned staff or an administrator resolves the complaint.

Resolved -> In Progress: assigned staff or an administrator reopens it.

There is no direct Open -> Resolved shortcut. Reassignment preserves In Progress status, and resolved records must be reopened before reassignment.

## API endpoints

| Method | Path | Behavior |
| --- | --- | --- |
| GET | /api/health | Liveness and database connectivity |
| POST | /api/auth/register | Register student and create session |
| POST | /api/auth/login | Verify credentials and create session |
| POST | /api/auth/demo | Intentional classroom role access and first-use seeding |
| GET | /api/auth/me | Current authenticated user |
| POST | /api/auth/logout | Revoke session |
| GET | /api/complaints | List role-visible complaints |
| POST | /api/complaints | Student submission |
| GET | /api/complaints/:id | Visible complaint, comments and history |
| PATCH | /api/complaints/:id | Assign staff or perform a valid transition |
| POST | /api/complaints/:id/comments | Add a participant comment |
| GET | /api/staff | Admin-only directory with assignment counts |

Assignment body: `{ "action": "assign", "assignee_id": "demo-staff", "revision": 1 }`.

Progress body: `{ "action": "status", "status": "In Progress", "revision": 2 }`.

## Data integrity and classroom security

- Parameterized SQL for all user inputs.
- Passwords use a random salt and PBKDF2-SHA256 with 100,000 iterations, constrained by the Worker runtime. This is a demonstration setup, not a claim of production security certification.
- Eight-hour server-side sessions; HttpOnly, SameSite=Lax cookies; Secure on HTTPS.
- Login throttling after five invalid attempts for an email within 15 minutes.
- Same-origin checks on mutations and JSON-only request bodies.
- Server-side validation and bounded text sizes.
- Atomic complaint/event and comment/event batches.
- Revision checks prevent stale writes. Failed stale writes do not append a false update event.
- React renders user-provided strings as text; no `dangerouslySetInnerHTML`.
- CSV formula-prefix neutralization in the exported fields.

## Limits and future work

The intentional demo endpoint allows role access and must be removed or disabled before a real campus rollout. Production would additionally need a reviewed identity provider, staff provisioning, password recovery, broader abuse protection, monitoring, backups and privacy policies. Photo attachments and email notifications are future backlog items. Insights are calculated from role-visible records and refresh on navigation/reload, not a real-time push channel.
