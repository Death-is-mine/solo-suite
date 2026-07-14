param(
  [ValidateSet("docker","fly")]
  [string]$Target = "docker",
  [string]$Version = "alpha"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

function Deploy-Docker {
  $tag = "solo-suite:$Version-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Write-Step "Building Docker image: $tag"
  docker build -t $tag .
  if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
  docker tag $tag solo-suite:latest
  Write-Step "Starting container on port 3000"
  docker compose up -d --build
  Write-Step "Done. Container logs: docker compose logs -f"
}

function Deploy-Fly {
  Write-Step "Deploying to Fly.io"
  flyctl deploy --local-only --strategy rolling
  Write-Step "Done. App URL: https://solo-suite.fly.dev"
}

switch ($Target) {
  "docker" { Deploy-Docker }
  "fly" { Deploy-Fly }
}
