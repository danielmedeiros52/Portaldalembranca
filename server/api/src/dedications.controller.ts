import { Request } from 'express';
import prisma from './lib/prisma';
import { BadRequestException, Controller, Get, Post, Req, Body } from './framework/nest-like';

@Controller('dedications')
export class DedicationsController {
  @Post()
  async create(@Body() body: { memorialId?: number; authorName?: string; message?: string }) {
    if (!body?.memorialId || !body.authorName || !body.message) {
      throw new BadRequestException('memorialId, authorName e message são obrigatórios');
    }

    const dedication = await prisma.dedication.create({
      data: {
        memorialId: body.memorialId,
        authorName: body.authorName,
        message: body.message,
      },
    });

    return dedication;
  }

  @Get()
  async list(@Req() req: Request) {
    const { memorialId } = req.query;
    if (!memorialId) {
      throw new BadRequestException('memorialId é obrigatório');
    }

    const dedications = await prisma.dedication.findMany({
      where: { memorialId: Number(memorialId) },
      orderBy: { createdAt: 'desc' },
    });

    return dedications;
  }
}
