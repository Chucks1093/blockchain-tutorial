import express from "express";
import automationRouter from "./automation/automation.router";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import { config } from "./config";
import helmet from "helmet";

const app = express();

// Middlewares
app.use(
	cors({
		origin: config.allowedOrigins,
		credentials: true,
	})
);

app.use(helmet());

app.use(morgan("combined"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Endpoints
app.use("/api/automation", automationRouter);

app.get("/test", (_, res) => {
	const filePath = path.join(
		__dirname,
		"..",
		"coverage",
		"lcov-report",
		"index.html"
	);
	res.sendFile(filePath);
});

export default app;
