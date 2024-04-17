// BANK SYSTEM SIMULATION

// *** MAKE IT SIMPLE! ***
console.log(
  chalk.bgBlue.bold("----------------> MAKE IT SIMPLE! <----------------")
);
console.log(
  chalk.bgBlue.bold("---------------->     RIGHT?!     <----------------")
);

// External Modules
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";

// Own Modules
import tool from "./tool_modules.mjs";
import oper from "./operation_modules.mjs";

console.log("Seja Bem-vindo!");

let currentUserLogged = "";

homeInitialization();

// INICIALIZAÇÃO DA OPERAÇÃO
/**
 * Initializes the home screen by prompting the user with options like opening an account, logging in, or logging out.
 */
function homeInitialization() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "homeOptions",
        message: "O que deseja:",
        choices: ["Abrir conta", "Fazer login", "Encerrar sessão"],
      },
    ])
    .then((answer) => {
      if (answer.homeOptions === "Encerrar sessão") {
        tool.breakOper(homeInitialization);
      } else if (answer.homeOptions === "Abrir conta") {
        oper.openAccount(homeInitialization);
      } else {
        operation();
      }
    });
}

/**
 * Performs the operation, which includes logging in, validating login credentials, handling login errors,
 * performing operations after successful login, and then logging out after a certain period of time.
 */
async function operation() {
  await login()
    .then((userLoging) => {
      validationLogin(userLoging)
        .then((content) => {
          if (content.userName && !content.password) {
            console.log("Senha incorreta!");
            homeInitialization();
            return;
          } else {
            console.log("Usuário Logado: ", currentUserLogged);
            console.log("Login realizado com sucesso!");
          }

          operationOptions();
        })
        .catch((error) => {
          tool.errorTreatment("validationLogin", error);
        });
    })
    .catch((error) => {
      tool.errorTreatment("login", error);
    });

  setTimeout(() => {
    logout()
      .then((folderName) => {
        fs.unlinkSync(
          `./${folderName.name}/currentUserLogged.json`,
          (error) => {
            if (error) {
              console.log("Erro ao deslogar!");
              tool.errorTreatment("logout", error);
              return;
            }
          }
        );

        fs.rmdirSync(`./${folderName.name}`);

        //console.log("Arquivo de login deletado com sucesso!");
        return;
      })
      .catch((error) => {
        tool.errorTreatment("logout", error);
      });
  }, 3 * 1000);
}

// HOME OPERATION - LOGIN
function login() {
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
              homeInitialization();
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
}

// HOME OPERATION - LOGOUT
function logout() {
  return new Promise((resolve, reject) => {
    let folderName = tool.fetchFile("./", "temp_");

    resolve(folderName);
  });
}

// HOME OPERATION - OPÇÕES INICIAIS
function operationOptions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "operation",
        message: "O que deseja fazer:",
        choices: [
          "Ativar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Transferência entre Contas",
          "Transferência para Terceiros",
          "Desativar conta",
          "Excluir conta",
          "Menu Principal",
        ],
      },
    ])
    .then((answer) => {
      let choice = answer.operation;

      switch (choice) {
        case "Ativar conta":
          oper.activeAccount(currentUserLogged, operationOptions);
          break;

        case "Consultar saldo":
          oper.showBalance(currentUserLogged, operationOptions);
          break;

        case "Depositar":
          oper.deposit(currentUserLogged, operationOptions);
          break;

        case "Sacar":
          oper.withdraw(currentUserLogged, operationOptions);
          break;

        case "Transferência entre Contas":
          oper.transferBtwAccounts(currentUserLogged, operationOptions);
          break;

        case "Transferência para Terceiros":
          oper.transferToThird(operationOptions);
          break;

        case "Desativar conta":
          oper.deactiveAccount(currentUserLogged, operationOptions);
          break;

        case "Excluir conta":
          oper.closeAccount(homeInitialization);
          break;

        default:
          currentUserLogged = "";
          homeInitialization();
          break;
      }
    })
    .catch((error) => {
      tool.errorTreatment("operationOptions", error);
    });
}

// HOME OPERATION - VALIDAÇÃO DE LOGIN
function validationLogin(currentUserInfo) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync("./temp_userLogged", { recursive: true }, (error) => {
      if (error) {
        tool.errorTreatment("validationLogin.fs.mkdir", error);
      }
    });

    fs.writeFileSync(
      `./temp_userLogged/currentUserLogged.json`,
      `{"userName":"${currentUserInfo.userName}","password":"${currentUserInfo.password}"}`,
      (error) => {
        if (error) {
          tool.errorTreatment("validationLogin.fs.writeFile", error);
        }
      }
    );

    async function comparison() {
      let resultComparison = {
        userName: false,
        password: false,
      };

      let currentUserLoggedData = await JSON.parse(
        fs.readFileSync(
          `./temp_userLogged/currentUserLogged.json`,
          "utf-8",
          (error, data) => {
            if (error) {
              tool.errorTreatment("validationLogin.fs.readFileSync", error);
            }

            return data;
          }
        )
      );

      let userInDBData = await tool
        .fetchFile("./data_base/accounts/", `${currentUserInfo.userName}.json`)
        .then((infoFile) => {
          let dataFile = "";

          return (dataFile = JSON.parse(
            fs.readFileSync(infoFile.path, "utf-8", (error, data) => {
              if (error) {
                tool.errorTreatment(
                  "validationLogin/userInDBData.fs.readFileSync",
                  error
                );
              }

              return data;
            })
          ));
        });

      if (currentUserLoggedData.userName === userInDBData.userName) {
        resultComparison.userName = true;
        currentUserLogged = currentUserLoggedData.userName;
      }

      if (currentUserLoggedData.password === userInDBData.password) {
        resultComparison.password = true;
      }

      return resultComparison;
    }

    resolve(comparison());

    reject();
  });
}
