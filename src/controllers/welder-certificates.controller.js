import welderCertificatesService from "../services/welder-certificates.service.js";
import { responseSuccess, responsePaginated } from "../helpers/reponse.helper.js";

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { page: _p, limit: _l, ...filters } = req.query;

    const result = await welderCertificatesService.getAll(page, limit, filters);
    res.status(200).json(responsePaginated("Welder certificates retrieved successfully", result.data, result.pagination));
  } catch (error) {
    next(error);
  }
};

const getStaticList = async (req, res, next) => {
  try {
    const list = await welderCertificatesService.getStaticList();
    res.status(200).json(responseSuccess("Welder certificates static list retrieved successfully", list));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const certificate = await welderCertificatesService.getById(parseInt(req.params.id));
    res.status(200).json(responseSuccess("Welder certificate retrieved successfully", certificate));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const certificate = await welderCertificatesService.create(req.body);
    res.status(201).json(responseSuccess("Welder certificate created successfully", certificate));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const certificate = await welderCertificatesService.update(parseInt(req.params.id), req.body);
    res.status(200).json(responseSuccess("Welder certificate updated successfully", certificate));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await welderCertificatesService.remove(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default { getAll, getStaticList, getById, create, update, remove };
