// =============================================================================
// DepthFence CI/CD - Declarative Jenkins Pipeline  (SINGLE FILE, no helper files)
//
// Stack  : Node/Express API (backend/) + React/Vite UI (frontend/)
// Deploy : Vercel - OFF by default (tick DEPLOY). Production needs your approval.
//
// SERVER REQUIREMENTS: Linux, Docker, user "jenkins" in group "docker",
//                      plugins Pipeline + Git + Credentials Binding.
//
// PLACEHOLDERS (only for deploy) - Jenkins > Credentials > "Secret text":
//     vercel-token, vercel-org-id, vercel-project-id
// App runtime secrets (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, ADMIN_EMAIL,
// ADMIN_PASSWORD, EMAIL_USER, EMAIL_APP_PASSWORD, VITE_API_BASE_URL) belong in
// the Vercel project settings, never in the repo.
//
// Every scan/test runs even if an earlier one fails, so ONE build shows ALL
// problems. The build still ends FAILED, and deploy is blocked, if any gate fails.
// =============================================================================

// Run a command in a throwaway Node container against the workspace.
def nodeRun(String dir, String cmd, String extra = '') {
    withEnv(["N_DIR=${dir}", "N_CMD=${cmd}", "N_EXTRA=${extra}"]) {
        sh '''
            docker run --rm -u "$(id -u):$(id -g)" \
              -e HOME=/tmp -e npm_config_cache=/tmp/.npm -e CI=true \
              $N_EXTRA \
              -v "$WORKSPACE:/ws" -w "/ws/$N_DIR" node:22 bash -ec "$N_CMD"
        '''
    }
}

// Mark the stage + build FAILED on error but keep the pipeline going.
def gate(Closure body) {
    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') { body() }
}

pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: false,
                     description: 'Deploy to Vercel after ALL gates pass (main branch only)')
        string(name: 'PRODUCTION_URL', defaultValue: '',
               description: 'PLACEHOLDER e.g. https://your-domain.com (enables DNS/HTTPS/cert checks)')
    }

    environment {
        AUDIT_LEVEL = 'high'
        MONGO_NAME  = "mongo-ci-${BUILD_NUMBER}"
    }

    stages {

        stage('Preflight') {
            steps {
                sh '''
                    if ! docker info >/dev/null 2>&1; then
                      echo "ERROR: Jenkins cannot use Docker."
                      echo "Fix on the server:  sudo usermod -aG docker jenkins && sudo systemctl restart jenkins"
                      exit 1
                    fi
                    docker --version
                    test -f backend/package-lock.json  || { echo "ERROR: backend/package-lock.json missing";  exit 1; }
                    test -f frontend/package-lock.json || { echo "ERROR: frontend/package-lock.json missing"; exit 1; }
                '''
            }
        }

        stage('Validate') {
            steps {
                gate {
                    nodeRun('.', '''
                        for f in package.json backend/package.json frontend/package.json vercel.json frontend/vercel.json; do
                          node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))"
                          echo "valid JSON: $f"
                        done
                        for d in . backend frontend; do
                          npx --yes lockfile-lint@4.14.0 --path "$d/package-lock.json" --type npm \
                            --allowed-hosts npm --validate-https --validate-integrity
                        done
                        for d in backend frontend; do
                          (cd "$d" && npm ci --dry-run --ignore-scripts --no-audit --no-fund)
                        done
                    ''')
                }
            }
        }

        stage('Security scans') {
            parallel {

                stage('Secrets - Gitleaks') {
                    steps {
                        gate {
                            sh '''
                                T="${WORKSPACE_TMP:-/tmp}"; mkdir -p "$T"
                                cat > "$T/gl.toml" <<'EOF'
title = "ci"
[extend]
useDefault = true
[allowlist]
paths = ["package-lock[.]json$", "node_modules/"]
EOF
                                docker run --rm -v "$WORKSPACE:/repo:ro" -v "$T/gl.toml:/gl.toml:ro" \
                                  -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/repo \
                                  zricethezav/gitleaks:v8.18.4 detect --source /repo --config /gl.toml \
                                  --redact --no-banner --exit-code 1
                            '''
                        }
                    }
                }

                stage('SAST - Semgrep') {
                    steps {
                        gate {
                            sh '''
                                docker run --rm -e SEMGREP_SEND_METRICS=off -v "$WORKSPACE:/src:ro" -w /src \
                                  semgrep/semgrep:1.97.0 \
                                  semgrep scan --metrics=off --error --severity ERROR \
                                    --config p/default --config p/javascript --config p/nodejsscan \
                                    --config p/jwt --config p/react --config p/secrets \
                                    --exclude node_modules --exclude dist --exclude package-lock.json \
                                    --exclude "*.pt" --exclude "*.pyc" .
                            '''
                        }
                    }
                }

                stage('Dependencies - npm audit') {
                    steps {
                        gate { nodeRun('backend',  'npm audit --omit=dev --audit-level="$AUDIT_LEVEL"', '-e AUDIT_LEVEL') }
                        gate { nodeRun('frontend', 'npm audit --omit=dev --audit-level="$AUDIT_LEVEL"', '-e AUDIT_LEVEL') }
                    }
                }

                stage('Trivy - vulns, secrets, IaC') {
                    steps {
                        gate {
                            sh '''
                                docker run --rm \
                                  -e TRIVY_DB_REPOSITORY=public.ecr.aws/aquasecurity/trivy-db:2,ghcr.io/aquasecurity/trivy-db:2 \
                                  -v "$WORKSPACE:/work:ro" -v trivy-cache:/root/.cache/trivy -w /work \
                                  aquasec/trivy:0.58.1 fs --timeout 10m \
                                  --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --ignore-unfixed \
                                  --exit-code 1 --skip-dirs node_modules --skip-dirs .git --format table .
                            '''
                        }
                    }
                }
            }
        }

        stage('Backend build + API tests') {
            steps {
                gate {
                    sh '''
                        docker rm -f "$MONGO_NAME" >/dev/null 2>&1 || true
                        docker run -d --name "$MONGO_NAME" -p 127.0.0.1:27018:27017 mongo:7.0 >/dev/null
                        for i in $(seq 1 30); do
                          docker exec "$MONGO_NAME" mongosh --quiet --eval 'db.runCommand({ping:1}).ok' >/dev/null 2>&1 && exit 0
                          sleep 2
                        done
                        echo "MongoDB did not become ready"; exit 1
                    '''
                    nodeRun('backend', '''
                        npm ci --no-audit --no-fund
                        find . -name "*.js" -not -path "./node_modules/*" -print0 | xargs -0 -n1 node --check
                        export MONGODB_URI=mongodb://127.0.0.1:27018/depthfence_ci
                        export PORT=5055 GEMINI_API_KEY=ci-placeholder-not-a-real-key
                        export JWT_SECRET="$(openssl rand -hex 32)"
                        node server.js > /tmp/api.log 2>&1 &
                        API_PID=$!
                        trap 'kill $API_PID 2>/dev/null || true' EXIT
                        B=http://127.0.0.1:5055
                        fail() { echo "FAIL: $*"; echo "---- API log ----"; cat /tmp/api.log; exit 1; }
                        code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
                        for i in $(seq 1 40); do curl -fsS $B/ >/dev/null 2>&1 && break; sleep 3; done
                        curl -fsS $B/ | grep -q Online                          || fail "health endpoint"
                        curl -fsS $B/api/anomalies >/dev/null                   || fail "/api/anomalies"
                        curl -fsS $B/api/gis/overview-layers >/dev/null         || fail "/api/gis/overview-layers"
                        [ "$(code $B/api/auth/me)" = 401 ]                      || fail "auth/me must be 401 without token"
                        [ "$(code $B/api/admin/employees/pending)" = 401 ]      || fail "admin route must be 401 without token"
                        [ "$(code -H "Authorization: Bearer x.y.z" $B/api/admin/employees/active)" = 401 ] || fail "forged token accepted"
                        [ "$(code $B/api/elevation)" = 400 ]                    || fail "elevation must be 400 without params"
                        echo "Backend tests passed"
                    ''', '--network host')
                }
            }
            post {
                always { sh 'docker rm -f "$MONGO_NAME" >/dev/null 2>&1 || true' }
            }
        }

        stage('Frontend build') {
            steps {
                gate {
                    nodeRun('frontend', '''
                        npm ci --no-audit --no-fund
                        VITE_API_BASE_URL=http://localhost:5000 npm run build
                        test -s dist/index.html
                        ls dist/assets/*.js >/dev/null
                        if grep -rEl 'AIza[0-9A-Za-z_-]{30,}|BEGIN (RSA |EC )?PRIVATE KEY|mongodb[+a-z]*:[/][/][^/ ]+:[^@ ]+@' dist; then
                          echo "Possible secret in built bundle"; exit 1
                        fi
                        echo "Build verified"
                    ''')
                }
            }
            post {
                success { archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true }
            }
        }

        stage('Deploy preview') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    expression { env.GIT_BRANCH in ['origin/main', 'main'] }
                    expression { currentBuild.currentResult == 'SUCCESS' }
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-token',      variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'vercel-org-id',     variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'vercel-project-id', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    nodeRun('.', '''
                        npx --yes vercel@latest deploy --yes > /tmp/url.txt 2> /tmp/vercel.log || { cat /tmp/vercel.log; exit 1; }
                        url="$(tail -n1 /tmp/url.txt)"
                        echo "$url" | grep -Eq '^https://[A-Za-z0-9.-]+[.]vercel[.]app$' || { echo "Unexpected deploy URL"; exit 1; }
                        for i in $(seq 1 20); do curl -fsS "$url/" >/dev/null 2>&1 && break; sleep 3; done
                        curl -fsS "$url/" >/dev/null || { echo "Preview health check failed"; exit 1; }
                        echo "Preview healthy: $url"
                    ''', '-e VERCEL_TOKEN -e VERCEL_ORG_ID -e VERCEL_PROJECT_ID')
                }
            }
        }

        stage('Approve production') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    expression { env.GIT_BRANCH in ['origin/main', 'main'] }
                    expression { currentBuild.currentResult == 'SUCCESS' }
                }
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Preview passed. Deploy to PRODUCTION?', ok: 'Deploy to production'
                }
            }
        }

        stage('Deploy production') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    expression { env.GIT_BRANCH in ['origin/main', 'main'] }
                    expression { currentBuild.currentResult == 'SUCCESS' }
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-token',      variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'vercel-org-id',     variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'vercel-project-id', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    withEnv(["PROD_URL=${params.PRODUCTION_URL}"]) {
                        nodeRun('.', '''
                            npx --yes vercel@latest deploy --prod --yes > /tmp/url.txt 2> /tmp/vercel.log || { cat /tmp/vercel.log; exit 1; }
                            url="$(tail -n1 /tmp/url.txt)"
                            echo "$url" | grep -Eq '^https://[A-Za-z0-9.-]+[.]vercel[.]app$' || { echo "Unexpected deploy URL"; exit 1; }
                            for i in $(seq 1 20); do curl -fsS "$url/" >/dev/null 2>&1 && break; sleep 3; done
                            curl -fsS "$url/" >/dev/null || { echo "Production health check failed"; exit 1; }
                            echo "Production healthy: $url"
                            if [ -n "$PROD_URL" ]; then
                              host="$(echo "$PROD_URL" | sed -E 's#^https://##; s#/.*$##')"
                              case "$PROD_URL" in https://*) ;; *) echo "PRODUCTION_URL must start with https://"; exit 1;; esac
                              getent hosts "$host" >/dev/null || { echo "DNS: $host does not resolve"; exit 1; }
                              curl -fsS --proto =https --tlsv1.2 -o /dev/null "https://$host/" || { echo "HTTPS check failed"; exit 1; }
                              echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null \
                                | openssl x509 -noout -checkend 1209600 >/dev/null || { echo "TLS cert invalid or expires within 14 days"; exit 1; }
                              echo "DNS / HTTPS / certificate OK for $host"
                            fi
                        ''', '-e VERCEL_TOKEN -e VERCEL_ORG_ID -e VERCEL_PROJECT_ID -e PROD_URL')
                    }
                }
            }
        }
    }

    post {
        success { echo 'All security gates, tests and build checks passed.' }
        failure { echo 'FAILED - open the stages marked red; each one is an independent finding.' }
        cleanup { sh 'docker rm -f "$MONGO_NAME" >/dev/null 2>&1 || true' }
    }
}