const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT;

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/tasks", require("./routes/task.routes"));

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
