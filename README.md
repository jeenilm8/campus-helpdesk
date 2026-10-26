# Campus Helpdesk

A complete classroom project for **Agile Methodology and Development**. Students report campus issues, administrators assign staff, and staff resolve them with a visible conversation and activity history.

## Start here

- Private live application: https://campus-helpdesk-jeenil.jeenilmakwana.chatgpt.site
- GitHub repository: https://github.com/jeenilm8/campus-helpdesk
- Jira epic: https://jeenilmakwana.atlassian.net/browse/SCRUM-5
- Jira board/backlog: https://jeenilmakwana.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog
- [Beginner setup](docs/START_HERE.md)
- [Agile course guide](docs/AGILE_COURSE_GUIDE.md)
- [Architecture and API](docs/ARCHITECTURE.md)
- [GitHub and CI/CD setup](docs/GITHUB_CICD.md)
- [Vercel deployment](docs/VERCEL_DEPLOYMENT.md)
- [Five-minute presentation script](docs/DEMO_SCRIPT.md)
- [Validation results](docs/VALIDATION.md)

## Run on Windows, macOS or Linux

Install **Node.js 24 LTS** and Git. Open a terminal in this folder:

```sh
npm run install:ci
npm run setup
npm run dev
```

Open the URL printed in the terminal, normally `http://localhost:5173`. `setup` builds the app and applies pending migrations to the local database. You need internet for the initial package installation. Later development and demo records are local.

Use the **Student**, **Admin** and **Staff member** buttons to explore. Sample records are seeded automatically on first demo sign-in. New registrations are always students.

| Role | Email | Password |
| --- | --- | --- |
| Student | student@campus.demo | CampusDemo123! |
| Admin | admin@campus.demo | CampusDemo123! |
| IT staff (Riya Shah) | staff@campus.demo | CampusDemo123! |
| Facilities staff (Kunal Mehta) | facilities@campus.demo | CampusDemo123! |
| Second student (Aarav Patel) | aarav@campus.demo | CampusDemo123! |

These are intentionally published **fictional classroom demo credentials**, not production credentials. Demo buttons grant their selected role by design. Do not enter real private complaints in this demonstration.

## Included features

- Registration, login, logout and expiring HttpOnly sessions.
- Server-enforced student ownership and staff assignment permissions.
- Complaint submission with category, location, description and priority.
- Open -> Assigned -> In Progress -> Resolved workflow; reopen supported.
- Admin assignment/reassignment with valid staff accounts only.
- Discussion comments and transactional activity history.
- Stale-update protection through complaint revisions.
- Search, status/priority filters, sorting and CSV export.
- Role-scoped statistics, category breakdown and seven-day report chart.
- Responsive layout, native keyboard-accessible dialogs, error and empty states.
- Automated SQL-backed API tests, TypeScript checks, build and deployment workflow.
- Live Jira epic, 11 stories, four future sprints and story-point estimates.

## Stack

React + TypeScript, Vinext/Vite, Cloudflare Workers API routes, SQLite-compatible Cloudflare D1, Drizzle migrations, Node's built-in test runner, Git and GitHub Actions.

The earlier proposal used Express and MySQL. This delivered version uses a Worker API and SQLite/D1 so one codebase runs locally and on the private live site. It still has a real backend, relational SQL database, server-side sessions and permission checks. It does not require XAMPP or a separate MySQL server.

## Useful commands

```sh
npm test                 # Automated tests using real isolated SQLite databases
npm run typecheck        # TypeScript validation
npm run build            # Production Worker and browser build
npm run build:vercel     # Next.js build for Vercel, using the existing private API
npm run db:migrate       # Apply pending local SQL migrations; build first
npm start               # Preview the built app locally
```

## Important boundaries

GitHub Actions automatically verifies changes and delivers a private release after a successful main-branch build. The private live deployment is separate from GitHub Actions deployment. The included GitHub pipeline becomes active after the source is uploaded to a GitHub repository. Its deployment job additionally needs the Cloudflare secrets and repository variables described in `docs/GITHUB_CICD.md`.

Jira stories are planned review/acceptance work, not a fabricated history of completed team ceremonies. Your team should perform and record real sprint planning, reviews, retrospectives and code reviews. No payments, email delivery, file attachments, password reset or production staff-management UI are included.

Demo data and session databases are deliberately excluded from the downloadable source and Git history. Each fresh local setup starts with a new local database; it does not copy the live database.


#this line is added for testing