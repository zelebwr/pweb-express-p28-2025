import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const GenreRepository = {
    /**
     * @author Member A
     */
    findByName: (name: string) => {
        return prisma.genre.findFirst({
            where: { 
                name: { equals: name, mode: 'insensitive' }, 
                deletedAt: null 
            },
        });
    },
    
    /**
     * @author Member A
     */
    create: (name: string) => {
        return prisma.genre.create({
            data: { name },
            select: { id: true, name: true, createdAt: true },
        });
    },

    /**
     * @author Member A
     */
    findAllWithPagination: async (
        page: number, 
        limit: number, 
        search: string, 
        orderByName: 'asc' | 'desc'
    ) => {
        const skip = (page - 1) * limit;
        const whereCondition: Prisma.GenreWhereInput = {
            deletedAt: null,
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
        };

        const [genres, totalCount] = await prisma.$transaction([
            prisma.genre.findMany({
                where: whereCondition,
                select: { id: true, name: true },
                orderBy: { name: orderByName },
                skip,
                take: limit,
            }),
            prisma.genre.count({ where: whereCondition }),
        ]);

        return { genres, totalCount };
    },
};
