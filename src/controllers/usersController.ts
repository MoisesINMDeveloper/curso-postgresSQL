import { Request, Response } from "express";
import { hashPassword } from "../services/password.service";
import prisma from "../models/user.prisma";
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "El password es obligatorio" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error intentalo mas tarde:", error);

    let statusCode = 500;
    let errorMessage = "Hubo un error pruebe mas tarde";

    // Verifica si el error es debido a un correo electrónico duplicado
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      statusCode = 400;
      errorMessage = "El email ingresado ya existe.";
    }

    // Enviar respuesta con el código de estado y mensaje adecuados
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error, prueba mas tarde" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);
  try {
    const user = await prisma.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.status(404).json({ error: "El usuario no a sido encontrado" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error, prueba mas tarde" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);
  const { email, password } = req.body;
  try {
    let dataToUpdate: any = { ...req.body };
    if (password) {
      const hashedPassword = await hashPassword(password);
      dataToUpdate.password = hashedPassword;
    }
    if (email) {
      dataToUpdate.email = email;
    }
    const user = await prisma.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
    });
    res.status(200).json(user);
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "email ingresado ya existe" });
    } else if (error?.code === "P2025") {
      res.status(404).json("Usuario no encontrado");
    } else {
      console.log(error);
      res.status(500).json({ error: "Hubo un error, prueba mas tarde" });
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);
  try {
    await prisma.delete({ where: { id: userId } });
    res
      .status(200)
      .json({ message: `El usuario ${userId} a sido eliminado` })
      .end();
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json("Usuario no encontrado");
    } else {
      console.log(error);
      res.status(500).json({ error: "Hubo un error, prueba mas tarde" });
    }
  }
};
