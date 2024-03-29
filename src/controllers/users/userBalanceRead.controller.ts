import { Request, Response } from "express";
import { AppError } from "../../errors/appErrors";
import userBalanceReadService from "../../services/userBalanceRead.service";

export const userBalanceReadController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const username = req.username;

    const balance = await userBalanceReadService(username);
    return res.status(200).send(balance);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).send(err);
    }
    return res.status(500).send("Internal Server Error");
  }
};
