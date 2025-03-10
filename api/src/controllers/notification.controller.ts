import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateRemainderSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isEmailEnabled, isWhatsAppEnabled, isTelegramEnabled, isCallEnabled } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isEmailEnabled, isWhatsAppEnabled, isTelegramEnabled, isCallEnabled },
    });

    return res.json({ message: "Remainder settings updated", user });
  } catch (error) {
    return res.status(500).json({ error: "Error updating Remainder settings" });
  }
};
