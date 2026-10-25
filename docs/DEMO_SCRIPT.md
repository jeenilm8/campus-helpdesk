# Five-minute presentation script

## 0:00 - Problem and product

"Our project is Campus Helpdesk. Students can report campus problems and track their status. Administrators assign a staff member, and that staff member works on the problem and resolves it. Instead of losing complaints in messages, we keep one clear record."

## 0:40 - Student demonstration

Open Student demo. Show the dashboard, click New complaint and enter a fictional projector issue. Add category, location, priority and description. Submit it. Point out its unique ID, Open status and initial activity entry.

"The system validates required fields on both the form and the server. Students can see only their own complaints."

## 1:30 - Administrator demonstration

Close the details dialog and switch the demo role to Admin. Open the new complaint. Assign it to Riya Shah and show the Assigned status.

"Administrators have a complete campus view. Only they can assign complaints to staff accounts."

## 2:05 - Staff demonstration

Switch to Staff. Open the assigned complaint. Click Start working, add a useful comment, then Mark as resolved. Open Activity to show the history. Refresh/reopen as Student to verify the result.

"Staff can access only the complaints assigned to them. Comments keep everyone informed, and each change creates an activity entry."

## 3:00 - Agile and Jira

Open the linked Jira epic SCRUM-5 and backlog. Show one story's acceptance criteria, estimate and planned sprint. Explain the four planned goals: foundation, reporting, resolution, and testing/delivery.

"We use Jira to plan the work. The stories say who needs a feature and why. Acceptance criteria tell us when it is ready. Our team will record actual reviews and retrospectives rather than claiming that planned sprints have already happened."

## 3:50 - Git, GitHub and CI/CD

Show the actual Git history and a real feature branch/PR if your team has created one. Open the workflow file and an actual Actions run when it is available.

"Git tracks changes. GitHub stores and reviews them. CI automatically runs tests and builds the project. Deployment is a separate job that runs after successful verification and after the hosting settings have been configured."

If GitHub setup has not been completed, say "The workflow is included and locally verified; a hosted GitHub Actions run still needs repository setup." Do not show a fake green pipeline.

## 4:40 - Testing and conclusion

Run `npm test` and show the real results. Mention ownership checks, status transitions, session expiry and stale updates.

"This project demonstrates both a working product and the process used to improve and deliver it."

## Quick viva answers

**Why this project for Agile?** It has small independent features, clear users, feedback opportunities and a visible working increment.

**Git vs GitHub?** Git tracks versions. GitHub hosts repositories and supports collaboration and automation.

**CI vs CD?** CI checks integrated code automatically. CD delivers or deploys a verified version.

**Backlog vs sprint backlog?** The product backlog is all ordered work. The sprint backlog is the plan for a chosen sprint goal.

**Why server-side permissions?** A user can alter browser requests. The server must decide what the account may access.

**Why revisions?** If two people open the same complaint, a stale update must not silently overwrite a newer change.

**Why is the demo selector allowed to change roles?** It is an intentional teaching shortcut using fictional accounts. A real rollout must remove it.
