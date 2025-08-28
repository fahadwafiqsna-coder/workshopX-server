const Service = require("../models/Service.model");
const ApiError = require("../utils/ApiError");

const createService = async (req, res, next) => {
  try {
    const { title, description, image, createdBy } = req.body;
    const service = await Service.create({ title, description, image, createdBy });
    res.status(201).json(service);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    res.json(service);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const updateServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image, createdBy } = req.body;
    const service = await Service.findByIdAndUpdate(
      id,
      { title, description, image, createdBy },
      { new: true }
    );
    res.json({ service, message: "Service updated successfully" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    res.json({ service, message: "Service deleted successfully" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateServices,
  deleteService,
};
