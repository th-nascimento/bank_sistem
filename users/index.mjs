// External Modules
import express, { urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Own Modules
import tool from "../modules/tool_modules.mjs";
import db from "../data_base/db-system.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../views");

/* const handlerAuthLogin = (req, res, next) => {
  tool
    .validationLogin(req.body)
    .then((authRes) => {
      if (authRes.userName && authRes.password) {
        console.log(`${authRes.currentUser} está logado!\n`);
        return res.sendFile(`${basePath}/user-area.html`);
      } else if (authRes.userName && !authRes.password) {
        console.log("Senha incorreta!\n");
        return res.sendFile(`${basePath}/login-page.html`);
      } else {
        console.log("Usuário não existe!\n");
        return res.sendFile(`${basePath}/login-page.html`);
      }
    })
    .catch((error) => {
      tool.errorTreatment("validationLogin", error);
    });

  next();
}; */

router.get("/login", (req, res) => {
  res.sendFile(`${basePath}/login-page.html`);
});
/* 
router.post("/user-loggedin", (req, res) => {
  res.json(req.body);
}); */

router.get("/registerUser", (req, res) => {
  const data = db.get();
  console.log(data);
  res.sendFile(`${basePath}/register-user.html`);
});

router.post("/registerUser", (req, res) => {
  console.log(req.body);
  db.register(
    req.body.userName,
    req.body.password,
    req.body.fullName,
    req.body.birthDate
  );

  res.sendFile(`${basePath}/register-user.html`);
});

export default router;
