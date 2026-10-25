# GitHub, Git and CI/CD

## What is ready

The source contains `.github/workflows/ci-cd.yml`, PR and issue templates, automated tests, a reproducible SQL migration, and real local Git history. The private live site uses its own managed publishing route. It is not evidence of a GitHub Actions run.

## Your GitHub repository

A private repository has been created at https://github.com/jeenilm8/campus-helpdesk. Clone it with `git clone https://github.com/jeenilm8/campus-helpdesk.git` after the initial source pull request is merged. The source package also includes a portable local Git history bundle. Do not force-push over the existing repository.

The downloadable package includes a portable Git history bundle. To preserve it:

```sh
git clone CampusHelpdesk-history.bundle campus-helpdesk-git
git -C campus-helpdesk-git checkout -b imported-local-history
cd campus-helpdesk-git
git remote rename origin archive
git remote add origin https://github.com/jeenilm8/campus-helpdesk.git
git push -u origin imported-local-history
```

Sign in through your normal GitHub/Git Credential Manager flow if requested. Never put a token in a URL, README or screenshot. If you choose another repository name, replace the remote URL.

Alternatively, from the extracted source folder, initialize a new repository and push it, but that starts a new history:

```sh
git init -b main
git add .
git commit -m "feat: add Campus Helpdesk course project"
git remote add origin https://github.com/jeenilm8/campus-helpdesk.git
git push -u origin main
```

## How CI works

On a pull request to `main`, a push to `main`, or a manual workflow run:

1. Check out source.
2. Install Node.js 24 and the pinned pnpm version.
3. Install dependencies from the frozen lockfile.
4. Run the SQL-backed API test suite.
5. Run TypeScript checks.
6. Build the production Worker and frontend.
7. Apply migrations to a new local test database.
8. Upload the verified build artifact.

Failed tests or builds prevent deployment. PR runs never deploy.

## How the optional CD job works

The deployment job needs the `verify` job to succeed. It runs only on `main` and only when repository variable `ENABLE_DEPLOYMENT` is exactly `true`.

For a separate Cloudflare deployment, you must own a Cloudflare account and D1 database. The included private site does not provide reusable Cloudflare credentials.

Add these in GitHub **Settings > Secrets and variables > Actions**:

| Type | Name | Value |
| --- | --- | --- |
| Secret | CLOUDFLARE_API_TOKEN | Account-scoped token authorized for the target Worker and D1 deployment |
| Secret | CLOUDFLARE_ACCOUNT_ID | Your Cloudflare account ID |
| Variable | CLOUDFLARE_DATABASE_ID | Your D1 database ID |
| Variable | CLOUDFLARE_WORKER_NAME | e.g. campus-helpdesk |
| Variable | ENABLE_DEPLOYMENT | true |

Create a GitHub environment named `production`. Where your GitHub plan supports it, configure required reviewers and branch restrictions. These are account settings, not options this YAML can enforce by itself.

The job downloads the tested build, generates a deployment config with your database binding, applies pending remote migrations and deploys the Worker. It contains no hardcoded API credentials. Do not enable it until the target account and database are correct. Schema migrations can remain applied if uploading the Worker later fails; the included initial migration is additive.

## A meaningful branch and PR demonstration

Pick an actual improvement, such as clearer complaint-form help text:

```sh
git checkout -b feature/SCRUM-10-improve-search-help
# Make and verify the actual change.
git add app/page.tsx
git commit -m "feat(SCRUM-10): clarify complaint search guidance"
git push -u origin feature/SCRUM-10-improve-search-help
```

Open a pull request, link the Jira story, let CI run, request a real teammate review, and merge when checks pass. Do not fabricate reviewer approval or commits for work that did not occur. GitHub repository rules/branch protection must be configured separately if you want to technically require checks before merging.

## Jira and GitHub linking

The Jira epic and stories already exist. Branch and commit messages can include their keys. Automatic GitHub development-panel linking additionally requires your Jira workspace to have the GitHub for Jira integration installed and connected to the repository; this package does not claim that integration is already connected.

## Official references

- https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments
- https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments
- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- https://developers.cloudflare.com/d1/wrangler-commands/
