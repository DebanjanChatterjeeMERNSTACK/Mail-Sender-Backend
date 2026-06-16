const express = require("express");
const app = express();
const cors = require("cors");
require("./db/db");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const Register = require("./routes/registerRoutes");
const Templete = require("./routes/templeteRoutes");

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "https://egeventsplanner.in",
    "https://www.egeventsplanner.in",
    "https://mail-sender-psjx.onrender.com",
    "https://www.mail-sender-psjx.onrender.com",
    "http://localhost:5173",
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use(cors(corsOptions));

app.use(express.json());

app.use("/upload", express.static("src/pdf"));

app.use("/api/v1", Register);
app.use("/api/v1", Templete);

app.listen(PORT, () => {
  console.log(`Server Connected on port ${PORT}`);
});
