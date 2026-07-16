import express from "express";

const app = express();
app.use(express.json());

const SECRET = process.env.BRIDGE_SECRET || "";
let queue = [];
let lastSeen = 0;

function checkAuth(req, res) {
  if (SECRET && req.query.secret !== SECRET && req.headers["x-secret"] !== SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

app.get("/", (_req, res) => res.json({ ok: true }));

app.post("/toy-next", (req, res) => {
  if (!checkAuth(req, res)) return;
  queue.push(req.body);
  res.json({ ok: true, queued: queue.length });
});

app.get("/toy-next", (req, res) => {
  if (!checkAuth(req, res)) return;
  lastSeen = Date.now();
  const cmd = queue.shift() || null;
  res.json({ cmd });
});

app.get("/status", (req, res) => {
  if (!checkAuth(req, res)) return;
  res.json({ online: Date.now() - lastSeen < 5000, pending: queue.length });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`svakom bridge listening on 0.0.0.0:${port}`);
});
