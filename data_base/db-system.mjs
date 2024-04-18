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

const dbSystem = {
  collection: new Array(),

  verifyCollec() {
    if (this.collection.length <= 0) {
      return false;
    } else {
      return true;
    }
  },

  register(userName, password, fullName, birthDate) {
    this.collection.push(new User(userName, password, fullName, birthDate));
  },

  update: () => {},

  get() {
    return this.collection;
  },

  del: () => {},
};

export default dbSystem;
