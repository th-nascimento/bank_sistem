// MAKE IT SIMPLE!
// FAÇA ISSO DE FORMA SIMPLES!
console.log(
  chalk.bgBlue.bold("----------------> MAKE IT SIMPLE! <----------------")
);
console.log(
  chalk.bgBlue.bold("---------------->     RIGHT?!     <----------------")
);

import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import path from "path";

console.log("Seja Bem-vindo!");

let currentUserLoged = "";

homeInitialization();

// CORE APP - INICIALIZAÇÃO DA OPERAÇÃO
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
        breakOper(homeInitialization);
      } else if (answer.homeOptions === "Abrir conta") {
        openAccount(homeInitialization);
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
            console.log("Usuário Logado: ", currentUserLoged);
            console.log("Login realizado com sucesso!");
          }

          operationOptions();
        })
        .catch((error) => {
          errorTreatment("validationLogin", error);
        });
    })
    .catch((error) => {
      errorTreatment("login", error);
    });

  setTimeout(() => {
    logout()
      .then((folderName) => {
        fs.unlinkSync(`./${folderName.name}/currentUserLoged.json`, (error) => {
          if (error) {
            console.log("Erro ao deslogar!");
            errorTreatment("logout", error);
            return;
          }
        });

        fs.rmdirSync(`./${folderName.name}`);

        //console.log("Arquivo de login deletado com sucesso!");
        return;
      })
      .catch((error) => {
        errorTreatment("logout", error);
      });
  }, 3 * 1000);
}

// HOME.MJS
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
        fetchFile("./data_base/accounts/", `${loginInfo.userName}.json`)
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
            errorTreatment("Login/userExist.fetchFile", error);
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
    let folderName = fetchFile("./", "temp_");

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
          activeAccount(operationOptions);
          break;

        case "Consultar saldo":
          showBalance(operationOptions);
          break;

        case "Depositar":
          deposit(operationOptions);
          break;

        case "Sacar":
          withdraw(operationOptions);
          break;

        case "Transferência entre Contas":
          transferBtwAccounts(operationOptions);
          break;

        case "Transferência para Terceiros":
          transferToThird(operationOptions);
          break;

        case "Desativar conta":
          deactiveAccount(operationOptions);
          break;

        case "Excluir conta":
          closeAccount(homeInitialization);
          break;

        default:
          currentUserLoged = "";
          homeInitialization();
          break;
      }
    })
    .catch((error) => {
      errorTreatment("operationOptions", error);
    });
}

// OPERATION.JS
// OPERATION FUNCTIONS - VALIDAÇÃO DE LOGIN
function validationLogin(currentUserInfo) {
  // Criação de um arquivo temporário para comparação de dados no Banco de Dados
  return new Promise((resolve, reject) => {
    fs.mkdirSync("./temp_userLoged", { recursive: true }, (error) => {
      if (error) {
        errorTreatment("validationLogin.fs.mkdir", error);
      }
    });

    fs.writeFileSync(
      `./temp_userLoged/currentUserLoged.json`,
      `{"userName":"${currentUserInfo.userName}","password":"${currentUserInfo.password}"}`,
      (error) => {
        if (error) {
          errorTreatment("validationLogin.fs.writeFile", error);
        }
      }
    );

    async function comparison() {
      let resultComparison = {
        userName: false,
        password: false,
      };

      let currentUserLogedData = await JSON.parse(
        fs.readFileSync(
          `./temp_userLoged/currentUserLoged.json`,
          "utf-8",
          (error, data) => {
            if (error) {
              errorTreatment("validationLogin.fs.readFileSync", error);
            }

            return data;
          }
        )
      );

      let userInDBData = await fetchFile(
        "./data_base/accounts/",
        `${currentUserInfo.userName}.json`
      ).then((infoFile) => {
        let dataFile = "";

        return (dataFile = JSON.parse(
          fs.readFileSync(infoFile.path, "utf-8", (error, data) => {
            if (error) {
              errorTreatment(
                "validationLogin/userInDBData.fs.readFileSync",
                error
              );
            }

            return data;
          })
        ));
      });

      if (currentUserLogedData.userName === userInDBData.userName) {
        resultComparison.userName = true;
        currentUserLoged = currentUserLogedData.userName;
      }

      if (currentUserLogedData.password === userInDBData.password) {
        resultComparison.password = true;
      }

      return resultComparison;
    }

    resolve(comparison());

    reject();
  });
}

