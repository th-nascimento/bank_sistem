// External Modules
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import path from "path";

// Own Modules
import tool from "./tool_modules.mjs";

const access = {
  login: (callback) => {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "input",
            name: "userName",
            message: "Nome de usuário: ",
          },
          {
            type: "password",
            name: "password",
            mask: "*",
            message: "Digite sua senha: ",
          },
        ])
        .then((loginInfo) => {
          tool
            .fetchFile("./data_base/accounts/", `${loginInfo.userName}.json`)
            .then((result) => {
              if (!result) {
                console.log("Usuário não existe!");
                callback();
                return;
              } else {
                resolve(loginInfo);
              }
            })
            .catch((error) => {
              tool.errorTreatment("Login/userExist.fetchFile", error);
            });
        })
        .catch(() => {
          reject();
        });
    });
  },

  logout: () => {
    return new Promise((resolve, reject) => {
      let folderName = tool.fetchFile("./", "temp_");

      resolve(folderName);
    });
  },
};

export default access;
