// @desc    Get all posts

import {
  createServiceintoDB,
  getServicefromDB,
  getServicesfromDB,
  updateServiceintoDB,
  updateServiceStatusInDb,
} from "../database.js";

// @route   GET /api/v1/services
const getServices = async (req, res) => {
  // const limit = parseInt(req.query.limit);
  // const pageNo = parseInt(req.query.pageNo);
  const notes = await getServicesfromDB();
  res.status(200).json(notes);
};

// @desc    Get a single service by ID
// @route   GET /api/v1/services/:id
const getServiceById = async (req, res, next) => {
  const postId = parseInt(req.params.id);
  const post = await getServicefromDB(postId);
  if (post) {
    res.status(200).json(post);
    return;
  }
  const error = new Error("Service not found");
  error.status = 404;
  return next(error);
};

const createService = async (req, res, next) => {
  const { name, price, duration } = req.body;
  if (!name) {
    const error = new Error("Name is required");
    error.status = 400;
    return next(error);
  }
  if (!price) {
    const error = new Error("Price is required");
    error.status = 400;
    return next(error);
  }
  if (!duration) {
    const error = new Error("Duration is required");
    error.status = 400;
    return;
  }
  if (isNaN(price)) {
    const error = new Error("Price must be a number");
    error.status = 400;
    return next(error);
  }
  if (isNaN(duration)) {
    const error = new Error("Duration must be a number");
    error.status = 400;
    return next(error);
  }

  try {
    const reesult = await createServiceintoDB(name, price, duration);
    const newPost = {
      id: reesult.insertId,
      name,
      price,
      duration,
    };
    res.status(201).json(newPost);
    return;
  } catch (e) {
    const error = new Error(e);
    error.status = 400;
    return next(error);
  }
};

const updateService = async (req, res, next) => {
  const { name, price, duration } = req.body;
  const postId = parseInt(req.params.id);
  const service = await getServicefromDB(postId);
  if (!service) {
    const error = new Error("Service not found");
    error.status = 404;
    return next(error);
  }
  if (!name) {
    const error = new Error("Name is required");
    error.status = 400;
    return next(error);
  }
  if (!price) {
    const error = new Error("Price is required");
    error.status = 400;
    return next(error);
  }
  if (!duration) {
    const error = new Error("Duration is required");
    error.status = 400;
    return;
  }
  if (isNaN(price)) {
    const error = new Error("Price must be a number");
    error.status = 400;
    return next(error);
  }
  if (isNaN(duration)) {
    const error = new Error("Duration must be a number");
    error.status = 400;
    return next(error);
  }

  try {
    const reesult = await updateServiceintoDB(name, price, duration, postId);
    const newPost = {
      id: postId,
      name,
      price,
      duration,
    };
    res.status(201).json(newPost);
    return;
  } catch (e) {
    const error = new Error(e);
    error.status = 400;
    return next(error);
  }
};

const updateServiceStatus = async (req, res, next) => {
  const postId = parseInt(req.params.id);
  const status = req.query.status;
  if (!status) {
    const error = new Error("Status is required");
    error.status = 400;
    return next(error);
  }
  const service = await getServicefromDB(postId);
  if (!service) {
    const error = new Error("Service not found");
    error.status = 404;
    return next(error);
  }

  try {
    const reesult = await updateServiceStatusInDb(status, postId);
    const response = "Service status updated successfully";
    res.status(200).json(response);
    return;
  } catch (e) {
    const error = new Error(e);
    error.status = 400;
    return next(error);
  }
};

export {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
};
