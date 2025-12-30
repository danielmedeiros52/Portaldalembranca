import { Request } from 'express';
import prisma from './lib/prisma';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Body,
  Req,
} from './framework/nest-like';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

async function generateUniqueSlug(fullName: string) {
  const base = slugify(fullName) || 'memorial';
  let attempt = 0;
  while (attempt < 5) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await prisma.memorial.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    attempt += 1;
  }
  return `${base}-${Date.now()}`;
}

type CreateMemorialBody = {
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  birthplace?: string;
  parents?: string;
  biography?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'public' | 'private';
  funeralHomeId?: number;
  familyUserId?: number;
};

type UpdateMemorialBody = Partial<CreateMemorialBody> & { status?: 'PENDING_FAMILY_DATA' | 'ACTIVE' | 'INACTIVE' };

@Controller('memorials')
export class MemorialsController {
  @Get()
  async list(@Req() req: Request) {
    const { funeralHomeId, familyUserId } = req.query;
    const where: Record<string, unknown> = {};
    if (funeralHomeId) where.funeralHomeId = Number(funeralHomeId);
    if (familyUserId) where.familyUserId = Number(familyUserId);

    const memorials = await prisma.memorial.findMany({
      where,
      include: { _count: { select: { photos: true, dedications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return memorials;
  }

  @Post()
  async create(@Body() body: CreateMemorialBody) {
    if (!body?.fullName || !body.funeralHomeId) {
      throw new BadRequestException('fullName e funeralHomeId são obrigatórios');
    }

    const slug = await generateUniqueSlug(body.fullName);

    const memorial = await prisma.memorial.create({
      data: {
        fullName: body.fullName,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        deathDate: body.deathDate ? new Date(body.deathDate) : undefined,
        birthplace: body.birthplace,
        parents: body.parents,
        biography: body.biography,
        visibility: body.visibility?.toUpperCase() === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
        funeralHomeId: body.funeralHomeId,
        familyUserId: body.familyUserId,
        slug,
        status: 'PENDING_FAMILY_DATA',
      },
    });

    return memorial;
  }

  @Get(':id')
  async getById(@Req() req: Request) {
    const id = Number(req.params.id);
    const memorial = await prisma.memorial.findUnique({
      where: { id },
      include: { descendants: true, photos: true, dedications: true },
    });

    if (!memorial) {
      throw new NotFoundException('Memorial não encontrado');
    }

    return memorial;
  }

  @Put(':id')
  async update(@Req() req: Request, @Body() body: UpdateMemorialBody) {
    const id = Number(req.params.id);
    try {
      const memorial = await prisma.memorial.update({
        where: { id },
        data: {
          fullName: body.fullName,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          deathDate: body.deathDate ? new Date(body.deathDate) : undefined,
          birthplace: body.birthplace,
          parents: body.parents,
          biography: body.biography,
          visibility: body.visibility?.toUpperCase() === 'PRIVATE' ? 'PRIVATE' : body.visibility?.toUpperCase() === 'PUBLIC'
            ? 'PUBLIC'
            : undefined,
          familyUserId: body.familyUserId,
          funeralHomeId: body.funeralHomeId,
          status: body.status,
        },
      });
      return memorial;
    } catch (error) {
      throw new NotFoundException('Memorial não encontrado');
    }
  }

  @Delete(':id')
  async softDelete(@Req() req: Request) {
    const id = Number(req.params.id);
    try {
      const memorial = await prisma.memorial.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return memorial;
    } catch (error) {
      throw new NotFoundException('Memorial não encontrado');
    }
  }

  @Get('by-slug/:slug')
  async getBySlug(@Req() req: Request) {
    const { slug } = req.params;
    const memorial = await prisma.memorial.findUnique({
      where: { slug },
      include: { descendants: true, photos: true, dedications: true },
    });

    if (!memorial) {
      throw new NotFoundException('Memorial não encontrado');
    }

    return memorial;
  }
}
