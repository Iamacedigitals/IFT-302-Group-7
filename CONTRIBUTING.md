# Contributing

## Branching
- `main`: stable, working code only. No direct pushes.
- `develop`: integration branch.
- Feature branches from `develop`: `feature/<name>-<task>` (e.g. `feature/ada-bill-api`).
- Fixes: `fix/<name>-<issue>`.

## Workflow
1. `git checkout develop && git pull`
2. `git checkout -b feature/<name>-<task>`
3. Commit small and often.
4. Push and open a Pull Request into `develop`; at least one teammate reviews.

## Commit messages
`type: short description` where type is `feat`, `fix`, `docs`, `style`, `refactor` or `db`.
Example: `feat: add current bill API endpoint`

## Rules
- Never commit `config/config.php` or real passwords.
- Use PDO prepared statements for ALL SQL.
- One class per file, filename = class name (`src/Classes/Bill.php`).
- API endpoints return JSON via `src/Helpers/response.php`.
- Schema changes: edit `database/schema.sql` and update the ERD in the same PR.

## Task Ownership
| Area | Folders | Owner |
|---|---|---|
| Diagrams (use case, activity, ERD) | `docs/diagrams/` | |
| Database | `database/` | |
| OOP classes | `src/` | |
| API | `api/` | |
| Frontend pages + CSS | `public/`, `includes/` | |
| JavaScript / fetch | `public/assets/js/` | |
| Admin dashboard | `public/admin/`, `api/admin/` | |
