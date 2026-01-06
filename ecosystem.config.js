module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "run start",
      cwd: "/projects/corretor-de-imoveis",
      env_file: ".env",
    },
  ],
};
