# Google Cloud setup

A one-time guide to set up the project that [deploy.md](deploy.md) describes. Run the commands in order, and finish all of them before the first tag. A deploy that runs before step 2 fails, and one that runs before step 4 creates a private `web` service that answers 403 to everyone. Each one is safe to look up first with `--help`. If a command says the thing already exists, skip it.

## Before you start

1. Create a new Google Cloud project and note its ID. IDs are unique across Google Cloud, so `nookbud` may be taken.
2. Log in with `gcloud auth login`, and find your billing account with `gcloud billing accounts list` (use **Personal**).
3. In the Cloud Build console, open Repositories (2nd generation), connect GitHub to this project in `asia-southeast1`, and link the `bulakao/nookbud` repository. Note the repository's resource name. It looks like `projects/PROJECT/locations/asia-southeast1/connections/CONNECTION/repositories/REPO`.

Then set these in your shell:

```sh
export PROJECT_ID=your-project-id
export BILLING_ACCOUNT_ID=XXXXXX-XXXXXX-XXXXXX
export REGION=asia-southeast1
export REPOSITORY=projects/…/repositories/…   # from step 3
export SUPABASE_URL=…                         # the public project URL, once it exists
export SUPABASE_ANON_KEY=…                    # the public anon key, once it exists
SA() { echo "$1@$PROJECT_ID.iam.gserviceaccount.com"; }
```

## 1. Billing and APIs

```sh
gcloud billing projects link $PROJECT_ID --billing-account $BILLING_ACCOUNT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com iam.googleapis.com cloudresourcemanager.googleapis.com \
  billingbudgets.googleapis.com --project $PROJECT_ID
```

## 2. Image storage

Images are tagged with the git tag. A cleanup rule deletes images older than 30 days and keeps the 10 newest.

```sh
gcloud artifacts repositories create nookbud --repository-format=docker \
  --location $REGION --project $PROJECT_ID --description "Nookbud images"

cat > cleanup.json <<'JSON'
[
  { "name": "delete-old", "action": { "type": "Delete" }, "condition": { "olderThan": "2592000s" } },
  { "name": "keep-recent", "action": { "type": "Keep" }, "mostRecentVersions": { "keepCount": 10 } }
]
JSON
gcloud artifacts repositories set-cleanup-policies nookbud \
  --location $REGION --project $PROJECT_ID --policy cleanup.json
```

## 3. Service accounts

One runtime account per app, so a leak in one cannot act as the other, and one account for Cloud Build.

```sh
for name in web-runtime api-runtime cloud-build; do
  gcloud iam service-accounts create $name --display-name $name --project $PROJECT_ID
done
```

## 4. The Cloud Run services

A placeholder image holds each name until the first tag. `web` is public. `api` is private, so only callers with permission can reach it.

```sh
gcloud run deploy web --image us-docker.pkg.dev/cloudrun/container/hello \
  --region $REGION --project $PROJECT_ID --service-account $(SA web-runtime) --allow-unauthenticated \
  --min-instances 0 --max-instances 3 --cpu 1 --memory 512Mi --cpu-boost --port 8080 --quiet

gcloud run deploy api --image us-docker.pkg.dev/cloudrun/container/hello \
  --region $REGION --project $PROJECT_ID --service-account $(SA api-runtime) --no-allow-unauthenticated \
  --min-instances 0 --max-instances 2 --cpu 1 --memory 512Mi --cpu-boost --port 8080 --quiet
```

## 5. Permissions for Cloud Build

Cloud Build may update each service, act as its runtime account, push images and write logs, and nothing more.

```sh
for app in web api; do
  gcloud run services add-iam-policy-binding $app --region $REGION --project $PROJECT_ID \
    --member serviceAccount:$(SA cloud-build) --role roles/run.developer --quiet
  gcloud iam service-accounts add-iam-policy-binding $(SA $app-runtime) --project $PROJECT_ID \
    --member serviceAccount:$(SA cloud-build) --role roles/iam.serviceAccountUser --quiet
done
gcloud artifacts repositories add-iam-policy-binding nookbud --location $REGION --project $PROJECT_ID \
  --member serviceAccount:$(SA cloud-build) --role roles/artifactregistry.writer --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member serviceAccount:$(SA cloud-build) --role roles/logging.logWriter --quiet
```

## 6. The tag triggers

`web-v1.2.3` deploys `web` and `api-v1.2.3` deploys `api`. The pattern ignores everything else, such as `web-v1.2.3-rc.1`.

```sh
gcloud builds triggers create github --name web-release \
  --project $PROJECT_ID --region $REGION --repository $REPOSITORY \
  --tag-pattern '^web-v[0-9]+\.[0-9]+\.[0-9]+$' --build-config apps/web/cloudbuild.yaml \
  --service-account projects/$PROJECT_ID/serviceAccounts/$(SA cloud-build) \
  --substitutions _MIN_INSTANCES=0,_SUPABASE_URL=$SUPABASE_URL,_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

gcloud builds triggers create github --name api-release \
  --project $PROJECT_ID --region $REGION --repository $REPOSITORY \
  --tag-pattern '^api-v[0-9]+\.[0-9]+\.[0-9]+$' --build-config apps/api/cloudbuild.yaml \
  --service-account projects/$PROJECT_ID/serviceAccounts/$(SA cloud-build) \
  --substitutions _MIN_INSTANCES=0
```

## 7. A budget alert

Emails at 50%, 80% and 100% of $50 a month.

```sh
gcloud billing budgets create --billing-account $BILLING_ACCOUNT_ID --display-name nookbud \
  --budget-amount 50USD --filter-projects projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)') \
  --threshold-rule percent=0.5 --threshold-rule percent=0.8 --threshold-rule percent=1.0
```

## Then

Push a tag to release (see [deploy.md](deploy.md)). Nothing here has been run against a real project yet, so expect to fix a flag or a permission on the first try, and fix this page when you do.
