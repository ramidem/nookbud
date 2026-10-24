#!/usr/bin/env bash
# One-time Google Cloud setup for Nookbud's deploys. Safe to run again: it skips what already exists.
#
#   PROJECT_ID=your-project-id BILLING_ACCOUNT_ID=XXXXXX-XXXXXX-XXXXXX bash infra/gcp/setup.sh
#   DRY_RUN=1 PROJECT_ID=... BILLING_ACCOUNT_ID=... bash infra/gcp/setup.sh   # only prints the commands
#
# Find your billing account id with: gcloud billing accounts list
# To create the tag triggers, first connect GitHub to Cloud Build once in the console, then pass
# REPOSITORY=projects/<project>/locations/<region>/connections/<connection>/repositories/<repo>.
# See docs/deploy.md for what this builds.
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID to your new Google Cloud project id}"
: "${BILLING_ACCOUNT_ID:?Set BILLING_ACCOUNT_ID (see: gcloud billing accounts list)}"
REGION="${REGION:-asia-southeast1}"
REGISTRY="${REGISTRY:-nookbud}"
BUDGET_USD="${BUDGET_USD:-50}"
REPOSITORY="${REPOSITORY:-}"
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
DRY_RUN="${DRY_RUN:-}"

# Print every command, and run it unless this is a dry run.
run() { printf '+'; printf ' %q' "$@"; printf '\n'; [ -n "$DRY_RUN" ] || "$@"; }
# True if the command succeeds. In a dry run nothing "exists", so every step is shown.
exists() { [ -z "$DRY_RUN" ] && "$@" >/dev/null 2>&1; }

echo "Project: $PROJECT_ID   Region: $REGION"
if [ -z "$DRY_RUN" ]; then
  read -r -p "Create resources in this project? [y/N] " answer
  [ "$answer" = "y" ] || { echo "Cancelled."; exit 1; }
fi

# --- Billing and APIs --------------------------------------------------------
billing_on() { [ -z "$DRY_RUN" ] && [ "$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)' 2>/dev/null)" = "True" ]; }
billing_on || run gcloud billing projects link "$PROJECT_ID" --billing-account "$BILLING_ACCOUNT_ID"

run gcloud services enable \
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com iam.googleapis.com cloudresourcemanager.googleapis.com \
  billingbudgets.googleapis.com \
  --project "$PROJECT_ID"

# --- Image registry, with old images cleaned up -------------------------------
if ! exists gcloud artifacts repositories describe "$REGISTRY" --project "$PROJECT_ID" --location "$REGION"; then
  run gcloud artifacts repositories create "$REGISTRY" --repository-format=docker \
    --location "$REGION" --project "$PROJECT_ID" --description "Nookbud images"
fi
policy="$(mktemp)"
cat > "$policy" <<'JSON'
[
  { "name": "delete-old", "action": { "type": "Delete" }, "condition": { "olderThan": "2592000s" } },
  { "name": "keep-recent", "action": { "type": "Keep" }, "mostRecentVersions": { "keepCount": 10 } }
]
JSON
run gcloud artifacts repositories set-cleanup-policies "$REGISTRY" \
  --location "$REGION" --project "$PROJECT_ID" --policy "$policy"

# --- Service accounts: one runtime account per app, and one for Cloud Build ----
sa() { echo "$1@$PROJECT_ID.iam.gserviceaccount.com"; }
for name in web-runtime api-runtime cloud-build; do
  if ! exists gcloud iam service-accounts describe "$(sa "$name")" --project "$PROJECT_ID"; then
    run gcloud iam service-accounts create "$name" --display-name "$name" --project "$PROJECT_ID"
  fi
done

# --- The two Cloud Run services, with a placeholder image until the first tag ---
# web is public. api is private: only callers with permission can reach it.
for app in web api; do
  max=3; access=--allow-unauthenticated
  if [ "$app" = api ]; then max=2; access=--no-allow-unauthenticated; fi
  if ! exists gcloud run services describe "$app" --project "$PROJECT_ID" --region "$REGION"; then
    run gcloud run deploy "$app" \
      --image us-docker.pkg.dev/cloudrun/container/hello \
      --region "$REGION" --project "$PROJECT_ID" \
      --service-account "$(sa "$app-runtime")" "$access" \
      --min-instances 0 --max-instances "$max" --cpu 1 --memory 512Mi --cpu-boost --port 8080 --quiet
  fi

  # Cloud Build may update this service, act as its runtime account, and push images.
  run gcloud run services add-iam-policy-binding "$app" --region "$REGION" --project "$PROJECT_ID" \
    --member "serviceAccount:$(sa cloud-build)" --role roles/run.developer --quiet
  run gcloud iam service-accounts add-iam-policy-binding "$(sa "$app-runtime")" --project "$PROJECT_ID" \
    --member "serviceAccount:$(sa cloud-build)" --role roles/iam.serviceAccountUser --quiet
done
run gcloud artifacts repositories add-iam-policy-binding "$REGISTRY" --location "$REGION" --project "$PROJECT_ID" \
  --member "serviceAccount:$(sa cloud-build)" --role roles/artifactregistry.writer --quiet
run gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member "serviceAccount:$(sa cloud-build)" --role roles/logging.logWriter --quiet

# --- One trigger per app, fired by a tag: web-v1.2.3 deploys web, api-v1.2.3 deploys api ------
trigger() {
  local app="$1" substitutions="$2"
  if exists gcloud builds triggers describe "$app-release" --project "$PROJECT_ID" --region "$REGION"; then
    echo "Trigger $app-release already exists."
    return
  fi
  run gcloud builds triggers create github --name "$app-release" \
    --project "$PROJECT_ID" --region "$REGION" --repository "$REPOSITORY" \
    --tag-pattern "^$app-v[0-9]+\.[0-9]+\.[0-9]+\$" \
    --build-config "apps/$app/cloudbuild.yaml" \
    --service-account "projects/$PROJECT_ID/serviceAccounts/$(sa cloud-build)" \
    --substitutions "$substitutions"
}
if [ -n "$REPOSITORY" ]; then
  web_subs="_MIN_INSTANCES=0"
  [ -z "$SUPABASE_URL" ] || web_subs="$web_subs,_SUPABASE_URL=$SUPABASE_URL,_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
  trigger web "$web_subs"
  trigger api "_MIN_INSTANCES=0"
else
  echo "REPOSITORY is not set, so no tag triggers were created."
  echo "Connect GitHub in the Cloud Build console (repositories, 2nd generation), then run this again with REPOSITORY=..."
fi

# --- Billing alerts at 50%, 80% and 100% of the budget ($25, $40, $50 by default) -----
if [ -n "$DRY_RUN" ]; then PROJECT_NUMBER="000000000000"; else
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
fi
existing=""
[ -n "$DRY_RUN" ] || existing="$(gcloud billing budgets list --billing-account "$BILLING_ACCOUNT_ID" \
  --filter "displayName=nookbud" --format 'value(name)' 2>/dev/null || true)"
if [ -z "$existing" ]; then
  run gcloud billing budgets create --billing-account "$BILLING_ACCOUNT_ID" --display-name nookbud \
    --budget-amount "${BUDGET_USD}USD" --filter-projects "projects/$PROJECT_NUMBER" \
    --threshold-rule percent=0.5 --threshold-rule percent=0.8 --threshold-rule percent=1.0
fi

cat <<DONE

Done. To release, push a tag on main:  git tag web-v0.1.0 && git push origin web-v0.1.0
At launch, keep the web service warm:  gcloud builds triggers update github web-release --region $REGION --update-substitutions _MIN_INSTANCES=1
DONE
