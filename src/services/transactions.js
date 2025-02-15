const prisma = require("../db");

class Transaction {
  static prisma = prisma;
  constructor(data) {
    this.sourceAccountId = data.sourceAccountId;
    this.destinationAccountId = data.destinationAccountId;
    this.amount = data.amount;
  }

  async createTransaction() {
    try {
      const transactionResult = await Transaction.prisma.$transaction(async (tx) => {

        const sourceAccount = await this.getAccount(tx, this.sourceAccountId);

        this.checkSufficientBalance(sourceAccount);

        const destinationAccount = await this.getAccount(tx, this.destinationAccountId);

        await this.updateAccountBalance(tx, this.sourceAccountId, sourceAccount.balance - this.amount);

        await this.updateAccountBalance(tx, this.destinationAccountId, destinationAccount.balance + this.amount);

        const newTransaction = await tx.transaction.create({
          data: {
            sourceAccountId: this.sourceAccountId,
            destinationAccountId: this.destinationAccountId,
            amount: this.amount,
          },
        });

        return newTransaction;
      });

      return transactionResult;

    } catch (error) {
      throw new Error('Failed to Create transactions : ' + error.message);
    }
  }

  async getAccount(tx, accountId) {
    const account = await tx.bankAccount.findUnique({
      where: { bankAccountId: accountId },
    });

    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    return account;
  }

  checkSufficientBalance(account) {
    if (account.balance < this.amount) {
      throw new Error('Insufficient balance in source account');
    }
  }

  async updateAccountBalance(tx, accountId, newBalance) {
    await tx.bankAccount.update({
      where: { bankAccountId: accountId },
      data: { balance: newBalance },
    });
  }

  static async getAllTransactions() {
    try {
      const transactions = await Transaction.prisma.transaction.findMany({
        include: {
          bankAccountSource: true,
          bankAccountDestination: true,
        },
      });
      return transactions;
    } catch (error) {
      throw new Error('Failed to retrieve transactions : ' + error.message);
    }
  }

  static async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.prisma.transaction.findUnique({
        where: {
          transactionId: parseInt(transactionId),
        },
        include: {
          bankAccountSource: true,
          bankAccountDestination: true,
        },
      });

      return transaction;
    } catch (error) {
      throw new Error('Failed to get Transaction : ' + error.message);
    }
  }
}

module.exports = Transaction;
