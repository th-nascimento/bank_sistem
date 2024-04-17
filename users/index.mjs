// External Modules
import express, { urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Own Modules
import tool from "../modules/tool_modules.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../views");

router.get("/login", (req, res) => {
  res.sendFile(`${basePath}/login_page.html`);
});

router.post("/auth_user", (req, res) => {
  console.log(typeof req.body);

  tool
    .validationLogin(req.body)
    .then((authRes) => {
      if (authRes.userName && authRes.password) {
        console.log(`${authRes.currentUser} está logado!\n`);
        return;
      } else if (authRes.userName && !authRes.password) {
        console.log("Senha incorreta!\n");
        return;
      } else {
        console.log("Usuário não existe!\n");
        return;
      }
    })
    .catch((error) => {
      tool.errorTreatment("validationLogin", error);
    });

  res.sendFile(`${basePath}/login_page.html`);
});

export default router;
