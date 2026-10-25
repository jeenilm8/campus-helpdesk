# Beginner setup and first demonstration

## Fastest option: use the live website

Open https://campus-helpdesk-jeenil.jeenilmakwana.chatgpt.site while signed in to the owning ChatGPT account. It is private. Click **Student** and submit a fictional complaint. Use the top-right demo-role selector to become Admin, assign it to Riya Shah, then switch to Staff and resolve it.

You can create a separate student account, but it begins with no complaints. Only the student demo account has Jeenil's sample complaints.

## Local setup in small steps

1. Install the current Node.js 24 LTS release from https://nodejs.org/ and Git from https://git-scm.com/.
2. Extract the project ZIP. Open the `campus-helpdesk` folder in VS Code.
3. Open **Terminal > New Terminal**. Check `node --version`; it should start with `v24` or later.
4. Run `npm run install:ci`. This downloads the locked dependency versions using pnpm. Do not close the terminal until it finishes.
5. Run `npm run setup`. This creates a production build and applies local SQL migrations.
6. Run `npm run dev` and keep this terminal open.
7. Open the local URL printed by the terminal, normally http://localhost:5173.
8. Click a demo role. Data is saved in your local `.wrangler/state` directory.
9. Stop the server with Ctrl+C when finished. Restart using `npm run dev`; existing local records remain.

On Windows, if PowerShell blocks `npm.ps1`, open **Command Prompt** in the VS Code terminal menu and run the same commands there. You do not need to change your security policy.

## If something goes wrong

| Problem | What to do |
| --- | --- |
| `node` or `npm` is not recognized | Install Node.js and reopen VS Code. |
| A table is missing | Run `npm run setup` from the project folder. |
| The port is already in use | Stop the other instance, or run `npm run dev -- --port 5174`. |
| Install cannot reach the registry | Check the network and retry `npm run install:ci`; do not edit the lockfile. |
| Login has too many attempts | Wait 15 minutes, or use a demo-role button for the presentation. |
| A complaint has changed | Refresh and retry; another tab may have updated it. |
| Staff sees no newly submitted complaint | An admin must assign that complaint to that staff member first. |

## Files you should understand first

- `app/page.tsx`: website screens and forms.
- `lib/helpdesk.mjs`: actual API and database operations.
- `lib/domain.mjs`: validation, ownership rules and status transitions.
- `lib/auth.mjs`: password hashing and session helpers.
- `db/schema.ts` and `drizzle/`: database structure and versioned migration.
- `tests/helpdesk.test.mjs`: automated tests of actual API behavior.
- `.github/workflows/ci-cd.yml`: automated checks and optional deployment.
- `docs/`: course evidence, demonstration and setup instructions.
