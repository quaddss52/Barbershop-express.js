import {
  createCustomerintoDB,
  getCustomerfromDB,
  getCustomersfromDB,
  updateCustomerintoDB,
} from "../database.js";

// @route   GET /api/v1/customers
const getCustomers = async (req, res) => {
  // const limit = parseInt(req.query.limit);
  // const pageNo = parseInt(req.query.pageNo);
  const notes = await getCustomersfromDB();
  res.status(200).json(notes);
};

// @desc    Get a single customer by ID
// @route   GET /api/v1/services/:id
const getCustomerById = async (req, res, next) => {
  const customerId = parseInt(req.params.id);
  const customer = await getCustomerfromDB(customerId);
  if (customer) {
    res.status(200).json(customer);
    return;
  }
  const error = new Error("Customer not found");
  error.status = 404;
  return next(error);
};

// @route   POST /api/v1/customers
// @desc    Create a new customer
const createCustomer = async (req, res, next) => {
  const { firstname, lastname, phonenumber } = req.body;
  if (!firstname) {
    const error = new Error("Firstname is required");
    error.status = 400;
    return next(error);
  }
  if (!lastname) {
    const error = new Error("Lastname is required");
    error.status = 400;
    return next(error);
  }
  if (!phonenumber) {
    const error = new Error("Phonenumber is required");
    error.status = 400;
    return next(error);
  }
  try {
    const result = await createCustomerintoDB(firstname, lastname, phonenumber);
    res
      .status(201)
      .json({ id: result.insertId, firstname, lastname, phonenumber });
  } catch (error) {
    return next(error);
  }
};

// @route   PUT /api/v1/customers/:id
// @desc    Update a customer by ID
const updateCustomer = async (req, res, next) => {
  const customerId = parseInt(req.params.id);
  const customer = await getCustomerfromDB(customerId);
  if (!customer) {
    const error = new Error("Customer not found");
    error.status = 404;
    return next(error);
  }
  const { firstname, lastname, phonenumber } = req.body;
  if (!firstname) {
    const error = new Error("Firstname is required");
    error.status = 400;
    return next(error);
  }
  if (!lastname) {
    const error = new Error("Lastname is required");
    error.status = 400;
    return next(error);
  }
  if (!phonenumber) {
    const error = new Error("Phonenumber is required");
    error.status = 400;
    return next(error);
  }
  try {
    const result = await updateCustomerintoDB(
      firstname,
      lastname,
      phonenumber,
      customerId,
    );
    res.status(200).json({ id: customerId, firstname, lastname, phonenumber });
  } catch (error) {
    return next(error);
  }
};
export { getCustomers, getCustomerById, createCustomer, updateCustomer };
