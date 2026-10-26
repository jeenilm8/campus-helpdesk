# Vercel deployment

Vercel serves the React/Next.js application and the same-origin API gateway. The existing private Worker continues to host the SQL-backed API, so current accounts, complaints, comments and history are preserved.

## Build

`npm run build:vercel` selects the server-only Vercel API runtime. `npm run build` keeps the existing Worker build. Both use the same interface and route contract.

## Required Vercel environment variables

- `CAMPUS_API_ORIGIN`: the HTTPS origin of the existing backend.
- `CAMPUS_API_SERVICE_TOKEN`: the existing service-access credential for that private backend. Store it as a sensitive server variable, never as `NEXT_PUBLIC_*` or in Git.

The gateway forwards only the app's session cookie. It checks request origins before sending mutations, does not forward browser-provided authentication headers, and does not return the platform's cookies or sign-in redirects. Student ownership and staff-assignment checks still run in the original API for every request.

Vercel project: `campus-helpdesk` in `jeenilmakwanas-projects`. The project retains its default Vercel deployment protection. The original private Site's audience and database are unchanged.

Source-file deployment is used because the connected Vercel GitHub installation currently cannot read the private `jeenilm8/campus-helpdesk` repository. Source changes are also committed to that repository. Automatic Vercel deployments from Git require granting its GitHub installation access to that repository separately.
