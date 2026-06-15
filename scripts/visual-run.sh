#!/usr/bin/env bash
# Local baseline generation / comparison for the visual regression suite.
#
# Host runs the production-built example servers; a Linux Chromium container
# runs Playwright against host.docker.internal so PNG baselines match CI.
#
# Usage:
#   scripts/visual-run.sh update   # regenerate baselines (writes __snapshots__/)
#   scripts/visual-run.sh check    # compare against committed baselines
#
# Prereqs: docker daemon running, node_modules installed, pnpm build:examples done.

set -euo pipefail

MODE="${1:-check}"
IMAGE="mcr.microsoft.com/playwright:v1.48.2-noble"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "$MODE" != "update" && "$MODE" != "check" ]]; then
    echo "usage: $0 [update|check]" >&2
    exit 2
fi

PLAYWRIGHT_FLAGS=""
[[ "$MODE" == "update" ]] && PLAYWRIGHT_FLAGS="--update-snapshots"

start_servers() {
    local group="$1"
    node "$ROOT/scripts/start-all.mjs" --group="$group" &
    SERVER_PID=$!
    # start-all.mjs prints READY <ports> once every server returned an HTML response.
    local sentinel_port=3000
    [[ "$group" == "standalone" ]] && sentinel_port=3005
    for _ in $(seq 1 120); do
        if curl -sf "http://127.0.0.1:${sentinel_port}/" -o /dev/null; then return 0; fi
        sleep 0.5
    done
    echo "servers did not come up for group=$group" >&2
    kill $SERVER_PID 2>/dev/null || true
    return 1
}

stop_servers() {
    kill $SERVER_PID 2>/dev/null || true
    # Belt-and-suspenders: kill anything still bound to the visual ports.
    for p in 3000 3001 3002 3003 3004 3005; do
        lsof -iTCP:$p -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    done
}

run_docker() {
    local group="$1"
    docker run --rm --ipc=host \
        -v "$ROOT:/work" \
        -w /work \
        -e TARGET_HOST=host.docker.internal \
        -e VISUAL_GROUP="$group" \
        --add-host=host.docker.internal:host-gateway \
        "$IMAGE" \
        npx playwright test ${PLAYWRIGHT_FLAGS}
}

for group in hub standalone; do
    echo "=== visual ($group) ==="
    start_servers "$group"
    trap stop_servers EXIT
    run_docker "$group"
    stop_servers
    trap - EXIT
done

echo "Visual ${MODE} complete."
