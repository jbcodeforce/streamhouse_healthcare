#!/usr/bin/env bash
# Helper wrapper for IaC/ccloud terraform
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}/IaC/ccloud"
terraform "$@"
