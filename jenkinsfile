# =============================================================================
# DepthFence CI/CD  (GitHub Actions)
#
# Detected stack : Node/Express API (backend/) + React/Vite UI (frontend/)
#                  FastAPI/YOLO engine (geosuraksha-ai-engine/, no manifest yet)
# Deploy target  : Vercel (root vercel.json: @vercel/node + @vercel/static-build)
# No Dockerfile / Terraform / K8s found -> image scan N/A; Trivy misconfig scan
# still runs and will pick up any IaC added later.
#
# >>> PLACEHOLDERS YOU MUST SET (Settings -> Secrets and variables -> Actions)
#   Secrets  : VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
#              VERCEL_AUTOMATION_BYPASS_SECRET   (optional, only if Vercel
#                                                 Deployment Protection is on)
#   Variables: DEPLOY_ENABLED = true   (deploy jobs stay OFF until you set this)
#              PRODUCTION_URL = https://<your-domain>   (optional; enables the
#                                                 DNS/HTTPS/cert checks)
#   Environments: create "staging" and "production"; add yourself as a
#              REQUIRED REVIEWER on "production" so every prod deploy needs
#              your explicit approval.
#   App runtime secrets (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, ADMIN_EMAIL,
#   ADMIN_PASSWORD, EMAIL_USER, EMAIL_APP_PASSWORD, VITE_API_BASE_URL) belong in
#   the Vercel project settings, NOT in this repo or in GitHub.
# =============================================================================
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "17 2 * * 1" # weekly security re-scan (never deploys)
  workflow_dispatch:

concurrency:
  group: ci-cd-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

permissions:
  contents: read

env:
  NODE_VERSION: "22"
  AUDIT_LEVEL: high # npm audit fails at this severity or above
  GITLEAKS_IMAGE: zricethezav/gitleaks:v8.18.4
  TRIVY_IMAGE: aquasec/trivy:0.58.1
  ACTIONLINT_IMAGE: rhysd/actionlint:1.7.4
  SEMGREP_VERSION: "1.97.0"
  VERCEL_CLI_VERSION: latest # PLACEHOLDER: pin to a tested version, e.g. 41.x

