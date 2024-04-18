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
import tool from "./modules/tool_modules.mjs";
import oper from "./modules/operation_modules.mjs";
import access from "./modules/access_modules.mjs";

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
  await access
    .login(homeInitialization)
    .then((userLoging) => {
      tool
        .validationLogin(userLoging)
        .then((content) => {
          if (content.userName && !content.password) {
            console.log("Senha incorreta!");
            homeInitialization();
            return;
          } else {
            currentUserLogged = content.currentUser;
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
    access
      .logout()
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
