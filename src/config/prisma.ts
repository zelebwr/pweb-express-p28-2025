import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Log all database queries and errors to the console
})

export default prisma;