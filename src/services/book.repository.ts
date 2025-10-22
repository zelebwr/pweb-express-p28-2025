import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const BookRepository = {
  findAllWithPagination: async (
    page: number,
    limit: number,
    search?: string,
    orderByTitle: "asc" | "desc" = "asc",
    orderByPublishDate: "asc" | "desc" = "desc"
  ) => {
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.BookWhereInput = {
      deletedAt: null, 
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const orderByCondition: Prisma.BookOrderByWithRelationInput[] = [
      { title: orderByTitle },
      { publicationYear: orderByPublishDate },
    ];

    const [books, totalCount] = await prisma.$transaction([
      prisma.book.findMany({
        where: whereCondition,
        include: {
          genre: { select: { name: true } },
        },
        orderBy: orderByCondition,
        skip,
        take: limit,
      }),
      prisma.book.count({ where: whereCondition }),
    ]);

    const formattedBooks = books.map((book) => ({
      ...book,
      genre: book.genre.name,
    }));

    return { books: formattedBooks, totalCount };
  },

  softDelete: (bookId: string) => {
    return prisma.book.update({
      where: { id: bookId, deletedAt: null },
      data: { deletedAt: new Date() },
      select: { id: true, title: true },
    });
  },

  findById: (bookId: string) => {
    return prisma.book.findFirst({
      where: { id: bookId, deletedAt: null },
      include: { genre: true },
    });
  },
};
