git pull
yarn install --frozen-lockfile
yarn test --run
yarn build
pm2 restart cronny