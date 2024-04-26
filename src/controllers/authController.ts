import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.service";
import prisma from "../models/user.prisma";
import { generateToken } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "El password es obligatorio" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error: any) {
    console.error("Error en el registro:", error);

    let statusCode = 500;
    let errorMessage = "Hubo un error en el registro";

    // Verifica si el error es debido a un correo electrónico duplicado
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      statusCode = 400;
      errorMessage = "El email ingresado ya existe.";
    }

    // Enviar respuesta con el código de estado y mensaje adecuados
    res.status(statusCode).json({ error: errorMessage });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "El password es obligatorio" });
      return;
    }
    const user = await prisma.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Usuario y contraseñas no coinciden" });
    }
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.log("error: ", error);
  }
};
