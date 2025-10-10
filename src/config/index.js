const config = {
  development: {
    baseUrl: "http://localhost:3000",
    apiPrefix: "/api",
  },
  production: {
    baseUrl: "https://api.yourdomain.com",
    apiPrefix: "/api",
  },
};

export default config[import.meta.env.MODE];
``