// OPERATION FUNCTIONS - ENCERRAR OPERAÇÃO
function breakOper(callback) {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "choice",
        message: "Confirma sair?",
      },
    ])
    .then((answer) => {
      if (answer.choice === true) {
        process.exit();
      } else {
        // Retornar para esta callback
        callback();
      }
    })
    .catch((error) => {
      errorTreatment("breakOper", error);
    });
}

// OPERATION FUNCTIONS - ABRIR CONTA
async function openAccount(callback) {
  try {
    let userCreated = await infoUserAccount();

    if (fs.existsSync(`./data_base/accounts/${userCreated.userName}.json`)) {
      console.log("Conta já existe!");
      callback();
      return;
    }

    fs.writeFileSync(
      `./data_base/accounts/${userCreated.userName}.json`,
      JSON.stringify(userCreated)
    );
    console.log(
      "Conta foi criada!\nAtive a conta-corrente e a conta-poupança."
    );
    callback();
  } catch (error) {
    errorTreatment("openAccount", error);
  }
}

// OPERATION FUNCTIONS - FECHAR CONTA
function closeAccount(callback) {
  return new Promise((resolve, reject) => {
    fetchUserAccount("Qual conta deseja excluir?").then((fileName) => {
      checkAccount(fileName).then((account) => {
        resolve(account);
        reject();
      });
    });
  })
    .then((resp) => {
      if (!fs.existsSync(`./data_base/accounts/${resp.userName}.json`)) {
        //console.log('Arquivo não existe!')
        callback();
        return;
      }

      fs.unlinkSync(`./data_base/accounts/${resp.userName}.json`);
      console.log("Esta conta foi encerrada:\n", resp);
      callback();
    })
    .catch((error) => {
      errorTreatment("closeAccount", error);
    });
}

async function activeAccount(callback) {
  try {
    const account = await checkAccount(currentUserLoged);

    let accountChoosen = await whichAccount();

    if (account[accountChoosen].status === false) {
      account[accountChoosen].status = true;

      if (accountChoosen === "savingsAccount") {
        account.savingsAccount.amount =
          account.savingsAccount.ownCapital + account.savingsAccount.equity;
      }

      fs.writeFileSync(
        `./data_base/accounts/${currentUserLoged}.json`,
        JSON.stringify(account)
      );

      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } foi ATIVADA com sucesso!\n`
      );
      callback();
      return;
    } else {
      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } já está ATIVADA!\n`
      );
      callback();
      return;
    }
  } catch (error) {
    errorTreatment("activeAccount", error);
  }
}

async function deactiveAccount(callback) {
  try {
    const account = await checkAccount(currentUserLoged);

    let accountChoosen = await whichAccount();
    
    switch (accountChoosen) {
      case 'checkingAccount':
        if (account.checkingAccount.balance > 0) {
          console.log(
            "Conta Corrente não pode ser DESATIVADA!\nSaque todo o saldo disponível antes desta operação.\n"
          );
          callback();
          return;
        } else if (account.checkingAccount.overdraft < 0) {
          console.log(
            "Conta Corrente não pode ser DESATIVADA!\nDeposite o valor utilizado do limite especial antes desta operação.\n"
          );
          callback();
          return;
        }
        break;
    
      default:
        if (
          account.savingsAccount.initialCapital > 0 ||
          account.savingsAccount.amount > 0
        ) {
          console.log(
            "Conta Poupança não pode ser DESATIVADA!\nSaque todo o saldo disponível antes desta operação.\n"
          );
          callback();
          return;
        }
        break;
    }

    if (account[accountChoosen].status === true) {
      account[accountChoosen].status = false;

      fs.writeFileSync(
        `./data_base/accounts/${currentUserLoged}.json`,
        JSON.stringify(account)
      );

      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } foi DESATIVADA com sucesso!\n`
      );
      callback();
      return;
    } else {
      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } já está DESATIVADA!\n`
      );
      callback();
      return;
    }
  } catch (error) {
    errorTreatment("deactiveAccount", error);
  }
}

