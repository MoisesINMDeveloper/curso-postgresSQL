import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/usersController";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// MIDDLEWARE de JWT para ver si estamos autenticados
const autenticateTOken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Error en la autenticacion:", err);
      return res.status(403).json({ error: "No tienes acceso a este recurso" });
    }
    // Si el token es válido, llamamos a next() para continuar con la ejecución
    next();
  });
};

router.post("/", autenticateTOken, createUser);

router.get("/", autenticateTOken, getAllUsers);

router.get("/:id", autenticateTOken, getUserById);

router.put("/:id", autenticateTOken, updateUser);

router.delete("/:id", autenticateTOken, deleteUser);

export default router;
