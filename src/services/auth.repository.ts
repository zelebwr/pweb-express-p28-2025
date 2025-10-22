import prisma from "../config/prisma";

export const AuthRepository = {
  async findUserByEmailOrUsername(email: string, username: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  },

  async createUser(username: string, email: string, password: string) {
    return await prisma.user.create({
      data: {
        username,
        email,
        password,
      },
    });
  },
};
