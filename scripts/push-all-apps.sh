#!/bin/bash
# Push all zos-apps repo changes to GitHub
#
# Usage: ./scripts/push-all-apps.sh

set -e

APPS_DIR="/Users/z/work/zeekay/zos-apps"
SKIP_DIRS="node_modules docs test-results playwright-report scripts tests .git .turbo"

echo "🚀 Pushing updates to all zos-apps repos..."
echo ""

count=0
for app_dir in "$APPS_DIR"/*/; do
  app_name=$(basename "$app_dir")

  # Skip non-app directories
  if echo "$SKIP_DIRS" | grep -qw "$app_name"; then
    continue
  fi

  # Check if it's a git repo
  if [ ! -d "$app_dir/.git" ]; then
    continue
  fi

  cd "$app_dir"

  # Check if there are changes
  if git diff --quiet && git diff --cached --quiet; then
    echo "⏭️  $app_name - no changes"
    continue
  fi

  # Stage, commit, and push
  git add -A
  git commit -m "$(cat <<'EOF'
feat: add App Store metadata and screenshots

- Add screenshots config for App Store gallery
- Add downloads, tags, featured fields
- Add support and changelog links
- Create screenshots directory
EOF
)" || true

  git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "  ⚠️  Push failed for $app_name"

  echo "✅ $app_name"
  ((count++))
done

echo ""
echo "✨ Done! Pushed $count apps"
