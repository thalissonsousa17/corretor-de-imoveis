module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "run start -- -p 4000",
      cwd: "/projects/corretor-de-imoveis",
      env_file: ".env",
    },
  ],
};
