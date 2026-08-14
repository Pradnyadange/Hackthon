import { Request, Response } from 'express';
import { StaffingService } from '../services/staffing.service';

export class StaffingController {
  public static async getInsights(req: Request, res: Response) {
    try {
      const insights = await StaffingService.getStaffingInsights();
      return res.json(insights);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
