import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { screenRouter } from "./api/routes/screen";
import { attestRouter } from "./api/routes/attest";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1", screenRouter);
app.use("/api/v1", attestRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ChainSentinel", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ChainSentinel API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});