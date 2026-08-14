import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class RoomController {
  public static async getAll(req: Request, res: Response) {
    try {
      const rooms = await prisma.room.findMany({
        orderBy: { roomNumber: 'asc' }
      });
      return res.json(rooms);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const { roomNumber, roomName, capacity, type, availableEquipment } = req.body;
      if (!roomNumber || !roomName || !capacity || !type) {
        return res.status(400).json({ message: 'Room number, name, capacity, and type are required.' });
      }
      const newRoom = await prisma.room.create({
        data: {
          roomNumber,
          roomName,
          capacity: Number(capacity),
          type,
          availableEquipment: availableEquipment || 'Whiteboard',
          availability: 'AVAILABLE'
        }
      });
      return res.status(201).json(newRoom);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.room.update({
        where: { id },
        data: req.body
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.room.delete({ where: { id } });
      return res.json({ message: 'Room deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
