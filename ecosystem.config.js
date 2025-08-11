module.exports = {
  apps: [
    {
      name: "cronny",
      script: "packages/server/dist/index.js",
      cwd: "/home/deployments/cronny",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
