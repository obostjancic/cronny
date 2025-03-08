git pull
yarn install --frozen-lockfile
yarn test --run || exit 1
yarn build
pm2 restart cronny