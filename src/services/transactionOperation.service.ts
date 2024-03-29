import { AppDataSource } from "../data-source";

import { User } from "../entities/user.entity";
import { Transaction } from "../entities/transactions.entity";
import { Account } from "../entities/accounts.entity";

import { v4 as uuidv4 } from "uuid";

import { AppError } from "../errors/appErrors";

import { ITransactionSend, IUser } from "../interfaces";
import { Repository } from "typeorm";

const transactionOperationService = async (
  userFrom: string,
  userTo: string,
  value: number
): Promise<ITransactionSend> => {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);
  const transactionRepository: Repository<Transaction> =
    AppDataSource.getRepository(Transaction);
  const accountRepository: Repository<Account> =
    AppDataSource.getRepository(Account);

  const users: User[] = await userRepository.find();
  const accounts: Account[] = await accountRepository.find();

  const userToDb: User | undefined = users.find(
    (user) => user.username == userTo
  );
  const userFromDb: User | undefined = users.find(
    (user) => user.username == userFrom
  );

  const accountTo: Account | undefined = accounts.find((account) => {
    return account.account_id == userToDb?.account.account_id;
  });
  const accountFrom: Account | undefined = accounts.find((account) => {
    return account.account_id == userFromDb?.account.account_id;
  });

  if (!userToDb) {
    throw new AppError(404, "User not found");
  }

  if (userTo == userFrom) {
    throw new AppError(401, "You cannot transfer to yourself");
  }

  if ((accountFrom?.balance as number) < value) {
    throw new AppError(401, "insufficient funds");
  }

  const newTransaction = {
    transaction_id: uuidv4(),
    value: value,
    debitedAccount: accountFrom,
    creditedAccount: accountTo,
  };

  transactionRepository.create(newTransaction);
  await transactionRepository.save(newTransaction);

  if (accountFrom?.balance != undefined && accountTo?.balance != undefined) {
    await accountRepository.update(accountFrom.account_id, {
      balance: (accountFrom.balance -= value),
    });
    await accountRepository.update(accountTo.account_id, {
      balance: (accountTo.balance += value),
    });
  }
  return {
    message: `transaction from ${userFrom} to ${userTo} in the amount of $${value.toFixed(
      2
    )} complete`,
  };
};

export default transactionOperationService;
