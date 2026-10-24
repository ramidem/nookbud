# Deploy

The web app and the API run on Google Cloud Run in Singapore (spec D4). Cloud Build builds and deploys them when a tag is pushed, and at no other time.

## The flow

1. Work on a local `feature/…` branch, push it, and open a pull request into `develop`.
2. GitHub Actions runs the checks. Merge when they are green.
3. When `develop` is ready, merge it into `main`.
4. Tag `main` to release.

| Tag | What happens |
| --- | --- |
| `web-v1.2.3` | Builds and deploys the web app |
| `api-v1.2.3` | Builds and deploys the API |
| Anything else: other tags, branch pushes, pull requests | Nothing deploys. GitHub Actions still runs the checks |

Only a final version (`1.2.3`) deploys. There is no staging and no preview (spec D5).

Versions follow semver, per app. Until launch, stay on `0.1.x` and bump the patch for each release. The launch release is `web-v1.0.0` and `api-v1.0.0`.

## What runs

- **GitHub Actions** has two tiers. Every pull request runs the fast checks (format, lint, tests, build, typecheck) and the secret scan of the git history. A pull request into `main`, and every push to `main`, also run the slow ones: the database tests, the client bundle secret check, and a smoke test that builds both containers and checks they answer. `develop` has no push run because its pull request already ran. A new push to a pull request cancels its older run.
- **Cloud Build** runs `apps/web/cloudbuild.yaml` or `apps/api/cloudbuild.yaml`: build the image, push it to Artifact Registry (`nookbud`, tagged with the git tag), deploy it to Cloud Run, and for the web app time the first response (a warning above 3 seconds). Images older than 30 days are deleted, keeping the 10 newest.
- **Cloud Run** has two services. `web` is public and `api` is private. Each gets 1 vCPU, 512 MiB, startup CPU boost and concurrency 80. `web` scales from 0 to 3 instances and `api` from 0 to 2.

## Set it up once

1. Create a new Google Cloud project and link the Personal billing account.
2. In the Cloud Build console, connect the GitHub repository once (2nd-generation repositories, with the app installed on the `bulakao` organization). Note the repository's resource name.
3. Follow [gcp-setup.md](gcp-setup.md) for the rest: registry, service accounts, the two services, permissions, triggers and a budget alert.

## Release, keep warm, roll back

- Release: `git tag web-v0.1.0 && git push origin web-v0.1.0`. Look at the checks on that commit first: nothing verifies that the tagged commit is on `main` or that CI passed, because Cloud Build cannot see GitHub's checks.
- At launch, keep the web app warm: `gcloud builds triggers update github web-release --region asia-southeast1 --update-substitutions _MIN_INSTANCES=1`, then tag again.
- Roll back: list revisions with `gcloud run revisions list --service web --region asia-southeast1`, then `gcloud run services update-traffic web --to-revisions REVISION=100 --region asia-southeast1`.

## Check a container locally

`pnpm nx run web:container-smoke` or `pnpm nx run api:container-smoke` builds the image, runs it and checks it answers, runs as a non-root user and holds no `.env` file. A Mac builds arm64 images and Cloud Run needs amd64, so only Cloud Build's images are deployed.

## Not done yet

- No real deploy has run, so the Cloud Build configs and triggers are untested against Google Cloud.
- Secrets in Secret Manager (no secret exists yet), the CDN and domain (R46), the warm instance at launch (R45), and Terraform for all of this (R48, parked).
