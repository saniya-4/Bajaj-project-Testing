require("dotenv").config();
const express = require("express");
const cors = require("cors");
const aiRoute = require("./routes/ai.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());   // ✅ HANDLE PREFLIGHT EXPLICITLY

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/", aiRoute);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});