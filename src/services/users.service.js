import { ROLE_NAME } from "../enums/user-role.enum.js";
import { CustomError } from "../errors/custom.error.js";
import userRepository from "../repositories/users.repo.js";
import bcrypt from "bcryptjs";
// import { deleteUserTokenByUserId } from "../repositories/userToken.repo.js";

const getUsers = async (page, limit, queryParams) => {
  const query = Object.keys(queryParams).length > 0 ? queryParams : null;
  const users = await userRepository.getUsers(page, limit, query);

  const sanitizedData = users.data.map((user) => {
    return {
      ...user,
      role: ROLE_NAME[user.role],
    };
  });

  return {
    data: sanitizedData,
    pagination: users.pagination,
  };
};

const getUserById = async (userId) => {
  if (!userId) throw new Error("User id is required");
  const user = await userRepository.getUser(userId);

  if (!user) throw CustomError.notFoundError(`User with ID ${userId} not found`);

  return {
    ...user,
    role: ROLE_NAME[user.role],
  };
};

const getByLogin = async (login) => {
  if (!login) throw new Error("Login is required");
  return await userRepository.getByLogin(login);
};

const createUser = async (data) => {
  const passwordHash = bcrypt.hashSync(data.password, 10);

  const newUser = { ...data, password: passwordHash };
  return await userRepository.createUser(newUser);
};

const updateUser = async (id, data) => {
  if (data?.password) {
    data.password = bcrypt.hashSync(data.password, 10);
  }
  return await userRepository.updateUserById(id, data);
};

const deleteUser = async (userId) => {
  // await deleteUserTokenByUserId(userId);
  return await userRepository.deleteUserById(userId);
};

export default {
  getUsers,
  getByLogin,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