// OPERATION FUNCTIONS - MOSTRAR SALDO
async function showBalance(callback) {
  try {
    // const fileName = await fetchUserAccount("Ver o saldo de qual conta? ");
    const account = await checkAccount(currentUserLoged);

    // Sair da operação caso o arquivo não exista
    if (!account) {
      callback();
      return;
    }

    let accountChoosen = await whichAccount("Consultar SALDO de qual conta?");

    if (account[accountChoosen].status === false) {
      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } está DESATIVADA!\n`
      );
      callback();
      return;
    }

    updateDetail(account);

    if (accountChoosen === "checkingAccount") {
      console.log(
        "-----> Saldo Conta Corrente: R$",
        account[accountChoosen].balance
      );
      console.log(
        "-----> Saldo Limite Especial: R$",
        account[accountChoosen].overdraft
      );
    } else {
      console.log(
        "-----> Capital Próprio: R$",
        account[accountChoosen].ownCapital
      );
      console.log("-----> Rendimento: R$", account[accountChoosen].equity);
      console.log("-----> Montante: R$", account[accountChoosen].amount);
    }

    callback();
  } catch (error) {
    errorTreatment("showBalance", error);
  }
}

// OPERATION FUNCTIONS - DEPOSITAR
async function deposit(callback) {
  try {
    //const fileName = await fetchUserAccount("Depositar em qual conta? ");
    const account = await checkAccount(currentUserLoged);

    // Sair da operação caso o arquivo não exista
    if (!account) {
      callback();
      return;
    }

    let accountChoosen = await whichAccount();

    if (account[accountChoosen].status === false) {
      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } está DESATIVADA!`
      );
      callback();
      return;
    }

    const deposit = await transactionAmount("Qual valor deseja DEPOSITAR? R$ ");

    // Lógica da operação de depósito
    if (accountChoosen === "checkingAccount") {
      let amount = account.checkingAccount.overdraft + deposit;

      if (amount >= 0) {
        account.checkingAccount.balance += account.checkingAccount.overdraft +=
          deposit;
        account.checkingAccount.overdraft = 0;
      } else {
        account.checkingAccount.overdraft += deposit;
      }
    } else {
      console.log("FAZER LÓGICA DE DEPOSITO EM POUPANÇA");
    }

    updateDetail(account);

    // Retorna o saldo atualizado
    if (accountChoosen === "checkingAccount") {
      console.log(
        "-----> Saldo Conta Corrente: R$",
        account[accountChoosen].balance
      );
      console.log(
        "-----> Saldo Limite Especial: R$",
        account[accountChoosen].overdraft
      );
    } else {
      console.log(
        "-----> Capital Próprio: R$",
        account[accountChoosen].ownCapital
      );
      console.log("-----> Rendimento: R$", account[accountChoosen].equity);
      console.log("-----> Montante: R$", account[accountChoosen].amount);
    }

    callback();
  } catch (error) {
    errorTreatment("deposit", error);
  }
}

// OPERATION FUNCTIONS - SACAR
async function withdraw(callback) {
  try {
    //const fileName = await fetchUserAccount("De qual conta sacar?");
    const account = await checkAccount(currentUserLoged);

    // Sair da operação caso o arquivo não exista
    if (!account) {
      callback();
      return;
    }

    let accountChoosen = await whichAccount();

    if (account[accountChoosen].status === false) {
      console.log(
        `${
          accountChoosen === "checkingAccount"
            ? "Conta Corrente"
            : "Conta Poupança"
        } está DESATIVADA!`
      );
      callback();
      return;
    }

    const withdraw = await transactionAmount("Qual valor deseja SACAR? R$ ");

    // Lógica da operação de depósito
    if (accountChoosen === "checkingAccount") {
      let amount = account.checkingAccount.balance - withdraw;

      if (amount < 0) {
        account.checkingAccount.overdraft += account.checkingAccount.balance -=
          withdraw;
        account.checkingAccount.balance = 0;
      } else {
        account.checkingAccount.balance = amount;
      }
    } else {
      console.log("FAZER LÓGICA DE SAQUE EM POUPANÇA");
    }

    updateDetail(account);

    // Retorna o saldo atualizado
    if (accountChoosen === "checkingAccount") {
      console.log(
        "-----> Saldo Conta Corrente: R$",
        account[accountChoosen].balance
      );
      console.log(
        "-----> Saldo Limite Especial: R$",
        account[accountChoosen].overdraft
      );
    } else {
      console.log(
        "-----> Capital Próprio: R$",
        account[accountChoosen].ownCapital
      );
      console.log("-----> Rendimento: R$", account[accountChoosen].equity);
      console.log("-----> Montante: R$", account[accountChoosen].amount);
    }

    callback();
  } catch (error) {
    errorTreatment("withdraw", error);
  }
}

