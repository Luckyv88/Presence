import basicAuth from "express-basic-auth";

export const swaggerAuth = basicAuth({
  users: {
    [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS,
  },
  challenge: true, 
});
