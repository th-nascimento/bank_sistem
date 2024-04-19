// External Modules
import express, { urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Own Modules
import users from "./users/index.mjs";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "views");
const PORT = 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static(basePath));
app.use(
  "/users/scripts",
  express.static("D:/Programação/bank_sistem/views/scripts")
);

//app.use(express.json());

app.use("/users", users);

app.get("/", (req, res) => {
  res.sendFile(`${basePath}/index.mjs`);
});

app.listen(PORT, () => {
  console.log(`BANK SYSTEM Servidor is working on ${PORT} gate.`);
});
