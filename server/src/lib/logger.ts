import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino(
  {
    level: isDev ? "debug" : "info",
    redact: ["req.headers.authorization", "body.password"],
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      })
    : undefined
);

export default logger;
