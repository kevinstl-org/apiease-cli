#!/usr/bin/env bash

set -euo pipefail

script_directory_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_directory_path="$(cd "${script_directory_path}/.." && pwd)"

cd "${project_directory_path}"
npm run test
