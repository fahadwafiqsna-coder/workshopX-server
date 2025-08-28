const Offer = require("../models/Offer.model");
const ApiError = require("../utils/ApiError");

const createOffer = async (req, res, next) => {
  try {
    const { title, description, image, createdBy, expireAt } = req.body;

    const offer = await Offer.create({
      title,
      description,
      image,
      createdBy,
      expireAt,
    });

    res.status(201).json(offer);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getOffers = async (req, res, next) => {
  try {
    // await Offer.deleteMany({ expireAt: { $lt: new Date() } });
    const offers = await Offer.find().populate("createdBy", "username email");
    res.json(offers);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate(
      "createdBy",
      "username email"
    );
    res.json(offer);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image, createdBy, expireAt } = req.body;
    const offer = await Offer.findByIdAndUpdate(
      id,
      { title, description, image, createdBy, expireAt },
      { new: true }
    );
    res.json({ offer, message: "Offer updated successfully" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    res.json(offer);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
};
