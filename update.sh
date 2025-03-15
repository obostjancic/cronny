# Store the hash of package.json and yarn.lock before pulling
OLD_PACKAGE_HASH=$(md5sum package.json yarn.lock 2>/dev/null || echo "none")

# Pull and capture output
PULL_OUTPUT=$(git pull)

# Check if there were any changes
if [ "$PULL_OUTPUT" = "Already up to date." ]; then
    echo "🔄 No changes to pull, exiting..."
    exit 0
fi

# Check if package files changed
NEW_PACKAGE_HASH=$(md5sum package.json yarn.lock 2>/dev/null || echo "none")

if [ "$OLD_PACKAGE_HASH" != "$NEW_PACKAGE_HASH" ]; then
    echo "📦 Dependencies changed, installing packages..."
    yarn install --frozen-lockfile
else
    echo "📦 Dependencies unchanged, skipping install"
fi

echo "🧪 Running tests..."
yarn test --run || exit 1

echo "🏗️ Building..."
yarn build

echo "🔄 Restarting service..."
pm2 restart cronny