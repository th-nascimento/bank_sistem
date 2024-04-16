// External Modules
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import path from "path";

const tool = {
  /**
   * This function logs informative error messages for debugging purposes.
   *
   * @param {string} functionName - The name of the function where the error occurred.
   * @param {Error} error - The error object that was thrown.
   *
   * @returns {void} - This function does not return a value. It only logs the error message to the console.
   */
  errorTreatment: (functionName, error) => {
    console.log(`---> Function: ${functionName};\n---> ${error}`);
  },

  /**
   * Prompts the user for confirmation to exit the program.
   *
   * This function displays a confirmation dialog using Inquirer asking the user
   * if they want to exit. If confirmed, the process exits. Otherwise, an optional
   * callback function (if provided) is called to continue the operation.
   *
   * @param {function} [callback] - An optional callback function to be executed
   * if the user chooses not to exit.
   */
  breakOper: (callback) => {
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
          callback();
        }
      })
      .catch((error) => {
        tool.errorTreatment("breakOper", error);
      });
  },

  /**
   * Fetches information about a file in a given directory.
   * This function assumes the `fs` module (file system access) is available.
   *
   * @param {string} dir - The directory path where to search for the file.
   * @param {string} fileName - The name of the file to find (supports partial matching).
   *
   * @returns {Promise<object>} - A promise that resolves with an object containing information about the file:
   *   - `fully: bool` - Indicates if a complete match was found (file name matches exactly).
   *   - `name: string` (optional) - The name of the file found (if any).
   *   - `path: string` (optional) - The complete path to the file found (if any).
   *   - If no file is found, the promise resolves with `false`.
   */
  fetchFile: (dir, fileName) => {
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
  },

  /**
   * Prompts the user to enter user account information using Inquirer.
   *
   * @param {string} [msg="Buscar: "] - An optional message to display before the input field. Defaults to "Buscar: ".
   *
   * @returns {Promise<string>} - A promise that resolves with the user-entered information
   *                              or rejects if the user cancels the prompt or an error occurs.
   */
  fetchUserAccount: (msg = "Buscar: ") => {
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
        tool.errorTreatment("fetchUserAccount", error);
      });
  },

  /**
   * Checks for the existence and validity of an account in a JSON file.
   *
   * @param {string} [file] - Optional filename (without extension) of the account to check.
   *                           If not provided, the function resolves with `undefined`.
   *
   * @returns {Promise<object | boolean>} - A promise that resolves with:
   *   - The parsed account object from the JSON file if the file exists and is valid.
   *   - `false` if the file doesn't exist.
   *   - Rejects with an error if there's a problem reading the file or parsing the JSON.
   */
  checkAccount: (file = undefined) => {
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
        tool.errorTreatment("checkAccount", error);
      });
  },

  /**
   * Updates the amount in a savings account within a user's account file based on a condition.
   *
   * This function updates the `amount` property of the `savingsAccount` object within the provided `fileToUpdate` object.
   * The update only occurs if the `status` property of `savingsAccount` is set to `true`.
   *
   * @param {object} fileToUpdate - A JavaScript object representing the account data to be updated.
   *   The object should have a `savingsAccount` property with `status`, `ownCapital`,
   *   and `equity` properties.
   */
  updateDetail: (fileToUpdate) => {
    if (fileToUpdate.savingsAccount.status === true) {
      fileToUpdate.savingsAccount.amount =
        fileToUpdate.savingsAccount.ownCapital +
        fileToUpdate.savingsAccount.equity;
    }

    let accountRoute = path.join(
      "./data_base/accounts/",
      `${fileToUpdate.userName}.json`
    );

    fs.writeFileSync(accountRoute, JSON.stringify(fileToUpdate));
  },

  /**
   * Generates a random alphanumeric ID in the format "NN-NN-NN-NN-NN".
   *
   * This function is useful for creating unique identifiers for various purposes
   * like tracking data or assigning temporary IDs.  However, it might not be
   * suitable for highly secure applications where cryptographic strength is
   * required.
   *
   * @returns {string} - A random ID string in the format "NN-NN-NN-NN-NN".
   *
   * @example
   * const id = generateId();
   * console.log(id); // Output: Example: 34-12-78-90-56 (format may vary)
   */
  generateId: () => {
    let num1 = Math.round(Math.random() * 100);
    let num2 = Math.round(Math.random() * 100);
    let num3 = Math.round(Math.random() * 100);
    let num4 = Math.round(Math.random() * 100);
    let num5 = Math.round(Math.random() * 100);
    return `${num1}${num2}${num3}-${num4}${num5}`;
  },
};

export default tool;
