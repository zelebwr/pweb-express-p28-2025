import { AuthRepository } from "../services/auth.repository";
import { hashPassword } from "../utils/hash";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export const AuthService = {
  registerUser: async (input: RegisterInput) => {
    const { username, email, password } = input;

    const existingUser = await AuthRepository.findUserByEmailOrUsername(email, username);

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        throw new Error("Email already registered.");
      }

      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        throw new Error("Username already taken.");
      }
    }

    const passwordHash = await hashPassword(password);
    const newUser = await AuthRepository.createUser(username, email, passwordHash);
    return newUser;
  },
};
