const BankAccount = require('../services/bank_accounts');

class BankAccountController {
  async getAllBankAccounts(req, res) {
    try {
      const bankaccounts = await BankAccount.getAllBankAccounts();

      if (!bankaccounts || bankaccounts.length === 0) {
        return res.status(404).json({ message: 'No bank accounts were found' });
      }

      res.status(200).json(bankaccounts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createAccount(req, res) {
    try {
      const { userId, bankName, bankAccountNumber, balance } = req.body;

      const accountData = {
        id: userId,
        name: bankName,
        number: bankAccountNumber,
        balance: balance,
      };

      const account = new BankAccount(accountData);

      const newBankAccount = await account.createAccount();

      res.status(201).json(newBankAccount);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create bank account', error: error.message });
    }
  }

  async getBankAccountById(req, res) {
    try {
      const bankAccountId = req.params.id;

      const bankAccount = await BankAccount.getBankAccountById(bankAccountId);
      if (!bankAccount || bankAccount.length === 0) {
        return res.status(404).json({ message: 'No bank accounts were found' });
      }

      res.status(200).json({ bankAccount });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred on the server.' });
    }
  }

  async deleteAccountById(req, res) {
    const id = req.params.id;

    try {
      const response = await BankAccount.deleteAccountById(id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateAccount(req, res) {
    const id = req.params.id;
    const { bankName, bankAccountNumber, balance } = req.body;

    try {
      const updatedAccount = await BankAccount.updateAccount(id, {
        bankName,
        bankAccountNumber,
        balance,
      });
      return res.status(200).json({
        message: 'Bank account successfully updated',
        account: updatedAccount,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async withdraw(req, res) {
    const id = req.params.id;
    const { amount } = req.body;

    try {
      const updatedAccount = await BankAccount.withdraw(id, amount);
      return res.status(200).json({
        message: 'Bank account Withdraw successfully',
        account: updatedAccount,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deposit(req, res) {
    const id = req.params.id;
    const { amount } = req.body;

    try {
      const updatedAccount = await BankAccount.deposit(id, amount);
      return res.status(200).json({
        message: 'Bank account Deposit successfully',
        account: updatedAccount,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BankAccountController();