async function transferBtwAccounts(callback) {
  let toAccount = await whichAccount("Para qual conta irá TRANSFERIR?");

  let account = await checkAccount(currentUserLoged);

  if (account.checkingAccount.status === false || account.savingsAccount.status === false) {
    console.log('Verifique se suas contas estão ATIVADAS\nantes de prosseguir com a transferência.')
    callback();
    return;
  } else {
    let transferAmount = await transactionAmount(
      "Digite o valor da Transferência: R$ "
    );

    if (toAccount === "savingsAccount") {
      if (account.checkingAccount.balance >= transferAmount) {
        account.savingsAccount.ownCapital += transferAmount;
        account.checkingAccount.balance -= transferAmount;

        updateDetail(account);

        console.log("TRANSFERÊNCIA ENTRE CONTAS realizada com SUCESSO!");
        console.log(`Valor da transferência: R$ `, transferAmount);
        console.log(`De CC, Saldo Atual: R$ `, account.checkingAccount.balance);
        console.log(
          `Para CP, Saldo Atual: R$ `,
          account.savingsAccount.amount,
          "\n"
        );
      } else {
        console.log(
          "TRANSFERÊNCIA ENTRE CONTAS NÃO realizada!\nSaldo INSUFICIENTE"
        );
        console.log(`Valor da transferência: R$ `, transferAmount);
        console.log(
          `CC --> Saldo Atual: R$ `,
          account.checkingAccount.balance,
          "\n"
        );
      }
    } else {
      if (
        account.savingsAccount.ownCapital + account.savingsAccount.equity >=
        transferAmount
      ) {
        if (account.savingsAccount.ownCapital >= transferAmount) {
          account.savingsAccount.ownCapital -= transferAmount;
        } else {
          account.savingsAccount.ownCapital = 0;
          account.savingsAccount.equity = 0;
        }

        let amount = account.checkingAccount.overdraft + transferAmount;

        if (amount >= 0) {
          account.checkingAccount.balance +=
            account.checkingAccount.overdraft += transferAmount;
          account.checkingAccount.overdraft = 0;
        } else {
          account.checkingAccount.overdraft += transferAmount;
        }

        updateDetail(account);

        console.log("TRANSFERÊNCIA ENTRE CONTAS realizada com SUCESSO!");
        console.log(`Valor da transferência: R$ `, transferAmount);
        console.log(`De CP, Saldo Atual: R$ `, account.savingsAccount.amount);
        console.log(
          `Para CC, Saldo Atual: R$ `,
          account.checkingAccount.balance,
          ` || R$ `,
          account.checkingAccount.overdraft,
          "\n"
        );
      } else {
        console.log(
          "TRANSFERÊNCIA ENTRE CONTAS NÃO realizada!\nSaldo INSUFICIENTE"
        );
        console.log(`Valor da transferência: R$ `, transferAmount);
        console.log(
          `CP --> Saldo Atual: R$ `,
          account.savingsAccount.amount,
          "\n"
        );
      }
    }

    callback();
  }
}

async function transferToThird(callback) {
  console.log("CRIAR FUNÇÃO!\n");
  callback();
}

function transactionAmount(msg = "Qual o valor da operação? R$ ") {
  return inquirer
    .prompt([
      {
        type: "number",
        name: "value",
        message: msg,
      },
    ])
    .then((answer) => {
      return answer.value;
    })
    .catch((error) => {
      errorTreatment("deposit.prompt", error);
    });
}

