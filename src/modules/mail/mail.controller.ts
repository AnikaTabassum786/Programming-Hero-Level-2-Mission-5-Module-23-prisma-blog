import { NextFunction, Request, Response } from "express";
import { mailService } from "./mail.service";

const createMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    const result = await mailService.createMail(subject, message);

    res.status(200).json({
      success: true,
      message: "Emails sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const mailController = {
  createMail,
};