import { CustomError } from "../errors/custom.error.js";
import welderCertificatesRepo from "../repositories/welder-certificates.repo.js";

const getAll = async (page, limit, queryParams) => {
  const params = Object.keys(queryParams).length > 0 ? queryParams : null;
  return await welderCertificatesRepo.getAll(page, limit, params);
};

const getStaticList = async () => {
  return await welderCertificatesRepo.getStaticList();
};

const getById = async (id) => {
  const certificate = await welderCertificatesRepo.getById(id);
  if (!certificate) throw CustomError.notFoundError(`Welder certificate with ID ${id} not found`);
  return certificate;
};

const create = async (data) => {
  return await welderCertificatesRepo.create(data);
};

const update = async (id, data) => {
  await getById(id);
  return await welderCertificatesRepo.updateById(id, data);
};

const remove = async (id) => {
  await getById(id);
  await welderCertificatesRepo.deleteById(id);
};

export default { getAll, getStaticList, getById, create, update, remove };
