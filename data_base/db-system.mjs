import tool from "../modules/tool_modules.mjs";

class User {
  constructor(userName, password, fullName, birthDate) {
    this.userId = tool.generateIdHex();
    this.userName = userName;
    this.password = password;
    this.fullName = fullName;
    this.birthDate = birthDate;
    this.checkingAccount = { status: false, balance: 0, overdraft: 0 };
    this.savingsAccount = {
      status: false,
      taxParameter: null,
      ownCapital: 0,
      equity: 0,
      amount: 0,
    };
    this.bankStatement = [];
  }

  checkBalance(account) {
    if (!account.status) {
      return false;
    } else {
      return { balance: account.balance, overdraft: account.overdraft };
    }
  }
}

class Database {
  constructor() {
    this.collection = [];
  }

  verifyCollec() {
    if (this.collection.length <= 0) {
      return false;
    } else {
      return true;
    }
  }

  create(userName, password, fullName, birthDate) {
    this.collection.push(new User(userName, password, fullName, birthDate));
  }

  read() {
    return this.collection;
  }

  update() {}

  del(id = "", uName = "", name = "") {
    let indexUser = undefined;
    if (id !== "") {
      indexUser = this.collection.indexOf(this.searchById(id));
    } else if (uName !== "") {
      indexUser = this.collection.indexOf(this.searchByUserName(uName));
    } else if (name !== "") {
      indexUser = this.collection.indexOf(this.searchByName(name));
    } else {
      return "User does not exist in database.";
    }

    this.collection.splice(indexUser, 1);
    return this.collection;
  }

  searchById(userId) {
    for (let i = 0; i < this.collection.length; i++) {
      if (this.collection[i].userId === userId) {
        return this.collection[i];
      } else {
        return `Does not exist in database an user with that id: ${userId}.`;
      }
    }
  }

  searchByUserName(userName) {
    for (let i = 0; i < this.collection.length; i++) {
      if (this.collection[i].userName === userName) {
        return this.collection[i];
      } else {
        return `Does not exist in database an user with that user name: ${userName}.`;
      }
    }
  }

  searchByName(fullName) {
    for (let i = 0; i < this.collection.length; i++) {
      if (this.collection[i].fullName === fullName) {
        return this.collection[i];
      } else {
        return `Does not exist in database an user with that name: ${fullName}.`;
      }
    }
  }
}

const dbUsers = new Database();

export default dbUsers;