// OPERATION FUNCTIONS - ESCOLHER UMA CONTA PARA FAZER A OPERAÇÃO
function whichAccount(msg = "Operar em qual Conta?") {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "whichAccount",
        message: msg,
        choices: ["Conta Corrente", "Conta Poupança"],
      },
    ])
    .then((accountChoosen) => {
      if (accountChoosen.whichAccount === "Conta Corrente") {
        return "checkingAccount";
      } else {
        return "savingsAccount";
      }
    })
    .catch((error) => {
      errorTreatment("activeAccount.inquirer", error);
    });
}

// TOOL FUNCTIONS - VERIFICAR SE UM ARQUIVO EXISTE
function checkAccount(file = undefined) {
  return new Promise((resolve) => {
    resolve(file);
  })
    .then((file) => {
      if (!fs.existsSync(`./data_base/accounts/${file}.json`)) {
        console.log("Arquivo não existe!");
        return false;
      }

      return JSON.parse(
        fs.readFileSync(
          `./data_base/accounts/${file}.json`,
          "utf-8",
          (data) => {
            return data;
          }
        )
      );
    })
    .catch((error) => {
      errorTreatment("checkAccount", error);
    });
}

function updateDetail(fileToUpdate) {
  if (fileToUpdate.savingsAccount.status === true) {
    fileToUpdate.savingsAccount.amount =
      fileToUpdate.savingsAccount.ownCapital +
      fileToUpdate.savingsAccount.equity;
  }

  fs.writeFileSync(
    `./data_base/accounts/${currentUserLoged}.json`,
    JSON.stringify(fileToUpdate)
  );
}

// TOOL FUNCTIONS - SOLICITA NOME DE ARQUIVO
function fetchUserAccount(msg = "Buscar: ") {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "userInfo",
        message: `${msg}`,
      },
    ])
    .then((answer) => {
      return answer.userInfo;
    })
    .catch((error) => {
      errorTreatment("fetchUserAccount", error);
    });
}

// TOOL FUNCTIONS - GERADOR DE ID
function generateId() {
  let num1 = Math.round(Math.random() * 10);
  let num2 = Math.round(Math.random() * 10);
  let num3 = Math.round(Math.random() * 10);
  let num4 = Math.round(Math.random() * 10);
  let num5 = Math.round(Math.random() * 10);
  return `${num1}${num2}${num3}-${num4}${num5}`;
}

// TOOL FUNCTIONS - SOLICITA INFORMAÇÕES DO USUÁRIO
function infoUserAccount() {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "userName",
        message: `Nome de usuário: `,
      },
      {
        type: "password",
        name: "password",
        message: `Crie uma senha: `,
      },
      {
        type: "input",
        name: "fullName",
        message: `Nome completo: `,
      },
      {
        type: "input",
        name: "birthDate",
        message: `Data de Nascimento: `,
      },
    ])
    .then((answer) => {
      return {
        userId: generateId(),
        userName: answer.userName,
        password: answer.password,
        fullName: answer.fullName,
        birthDate: answer.birthDate,
        checkingAccount: {
          status: false,
          balance: 0,
          overdraft: 0,
        },
        savingsAccount: {
          status: false,
          taxParameter: null,
          ownCapital: 0,
          equity: 0,
        },
        bankStatement: [],
      };
    })
    .catch((error) => {
      errorTreatment("infoUserAccount", error);
    });
}

// TOOL FUNCTIONS - LISTA ARQUIVO EM UM DIRETÓRIO
function fetchFile(dir, fileName) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        reject();
      }

      files.forEach((file) => {
        let infoFile = {
          fully: false,
          name: null,
          path: null,
        };

        if (file.startsWith(fileName)) {
          infoFile.fully = true;
          infoFile.name = file;
          infoFile.path = path.resolve(dir, file);

          resolve(infoFile);
        }
      });

      resolve(false);
    });
  });
}

// TOOL FUNCTIONS - TRATAMENTO DE ERROS
function errorTreatment(functionName, error) {
  console.log(`---> Function: ${functionName};\n---> ${error}`);
}
