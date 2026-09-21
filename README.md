# policy-task-tracker

Group project

## Branching strategy

- `main` is the production branch.
- Protect `main` so nobody commits directly to it.
- Require pull requests before merging to `main`.
- Require at least 1 approval from another team member before merge.

## Team workflow

1. Create a short-lived branch from `main` for each task or fix.
2. Push commits to that branch as work progresses.
3. Open a pull request back into `main`.
4. Have another team member review and approve the pull request.
5. Merge only after approval and any required checks pass.
