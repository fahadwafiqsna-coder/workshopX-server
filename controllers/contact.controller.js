const Contact = require("../models/Contact.model");
const { sendEmail } = require("../services/mailService");
const ApiError = require("../utils/ApiError");

// Create Contact
const createContact = async (req, res, next) => {
  try {
    const { name, email, vehicleModel, purpose, phone, context } = req.body;

    const contact = await Contact.create({
      name,
      email,
      vehicleModel,
      purpose,
      phone,
      context,
    });

    res.status(201).json({
      success: true,
      message: "Contact request submitted successfully",
      contact,
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort("-createdAt");
    res.json(contacts);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!contact) return next(new ApiError(404, "Contact not found"));

    res.json({
      success: true,
      message: "Contact marked as read",
      contact,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const adminReplyContactEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, reply } = req.body;

    if (!reply || !email) {
      return res.status(400).json({ message: "Reply and email are required." });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { $push: { adminReply: reply } },
      { new: true }
    );

    await sendEmail({
      to: email,
      subject: "Reply to your contact - Admin",
      html: `<div>${reply}</div>`,
    });

    res.json(contact);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    res.json(contact);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = { createContact, getContacts, markAsRead, deleteContact, adminReplyContactEmail };
