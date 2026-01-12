import express, { type Request, Response } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import net from "net";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function findAvailablePort(
  startPort: number,
  host: string | undefined,
  maxTries = 20
): Promise<number> {
  for (let port = startPort; port < startPort + maxTries; port += 1) {
    const isAvailable = await new Promise<boolean>((resolve, reject) => {
      const tester = net
        .createServer()
        .once("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            resolve(false);
            return;
          }

          reject(err);
        })
        .once("listening", () => {
          tester.close(() => resolve(true));
        });

      tester.listen(port, host);
    });

    if (isAvailable) {
      return port;
    }
  }

  throw new Error(`No available ports found starting at ${startPort}.`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response) => {
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const basePort = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  const port = await findAvailablePort(basePort, host);
  httpServer.listen(port, host, () => {
    if (port !== basePort) {
      log(`port ${basePort} in use, switched to ${port}`);
    }
    log(`serving on port ${port}`);
  });
})();
