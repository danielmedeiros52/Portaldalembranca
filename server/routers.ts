import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { funeralHomes, familyUsers, memorials, descendants, photos, dedications, InsertMemorial, InsertDescendant, InsertPhoto, InsertDedication } from "../drizzle/schema";
import * as db from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateMemorialQRCode, generateMemorialQRCodeSVG } from "./qrcode";

// Helper to generate unique slug
function generateSlug(name: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${name.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}-${timestamp}-${random}`;
}

// Auth Router
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  // Funeral Home Login
  funeralHomeLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const funeralHome = await db.getFuneralHomeByEmail(input.email);
      if (!funeralHome) {
        throw new Error("E-mail ou senha inválidos");
      }
      const isPasswordValid = await bcrypt.compare(input.password, funeralHome.passwordHash);
      if (!isPasswordValid) {
        throw new Error("E-mail ou senha inválidos");
      }
      return { id: funeralHome.id, name: funeralHome.name, email: funeralHome.email, type: "funeral_home" };
    }),

  // Funeral Home Register
  funeralHomeRegister: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.getFuneralHomeByEmail(input.email);
      if (existing) {
        throw new Error("E-mail já registrado");
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.insert(funeralHomes).values({
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
        address: input.address,
      });

      return { success: true };
    }),

  // Family User Login
  familyUserLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const familyUser = await db.getFamilyUserByEmail(input.email);
      if (!familyUser || !familyUser.passwordHash) {
        throw new Error("E-mail ou senha inválidos");
      }
      const isPasswordValid = await bcrypt.compare(input.password, familyUser.passwordHash);
      if (!isPasswordValid) {
        throw new Error("E-mail ou senha inválidos");
      }
      return { id: familyUser.id, name: familyUser.name, email: familyUser.email, type: "family_user" };
    }),

  // Accept Family Invitation
  acceptInvitation: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const familyUser = await db.getFamilyUserByInvitationToken(input.token);
      if (!familyUser) {
        throw new Error("Convite inválido ou expirado");
      }
      if (familyUser.invitationExpiry && new Date(familyUser.invitationExpiry) < new Date()) {
        throw new Error("O convite expirou");
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.update(familyUsers).set({
        passwordHash,
        isActive: true,
        invitationToken: null,
        invitationExpiry: null,
      }).where(eq(familyUsers.id, familyUser.id));

      return { success: true };
    }),
});

// Memorial Router
const memorialRouter = router({
  // Get memorials by funeral home
  getByFuneralHome: protectedProcedure
    .input(z.object({ funeralHomeId: z.number() }))
    .query(async ({ input }) => {
      return db.getMemorialsByFuneralHomeId(input.funeralHomeId);
    }),

  // Get memorials by family user
  getByFamilyUser: protectedProcedure
    .input(z.object({ familyUserId: z.number() }))
    .query(async ({ input }) => {
      return db.getMemorialsByFamilyUserId(input.familyUserId);
    }),

  // Get memorial by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const memorial = await db.getMemorialBySlug(input.slug);
      if (!memorial) throw new Error("Memorial não encontrado");
      if (memorial.visibility === "private") {
        throw new Error("Este memorial é privado");
      }
      return memorial;
    }),

  // Get memorial by ID (protected)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getMemorialById(input.id);
    }),

  // Create memorial (funeral home only)
  create: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1),
      birthDate: z.string().optional(),
      deathDate: z.string().optional(),
      birthplace: z.string().optional(),
      familyEmail: z.string().email(),
      funeralHomeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      // Get or create family user
      let familyUser = await db.getFamilyUserByEmail(input.familyEmail);
      let familyUserId: number;

      if (!familyUser) {
        const invitationToken = crypto.randomBytes(32).toString("hex");
        const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await dbInstance.insert(familyUsers).values({
          name: input.familyEmail.split("@")[0],
          email: input.familyEmail,
          invitationToken,
          invitationExpiry,
          isActive: false,
        });

        const newFamilyUser = await db.getFamilyUserByEmail(input.familyEmail);
        if (!newFamilyUser) throw new Error("Falha ao criar usuário da família");
        familyUserId = newFamilyUser.id;
      } else {
        familyUserId = familyUser.id;
      }

      const slug = generateSlug(input.fullName);
      await dbInstance.insert(memorials).values({
        slug,
        fullName: input.fullName,
        birthDate: input.birthDate,
        deathDate: input.deathDate,
        birthplace: input.birthplace,
        funeralHomeId: input.funeralHomeId,
        familyUserId,
        status: "pending_data",
        visibility: "public",
      });

      const createdMemorial = await db.getMemorialBySlug(slug);
      return { id: createdMemorial?.id, slug, familyUserId };
    }),

  // Update memorial
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      fullName: z.string().optional(),
      birthDate: z.string().optional(),
      deathDate: z.string().optional(),
      birthplace: z.string().optional(),
      filiation: z.string().optional(),
      biography: z.string().optional(),
      visibility: z.enum(["public", "private"]).optional(),
      status: z.enum(["active", "pending_data", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      const { id, ...updateData } = input;
      await dbInstance.update(memorials).set(updateData).where(eq(memorials.id, id));
      return { success: true };
    }),

  // Generate QR code for memorial
  generateQRCode: publicProcedure
    .input(z.object({
      slug: z.string(),
      baseUrl: z.string(),
      format: z.enum(["png", "svg"]).default("png"),
    }))
    .query(async ({ input }) => {
      const memorialUrl = `${input.baseUrl}/m/${input.slug}`;
      try {
        if (input.format === "svg") {
          const svgCode = await generateMemorialQRCodeSVG(memorialUrl);
          return { success: true, qrCode: svgCode, format: "svg" };
        } else {
          const pngCode = await generateMemorialQRCode(memorialUrl);
          return { success: true, qrCode: pngCode, format: "png" };
        }
      } catch (error) {
        throw new Error("Falha ao gerar código QR");
      }
    }),
});

// Descendant Router
const descendantRouter = router({
  getByMemorial: publicProcedure
    .input(z.object({ memorialId: z.number() }))
    .query(async ({ input }) => {
      return db.getDescendantsByMemorialId(input.memorialId);
    }),

  create: protectedProcedure
    .input(z.object({
      memorialId: z.number(),
      name: z.string().min(1),
      relationship: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.insert(descendants).values(input);
      const created = await db.getDescendantsByMemorialId(input.memorialId);
      return { success: true, count: created.length };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.delete(descendants).where(eq(descendants.id, input.id));
      return { success: true };
    }),
});

// Photo Router
const photoRouter = router({
  getByMemorial: publicProcedure
    .input(z.object({ memorialId: z.number() }))
    .query(async ({ input }) => {
      return db.getPhotosByMemorialId(input.memorialId);
    }),

  create: protectedProcedure
    .input(z.object({
      memorialId: z.number(),
      fileUrl: z.string(),
      caption: z.string().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.insert(photos).values({
        ...input,
        order: input.order ?? 0,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.delete(photos).where(eq(photos.id, input.id));
      return { success: true };
    }),
});

// Dedication Router
const dedicationRouter = router({
  getByMemorial: publicProcedure
    .input(z.object({ memorialId: z.number() }))
    .query(async ({ input }) => {
      return db.getDedicationsByMemorialId(input.memorialId);
    }),

  create: publicProcedure
    .input(z.object({
      memorialId: z.number(),
      authorName: z.string().min(1),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Banco de dados não disponível");

      await dbInstance.insert(dedications).values(input);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  memorial: memorialRouter,
  descendant: descendantRouter,
  photo: photoRouter,
  dedication: dedicationRouter,
});

export type AppRouter = typeof appRouter;
