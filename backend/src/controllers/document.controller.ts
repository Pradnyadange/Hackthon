import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { OcrReaderService } from '../services/ocr-reader.service';

export class DocumentController {
  public static async getAll(req: any, res: Response) {
    try {
      const documents = await prisma.document.findMany({
        include: { uploadedBy: { select: { name: true, email: true } } },
        orderBy: { uploadDate: 'desc' }
      });
      return res.json(documents);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async upload(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const { type = 'STUDENT_ADMISSION' } = req.body;
      const userId = req.user ? req.user.id : (await prisma.user.findFirst())?.id || '';

      const fileUrl = `/uploads/${req.file.filename}`;

      const newDoc = await prisma.document.create({
        data: {
          fileName: req.file.originalname,
          fileUrl,
          type,
          uploadedById: userId,
          processingStatus: 'PENDING',
          extractedData: '{}',
          confidence: 0.95,
          verificationStatus: 'PENDING'
        }
      });

      // Auto-trigger OCR processing
      const processed = await OcrReaderService.processDocument(newDoc.id);

      return res.status(201).json(processed);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async process(req: any, res: Response) {
    try {
      const { id } = req.params;
      const result = await OcrReaderService.processDocument(id);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async approve(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { updatedFields } = req.body;

      const result = await OcrReaderService.approveDocument(id, updatedFields);
      return res.json({
        message: 'Document approved and database record created/updated successfully.',
        ...result
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async reject(req: any, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.document.update({
        where: { id },
        data: { verificationStatus: 'REJECTED' }
      });
      return res.json({ message: 'Document marked as rejected.', document: updated });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
