#!/bin/bash

# Build script for esmx project
# Description: Builds packages and examples, then copies build artifacts to dist directory
# Usage: ./build.sh
# Prerequisites: pnpm must be installed

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed. Please install pnpm first."
        exit 1
    fi
}

# Clean and prepare environment
clean_environment() {
    log_info "Cleaning previous build artifacts..."
    rm -rf dist node_modules
}

# Install dependencies and build packages
build_packages() {
    log_info "Installing dependencies..."
    pnpm i
    
    log_info "Building packages..."
    pnpm build:packages
}

# Build examples (requires dependency refresh after packages build)
# Explanation: Examples depend on local packages via "workspace:*" protocol.
# After packages build, we need to refresh node_modules to link to the latest build artifacts.
build_examples() {
    log_info "Refreshing dependencies to link latest package builds..."
    rm -rf node_modules
    pnpm i
    
    log_info "Building examples..."
    pnpm build:examples
}

# Copy build artifacts to distribution directory
copy_artifacts() {
    local src_base="examples"
    local target_base="dist"
    
    log_info "Copying build artifacts..."
    
    # Copy SSR examples and docs
    for src_dir in "$src_base"/ssr-*/dist/client "$src_base"/docs/dist/client; do
        if [ -d "$src_dir" ]; then
            if [ "$src_dir" = "$src_base/docs/dist/client" ]; then
                target_dir="$target_base"
            else
                # Extract SSR project name from path
                ssr_part="${src_dir#$src_base/}"
                ssr_part="${ssr_part%/dist/client}"
                target_dir="$target_base/$ssr_part"
            fi
            
            mkdir -p "$target_dir"
            cp -r "$src_dir"/* "$target_dir"
            log_info "Copied $src_dir/* to $target_dir"
        fi
    done
    
    # Copy sitemap.xml if exists
    if [ -f "$src_base/docs/doc_build/sitemap.xml" ]; then
        cp "$src_base/docs/doc_build/sitemap.xml" "$target_base/sitemap.xml"
        log_info "Copied sitemap.xml to $target_base"
    else
        log_warn "sitemap.xml not found at $src_base/docs/doc_build/sitemap.xml"
    fi
}

# Main execution
main() {
    log_info "Starting build process..."
    
    check_prerequisites
    clean_environment
    build_packages
    build_examples
    copy_artifacts
    
    log_info "Build completed successfully!"
}

# Execute main function
main "$@"
