// External Modules
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";

// Own Modules
import tool from "./tool_modules.mjs";

const operation = {
  /**
   * Prompts the user for information to create a new account.
   * @returns {Promise<object>} - A promise that resolves with an object containing
   *                               user information and initial account details.
   */
  infoUserAccount: () => {
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
          userId: tool.generateIdHex(),
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
        tool.errorTreatment("infoUserAccount", error);
      });
  },

  /**
   * Asynchronously opens a new user account.
   *
   * This function first prompts the user for account information using `infoUserAccount`.
   * It then checks if an account file already exists for the provided username.
   * If the account doesn't exist, a new file is created with the user information
   * in JSON format. A success message is displayed, and an optional callback function
   * (if provided) is called.
   *
   * In case of errors during user input or file operations, the function calls
   * the assumed `tool.errorTreatment` function to handle them.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful account creation or encountering
   *                                  an error.
   */
  openAccount: async (callback) => {
    try {
      let userCreated = await operation.infoUserAccount();

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
      tool.errorTreatment("openAccount", error);
    }
  },

  /**
   * Attempts to close a user account based on user selection and confirmation.
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful account closure or encountering
   *                                  an error.
   *
   * @returns {Promise} - A promise that resolves with the closed account object
   *                       (if successful deletion happens with confirmation)
   *                       or rejects with an error.
   */
  closeAccount: (callback) => {
    return new Promise((resolve, reject) => {
      tool.fetchUserAccount("Qual conta deseja excluir?").then((fileName) => {
        tool.checkAccount(fileName).then((account) => {
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
        tool.errorTreatment("closeAccount", error);
      });
  },

  /**
   * Activates a chosen account (checking or savings) for the logged-in user.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful account activation or encountering
   *                                  an error.
   */
  activeAccount: async (currentUserLogged, callback) => {
    try {
      const account = await tool.checkAccount(currentUserLogged);

      let accountChoosen = await operation.whichAccount();

      if (account[accountChoosen].status === false) {
        account[accountChoosen].status = true;

        if (accountChoosen === "savingsAccount") {
          account.savingsAccount.amount =
            account.savingsAccount.ownCapital + account.savingsAccount.equity;
        }

        fs.writeFileSync(
          `./data_base/accounts/${currentUserLogged}.json`,
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
      tool.errorTreatment("activeAccount", error);
    }
  },

  /**
   * Deactivates a chosen account (checking or savings) for the logged-in user,
   * but only if there are no outstanding balances or overdrafts.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful account deactivation or encountering
   *                                  an error.
   *
   * @example
   * deactiveAccount(() => {
   *   console.log("Account deactivated. Performing additional actions...");
   * });
   */
  deactiveAccount: async (currentUserLogged, callback) => {
    try {
      const account = await tool.checkAccount(currentUserLogged);

      let accountChoosen = await operation.whichAccount();

      switch (accountChoosen) {
        case "checkingAccount":
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
          `./data_base/accounts/${currentUserLogged}.json`,
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
      tool.errorTreatment("deactiveAccount", error);
    }
  },

  /**
   * Displays the balance information for the chosen account (checking or savings)
   * of the logged-in user.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful balance display or encountering
   *                                  an error.
   */
  showBalance: async (currentUserLogged, callback) => {
    try {
      const account = await tool.checkAccount(currentUserLogged);

      if (!account) {
        callback();
        return;
      }

      let accountChoosen = await operation.whichAccount(
        "Consultar SALDO de qual conta?"
      );

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

      tool.updateDetail(account);

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
      tool.errorTreatment("showBalance", error);
    }
  },

  /**
   * Deposits funds into the chosen account (checking or savings) of the logged-in user.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful deposit or encountering an error.
   */
  deposit: async (currentUserLogged, callback) => {
    try {
      const account = await tool.checkAccount(currentUserLogged);

      if (!account) {
        callback();
        return;
      }

      let accountChoosen = await operation.whichAccount();

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

      const deposit = await operation.transactionAmount(
        "Qual valor deseja DEPOSITAR? R$ "
      );

      // Lógica da operação de depósito
      if (accountChoosen === "checkingAccount") {
        let amount = account.checkingAccount.overdraft + deposit;

        if (amount >= 0) {
          account.checkingAccount.balance +=
            account.checkingAccount.overdraft += deposit;
          account.checkingAccount.overdraft = 0;
        } else {
          account.checkingAccount.overdraft += deposit;
        }
      } else {
        console.log("FAZER LÓGICA DE DEPOSITO EM POUPANÇA");
      }

      tool.updateDetail(account);

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
      tool.errorTreatment("deposit", error);
    }
  },

  /**
   * Withdraws funds from the chosen account (checking or savings) of the logged-in user.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after successful withdrawal or encountering an error.
   *
   */
  withdraw: async (currentUserLogged, callback) => {
    try {
      const account = await tool.checkAccount(currentUserLogged);

      if (!account) {
        callback();
        return;
      }

      let accountChoosen = await operation.whichAccount();

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

      const withdraw = await operation.transactionAmount(
        "Qual valor deseja SACAR? R$ "
      );

      // Lógica da operação de depósito
      if (accountChoosen === "checkingAccount") {
        let amount = account.checkingAccount.balance - withdraw;

        if (amount < 0) {
          account.checkingAccount.overdraft +=
            account.checkingAccount.balance -= withdraw;
          account.checkingAccount.balance = 0;
        } else {
          account.checkingAccount.balance = amount;
        }
      } else {
        console.log("FAZER LÓGICA DE SAQUE EM POUPANÇA");
      }

      tool.updateDetail(account);

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
      tool.errorTreatment("withdraw", error);
    }
  },

  /**
   * Transfers funds between the logged-in user's checking and savings accounts.
   *
   * @param {function} [callback] - An optional callback function to be executed
   *                                  after transfer attempt or encountering an error.
   *
   */
  transferBtwAccounts: async (currentUserLogged, callback) => {
    let toAccount = await operation.whichAccount(
      "Para qual conta irá TRANSFERIR?"
    );

    let account = await tool.checkAccount(currentUserLogged);

    if (
      account.checkingAccount.status === false ||
      account.savingsAccount.status === false
    ) {
      console.log(
        "Verifique se suas contas estão ATIVADAS\nantes de prosseguir com a transferência."
      );
      callback();
      return;
    } else {
      let transferAmount = await operation.transactionAmount(
        "Digite o valor da Transferência: R$ "
      );

      if (toAccount === "savingsAccount") {
        if (account.checkingAccount.balance >= transferAmount) {
          account.savingsAccount.ownCapital += transferAmount;
          account.checkingAccount.balance -= transferAmount;

          tool.updateDetail(account);

          console.log("TRANSFERÊNCIA ENTRE CONTAS realizada com SUCESSO!");
          console.log(`Valor da transferência: R$ `, transferAmount);
          console.log(
            `De CC, Saldo Atual: R$ `,
            account.checkingAccount.balance
          );
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

          tool.updateDetail(account);

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
  },

  transferToThird: async (callback) => {
    console.log("CRIAR FUNÇÃO!\n");
    callback();
  },

  /**
   * Prompts user for a transaction amount (number).
   *
   * @param {string} [msg="Qual o valor da operação? R$ "] - Optional prompt message.
   * @returns {Promise<number>} Resolves to the entered amount.
   */
  transactionAmount: (msg = "Qual o valor da operação? R$ ") => {
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
        tool.errorTreatment("deposit.prompt", error);
      });
  },

  /**
   * Prompts user to choose between checking or savings account.
   *
   * @param {string} [msg="Operar em qual Conta?"] - Optional prompt message.
   * @returns {Promise<string>} Resolves to "checkingAccount" or "savingsAccount" based on user choice.
   */
  whichAccount: (msg = "Operar em qual Conta?") => {
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
        tool.errorTreatment("activeAccount.inquirer", error);
      });
  },
};

export default operation;
