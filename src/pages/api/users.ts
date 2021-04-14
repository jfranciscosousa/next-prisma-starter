import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { NOT_FOUND_ERROR } from "root/lib/errorTypes";
import prisma from "root/lib/prisma";
import {
  authenticateUser,
  clearUser,
  getCurrentUser,
} from "root/lib/tokenUtils";

export const config = { rpc: true };

interface UserParams {
  email: string;
  password: string;
}

async function createUser(params: UserParams): Promise<User> {
  const password = await bcrypt.hash(params.password, 10);
  const user = await prisma.user.create({
    data: { ...params, password },
  });

  user.password = "";

  return user;
}

export async function login(params: UserParams) {
  let user = await prisma.user.findUnique({ where: { email: params.email } });

  if (!user) {
    user = await createUser(params);
    authenticateUser(user);

    return user;
  }

  if (await bcrypt.compare(params.password, user.password)) {
    user.password = "";
    authenticateUser(user);

    return user;
  }

  throw new Error(NOT_FOUND_ERROR);
}

export async function logout() {
  clearUser();
}

export async function updateUser(params: UserParams) {
  const currentUser = await getCurrentUser();
  const password = params.password
    ? await bcrypt.hash(params.password, 10)
    : undefined;
  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { ...params, password },
  });

  if (user) {
    authenticateUser(user);
    user.password = "";
  }

  return user;
}

export async function deleteUser() {
  const currentUser = await getCurrentUser();
  const response = await prisma.$transaction([
    prisma.note.deleteMany({ where: { userId: currentUser.id } }),
    prisma.user.delete({ where: { id: currentUser.id } }),
  ]);

  return response[1];
}
