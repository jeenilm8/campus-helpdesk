# Agile course guide

## Problem and objective

Students often report broken projectors, leaking taps or unstable Wi-Fi through informal conversations. They cannot easily track progress, and administrators cannot see who is responsible. Campus Helpdesk provides one record with a student owner, staff assignee, status, discussion and activity trail.

## Course concepts mapped to real evidence

| Concept | Project evidence |
| --- | --- |
| Product vision | One place to report, assign and resolve campus issues. |
| Product backlog | Jira epic SCRUM-5 and stories SCRUM-6 through SCRUM-16. |
| User stories | Role, goal and benefit in each Jira description. |
| Acceptance criteria | Concrete conditions listed on every story. |
| Estimation | Story-point estimates recorded in Jira. These measure relative effort, not hours. |
| Sprint planning | Four future sprints with goals and grouped stories. |
| Increment | A working, testable slice of functionality. |
| Git | Commits, branches and a portable history bundle. |
| GitHub collaboration | Source repository setup instructions, feature-branch examples and PR template. |
| Continuous integration | Actions workflow runs tests, type checks, build and fresh database migration checks. |
| Continuous deployment | Separate job depends on successful verification and configured deployment settings. |
| Testing and defects | SQL-backed automated tests plus bug-report template. |
| Sprint review | Demonstrate the increment against acceptance criteria; record actual feedback. |
| Retrospective | Record what worked, what did not, and one improvement for the next sprint. |

## Actual Jira structure

Existing project: **My Software Team (SCRUM)**. New parent epic: **SCRUM-5**. Existing unrelated issues and sprints were not modified.

| Planned sprint | Jira stories | Points | Goal |
| --- | --- | --- | --- |
| CH Sprint 1 Foundation | SCRUM-6, SCRUM-7 | 8 | Authentication, SQL and version control |
| CH Sprint 2 Report and Track | SCRUM-8, SCRUM-9, SCRUM-10 | 13 | Student submission, privacy, search and exports |
| CH Sprint 3 Assign and Resolve | SCRUM-11, SCRUM-12, SCRUM-13 | 13 | Staff assignment, workflow, comments and history |
| CH Sprint 4 Test and Deliver | SCRUM-14, SCRUM-15, SCRUM-16 | 13 | Tests, CI/CD, insights and presentation |

The sprints are **future/planned**. No dates or completed ceremonies have been invented. The implementation has been prepared in this session; your team must review it and record its actual acceptance. Do not present the planned sprint grouping as proof of four elapsed development sprints.

## Suggested team roles

- Product Owner: clarifies needs, orders the backlog and accepts the result.
- Scrum Master: helps the team follow its process and remove obstacles.
- Developers: build, test, review and deliver the increment. Developers includes testing work.

For a small student team, distribute responsibilities sensibly. Record actual names only after team members agree. The project does not invent team members, meetings or peer approval.

## Definition of Ready

A story is ready when its user benefit is clear, acceptance criteria are testable, dependencies are understood, and the team has discussed the estimate.

## Definition of Done

1. Acceptance criteria pass.
2. Appropriate role and ownership rules pass.
3. Relevant automated tests and TypeScript checks pass.
4. Production build succeeds.
5. Changes have been reviewed; until peer review occurs, explicitly say self-reviewed.
6. No credentials or runtime data are committed.
7. Demo/setup instructions reflect the result.

## A real sprint cycle to perform

1. Planning: choose a goal and a realistic subset of the prepared backlog.
2. Daily check-in: discuss progress toward that goal and blockers.
3. Build/review: use branches, meaningful commits and pull requests for real changes.
4. Review: show working functionality and collect feedback.
5. Retrospective: select one specific improvement.

## Review record template

Date:

Sprint and goal:

Participants:

Stories demonstrated:

Acceptance criteria passed / failed:

Feedback and resulting backlog changes:

## Retrospective template

What helped us:

What slowed us down:

One improvement for the next sprint:

Owner and follow-up date:

## Change-request exercise

After demonstrating the initial workflow, ask a classmate or faculty member for feedback. Example future request: allow a student to acknowledge a resolution. Create a new Jira story with acceptance criteria, develop it on a branch, open a pull request, show CI passing, and release it. This creates authentic iteration evidence.

## Burndown and velocity

Do not fabricate a burndown or claim a velocity from planned estimates. A burndown requires real remaining-work observations over time; velocity uses actual work completed in past sprints. The live Jira board can produce evidence after your team runs real sprints.
