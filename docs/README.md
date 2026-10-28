# Internal docs

For the team. Nothing here is served on the website: the public documentation is in [apps/web/documentation](../apps/web/documentation/index.md).

| Page | What it is |
| --- | --- |
| [Specification](spec.md) | What the product must do, as requirements with IDs and priorities |
| [Requirements](requirements.md) | The build queue: user stories and system rules, in the order we implement them |
| [Roadmap 2026](roadmap-2026.md) | Launch gates and the backlog from P0 to P4 |
| [Database](database.md) | The Supabase project: migrations, seed data, the local database and environments |
| [Spaces](spaces.md) | Spaces, members, children and invitations: the screens, the roles and the rules |
| [Auth](auth.md) | How the app does auth: the one module, its rules, and how to change provider |
| [Deploy](deploy.md) | How the web app and the API reach Cloud Run: the git flow, tags, setup, release and rollback |
| [Google Cloud setup](gcp-setup.md) | The one-time commands that create the project's registry, services, permissions, triggers and budget alert |
| [Costs](costs.md) | What running Nookbud costs, what is verified, and when to revisit |
| [Secrets](secrets.md) | Which values are public and which are secret, how that is enforced, and what to do if one leaks |
| [The documentation site](documentation-site.md) | How the public documentation works, and what must never go in it |
| [Old codebase](old-codebase.md) | What to salvage from `nookbud_copy`, and what to leave behind |

`discovery/`, `research/` and `strategy/` are old reference material. They are stale and being retired: when we specify an area, we pull what we need into the spec and delete what we moved.
