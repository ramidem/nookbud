#!/usr/bin/env bash
# Builds an app's container, starts it, and checks it behaves. Prints the time to the first response.
# Usage: bash infra/container-smoke.sh web|api      (or: pnpm nx run web:container-smoke)
set -euo pipefail

app="${1:?Usage: container-smoke.sh web|api}"
case "$app" in
  web) default_port=18080 ;;
  api) default_port=18081 ;;
  *) echo "Unknown app: $app (use web or api)" >&2; exit 2 ;;
esac

cd "$(dirname "$0")/.."
IMAGE="${IMAGE:-nookbud-$app:smoke}"
NAME="nookbud-$app-smoke"
PORT="${PORT:-$default_port}"
BASE="http://127.0.0.1:${PORT}"

docker build -f "apps/$app/Dockerfile" -t "$IMAGE" .

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

docker run -d --name "$NAME" -p "${PORT}:8080" "$IMAGE" >/dev/null
started=$(python3 -c 'import time; print(time.time())')

status() { curl -s -o /dev/null -w '%{http_code}' "$1" || true; }
fail() { echo "FAIL: $1" >&2; docker logs "$NAME" 2>&1 | tail -20 >&2; exit 1; }

for _ in $(seq 1 150); do
  [ "$(status "$BASE/")" = "200" ] && break
  sleep 0.1
done
ready=$(python3 -c "import time; print(round(time.time() - $started, 2))")
[ "$(status "$BASE/")" = "200" ] || fail "the container did not answer on / within 15 seconds"
echo "First successful response after ${ready}s"

if [ "$app" = "web" ]; then
  [ "$(status "$BASE/documentation/getting-started")" = "200" ] || fail "a public documentation page is missing"
  [ "$(status "$BASE/documentation/spec")" = "404" ] || fail "an internal page is being served"

  # Static files must be in the image: take a real asset URL from the home page and fetch it.
  asset=$(curl -s "$BASE/" | grep -o '/_next/static/[^"]*\.js' | head -1)
  [ -n "$asset" ] || fail "the home page references no static script"
  [ "$(status "$BASE$asset")" = "200" ] || fail "static assets are missing from the image: $asset"
else
  curl -s "$BASE/" | grep -q "Hello API" || fail "the API did not return its greeting"
fi

[ "$(docker exec "$NAME" id -u)" != "0" ] || fail "the container runs as root"
if docker exec "$NAME" sh -c 'find / -name ".env*" -not -path "/proc/*" 2>/dev/null | grep -q .'; then
  fail "an .env file is inside the image"
fi

echo "OK: $app container is healthy (image: $(docker image inspect "$IMAGE" --format '{{.Size}}' | awk '{printf "%.0f MB", $1/1000000}'))"