jobs:
  # ---------------------------------------------------------------------------
  validate:
    name: Validate config, lockfiles, versions
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Validate JSON config files
        run: |
          set -euo pipefail
          for f in package.json backend/package.json frontend/package.json vercel.json frontend/vercel.json; do
            node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$f"
            echo "OK  $f"
          done

      - name: Validate dependency version ranges (no *, latest, git or URL deps)
        run: |
          node - <<'EOF'
          const fs = require('fs');
          const bad = [];
          for (const f of ['package.json', 'backend/package.json', 'frontend/package.json']) {
            const p = JSON.parse(fs.readFileSync(f, 'utf8'));
            for (const sec of ['dependencies', 'devDependencies']) {
              for (const [name, ver] of Object.entries(p[sec] || {})) {
                if (!/^[\^~]?\d+\.\d+\.\d+/.test(ver)) bad.push(`${f}: ${name}@${ver}`);
              }
            }
          }
          if (bad.length) {
            console.error('Non-semver / non-registry dependencies:\n' + bad.join('\n'));
            process.exit(1);
          }
          console.log('All dependency ranges are semver-bounded.');
          EOF

      - name: Lockfile integrity (npm registry only, HTTPS, integrity hashes)
        run: |
          set -euo pipefail
          for d in . backend frontend; do
            test -f "$d/package-lock.json" || { echo "::error::Missing package-lock.json in $d"; exit 1; }
            npx --yes lockfile-lint@4.14.0 --path "$d/package-lock.json" --type npm \
              --allowed-hosts npm --validate-https --validate-integrity
          done

      - name: Lockfiles in sync with package.json (npm ci dry run)
        run: |
          set -euo pipefail
          for d in backend frontend; do
            (cd "$d" && npm ci --dry-run --ignore-scripts --no-audit --no-fund)
          done

      - name: Lint workflow files (actionlint)
        run: |
          docker run --rm -v "$PWD:/repo" -w /repo "$ACTIONLINT_IMAGE" \
            -color -shellcheck= -pyflakes=

      - name: Python syntax check (AI engine)
        run: python -m py_compile geosuraksha-ai-engine/server.py

  # ---------------------------------------------------------------------------
  secret-scan:
    name: Secret detection (Gitleaks)
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # scan full history
          persist-credentials: false

      - name: Gitleaks (fails on any finding)
        run: |
          docker run --rm -v "$PWD:/repo" \
            -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/repo \
            "$GITLEAKS_IMAGE" detect \
            --source /repo --config /repo/.gitleaks.toml \
            --redact --no-banner --exit-code 1 \
            --report-format sarif --report-path /repo/gitleaks.sarif

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: gitleaks-report
          path: gitleaks.sarif
          if-no-files-found: ignore
          retention-days: 14

  # ---------------------------------------------------------------------------
  sast:
    name: SAST (Semgrep)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Semgrep
        run: pip install --no-cache-dir "semgrep==${SEMGREP_VERSION}"

      - name: Semgrep (fails on ERROR-severity findings)
        env:
          SEMGREP_SEND_METRICS: "off"
        run: |
          semgrep scan --metrics=off --error --severity ERROR \
            --sarif-output=semgrep.sarif \
            --config p/default --config p/javascript --config p/nodejsscan \
            --config p/jwt --config p/react --config p/python --config p/secrets \
            --exclude node_modules --exclude dist --exclude package-lock.json \
            --exclude "*.min.js" --exclude "*.pt" --exclude "*.pyc" \
            .

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: semgrep-report
          path: semgrep.sarif
          if-no-files-found: ignore
          retention-days: 14

  # ---------------------------------------------------------------------------
  dependency-scan:
    name: Dependency, package & IaC scan (npm audit + Trivy)
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: npm audit - backend (production deps)
        working-directory: backend
        run: npm audit --omit=dev --audit-level="$AUDIT_LEVEL"

      - name: npm audit - frontend (production deps)
        working-directory: frontend
        run: npm audit --omit=dev --audit-level="$AUDIT_LEVEL"

      - name: pip-audit - AI engine (activates once a pinned requirements.txt exists)
        if: ${{ hashFiles('geosuraksha-ai-engine/requirements*.txt') != '' }}
        run: |
          pip install --no-cache-dir pip-audit
          for f in geosuraksha-ai-engine/requirements*.txt; do
            pip-audit --no-deps --disable-pip -r "$f"
          done

      - name: Trivy filesystem scan (vulnerabilities, secrets, IaC misconfig)
        env:
          TRIVY_DB_REPOSITORY: public.ecr.aws/aquasecurity/trivy-db:2,ghcr.io/aquasecurity/trivy-db:2
        run: |
          mkdir -p "$HOME/.cache/trivy"
          docker run --rm \
            -e TRIVY_DB_REPOSITORY \
            -v "$PWD:/work:ro" -v "$HOME/.cache/trivy:/root/.cache/trivy" -w /work \
            "$TRIVY_IMAGE" fs \
            --scanners vuln,secret,misconfig \
            --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 \
            --skip-java-db-update --skip-dirs node_modules --skip-dirs .git \
            --format table .

  # ---------------------------------------------------------------------------
  backend-test:
    name: Backend build check + API smoke tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    services:
      mongo:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --quiet --eval 'db.runCommand({ping:1}).ok' || exit 1"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 12
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install (lockfile-exact)
        working-directory: backend
        run: npm ci --no-audit --no-fund

      - name: Syntax check all backend files
        working-directory: backend
        run: |
          set -euo pipefail
          find . -name '*.js' -not -path './node_modules/*' -print0 | xargs -0 -n1 node --check
          echo "Syntax OK"

      - name: Start API against ephemeral MongoDB and run smoke tests
        working-directory: backend
        env:
          MONGODB_URI: mongodb://127.0.0.1:27017/depthfence_ci
          PORT: "5000"
          GEMINI_API_KEY: ci-placeholder-not-a-real-key
        run: |
          set -euo pipefail
          JWT_SECRET="$(openssl rand -hex 32)"
          export JWT_SECRET
          nohup node server.js > "$RUNNER_TEMP/api.log" 2>&1 &
          echo $! > "$RUNNER_TEMP/api.pid"
          trap 'kill "$(cat "$RUNNER_TEMP/api.pid")" 2>/dev/null || true' EXIT
          if ! bash ../.github/scripts/checks.sh backend-smoke http://127.0.0.1:5000; then
            echo "---- API log ----"
            cat "$RUNNER_TEMP/api.log"
            exit 1
          fi

  # ---------------------------------------------------------------------------
  frontend-build:
    name: Frontend build verification
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install (lockfile-exact)
        working-directory: frontend
        run: npm ci --no-audit --no-fund

      - name: Build
        working-directory: frontend
        env:
          VITE_API_BASE_URL: http://localhost:5000 # build-only placeholder
        run: npm run build

      - name: Verify build output and that no secrets leaked into the bundle
        working-directory: frontend
        run: |
          set -euo pipefail
          test -s dist/index.html
          ls dist/assets/*.js > /dev/null
          if grep -rEl 'AIza[0-9A-Za-z_-]{30,}|mongodb(\+srv)?://[^"'"'"' /]+:[^"'"'"' @]+@|BEGIN (RSA |EC )?PRIVATE KEY' dist; then
            echo "::error::Possible secret found in built frontend bundle"
            exit 1
          fi
          echo "Build verified"

      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 7

  # ---------------------------------------------------------------------------
  quality-gate:
    name: Security & quality gate
    if: ${{ always() }}
    needs: [validate, secret-scan, sast, dependency-scan, backend-test, frontend-build]
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Require every upstream job to pass
        env:
          RESULTS: ${{ join(needs.*.result, ' ') }}
        run: |
          echo "Upstream results: $RESULTS"
          for r in $RESULTS; do
            if [ "$r" != "success" ]; then
              echo "::error::Quality gate failed - a mandatory job did not succeed"
              exit 1
            fi
          done
          echo "All gates passed"

  # ---------------------------------------------------------------------------
  deploy-staging:
    name: Deploy preview (Vercel)
    needs: [quality-gate]
    if: ${{ (github.event_name == 'push' || github.event_name == 'workflow_dispatch') && github.ref == 'refs/heads/main' && vars.DEPLOY_ENABLED == 'true' }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment:
      name: staging
    concurrency:
      group: deploy-staging
      cancel-in-progress: false
    outputs:
      url: ${{ steps.deploy.outputs.url }}
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Check deploy secrets are configured
        run: |
          for v in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
            if [ -z "${!v}" ]; then echo "::error::Secret $v is not set"; exit 1; fi
          done

      - name: Deploy preview
        id: deploy
        run: |
          set -euo pipefail
          npx --yes "vercel@${VERCEL_CLI_VERSION}" deploy --yes \
            > "$RUNNER_TEMP/url.txt" 2> "$RUNNER_TEMP/vercel.log" \
            || { cat "$RUNNER_TEMP/vercel.log"; exit 1; }
          url="$(tail -n1 "$RUNNER_TEMP/url.txt")"
          [[ "$url" =~ ^https://[A-Za-z0-9.-]+\.vercel\.app$ ]] || { echo "::error::Unexpected deploy URL"; exit 1; }
          echo "url=$url" >> "$GITHUB_OUTPUT"

      - name: Post-deploy health check
        run: bash .github/scripts/checks.sh deployed-health "${{ steps.deploy.outputs.url }}"

  # ---------------------------------------------------------------------------
  deploy-production:
    name: Deploy production (Vercel) - requires approval
    needs: [deploy-staging]
    if: ${{ (github.event_name == 'push' || github.event_name == 'workflow_dispatch') && github.ref == 'refs/heads/main' && vars.DEPLOY_ENABLED == 'true' }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment:
      name: production # configure Required reviewers on this environment
      url: ${{ steps.deploy.outputs.url }}
    concurrency:
      group: deploy-production
      cancel-in-progress: false
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Deploy to production
        id: deploy
        run: |
          set -euo pipefail
          npx --yes "vercel@${VERCEL_CLI_VERSION}" deploy --prod --yes \
            > "$RUNNER_TEMP/url.txt" 2> "$RUNNER_TEMP/vercel.log" \
            || { cat "$RUNNER_TEMP/vercel.log"; exit 1; }
          url="$(tail -n1 "$RUNNER_TEMP/url.txt")"
          [[ "$url" =~ ^https://[A-Za-z0-9.-]+\.vercel\.app$ ]] || { echo "::error::Unexpected deploy URL"; exit 1; }
          echo "url=$url" >> "$GITHUB_OUTPUT"

      - name: Post-deploy health check (deployment URL)
        run: bash .github/scripts/checks.sh deployed-health "${{ steps.deploy.outputs.url }}"

      - name: DNS / HTTPS / certificate checks (only if PRODUCTION_URL is set)
        if: ${{ vars.PRODUCTION_URL != '' }}
        env:
          PRODUCTION_URL: ${{ vars.PRODUCTION_URL }}
        run: |
          bash .github/scripts/checks.sh domain "$PRODUCTION_URL"
          bash .github/scripts/checks.sh deployed-health "$PRODUCTION_URL"