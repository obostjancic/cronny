module.exports = {
  apps: [
    {
      name: "cronny",
      script: "node",
      args: "--env-file=.env dist/index.js",
      cwd: "/home/deployments/cronny/packages/server",
      interpreter: "none",
    },
  ],
};
