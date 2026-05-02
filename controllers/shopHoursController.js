import {
  bulkcreateShopHoursintoDB,
  bulkupdateShopHoursintoDB,
  getDayConfigfromDB,
  getShopHoursfromDB,
} from "../database.js";

// @route   GET /api/v1/shopHours
const getShopHoursConfig = async (req, res) => {
  // const limit = parseInt(req.query.limit);
  // const pageNo = parseInt(req.query.pageNo);
  const notes = await getShopHoursfromDB();
  res.status(200).json(notes);
};
const getShopHoursConfigByDay = async (req, res) => {
  const day = req.params.day;

  const notes = await getDayConfigfromDB(day);
  res.status(200).json(notes);
};

const validateShopWorksHours = (openingTime, closingTime, day) => {
  const openingTimeParts = openingTime.split(":");
  const closingTimeParts = closingTime.split(":");
  if (openingTimeParts.length !== 2 || closingTimeParts.length !== 2) {
    const error = new Error(
      "Invalid time format. Time should be in HH:MM format.",
    );
    error.status = 400;
    throw error;
  }
  const openingHour = parseInt(openingTimeParts[0]);
  const openingMinute = parseInt(openingTimeParts[1]);
  const closingHour = parseInt(closingTimeParts[0]);
  const closingMinute = parseInt(closingTimeParts[1]);
  if (
    isNaN(openingHour) ||
    isNaN(openingMinute) ||
    isNaN(closingHour) ||
    isNaN(closingMinute)
  ) {
    const error = new Error(
      "Invalid time format. Hours and minutes should be numbers.",
    );
    error.status = 400;
    throw error;
  }
  if (
    openingHour < 0 ||
    openingHour > 23 ||
    closingHour < 0 ||
    closingHour > 23
  ) {
    const error = new Error(
      "Invalid time format. Hours should be between 0 and 23.",
    );
    error.status = 400;
    throw error;
  }
  if (
    openingMinute < 0 ||
    openingMinute > 59 ||
    closingMinute < 0 ||
    closingMinute > 59
  ) {
    const error = new Error(
      "Invalid time format. Minutes should be between 0 and 59.",
    );
    error.status = 400;
    throw error;
  }
  if (
    openingHour > closingHour ||
    (openingHour === closingHour && openingMinute >= closingMinute)
  ) {
    const error = new Error(
      `Invalid time range for ${day}. Opening time should be before closing time.`,
    );
    error.status = 400;
    throw error;
  }
};

const validateShopHours = (shopHours) => {
  shopHours.forEach((hour) => {
    if (!hour.day) {
      const error = new Error("Day is required");
      error.status = 400;
      throw error;
    }

    if (!hour.isClosed) {
      validateShopWorksHours(hour.openingTime, hour.closingTime, hour.day);
    }

    if (
      hour.day !== "Monday" &&
      hour.day !== "Tuesday" &&
      hour.day !== "Wednesday" &&
      hour.day !== "Thursday" &&
      hour.day !== "Friday" &&
      hour.day !== "Saturday" &&
      hour.day !== "Sunday"
    ) {
      const error = new Error(
        "Day must be one of the following: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      );
      error.status = 400;
      throw error;
    }
    if (hour.isClosed === undefined) {
      const error = new Error("isClosed is required");
      error.status = 400;
      throw error;
    }
    if (!hour.isClosed) {
      if (!hour.openingTime) {
        const error = new Error("Opening time is required");
        error.status = 400;
        throw error;
      }
      if (!hour.closingTime) {
        const error = new Error("Closing time is required");
        error.status = 400;
        throw error;
      }
    }
  });
};
const createShopHoursConfig = async (req, res, next) => {
  const shopHours = req.body.config;

  //   console.log(shopHours);
  validateShopHours(shopHours);
  try {
    const result = await bulkcreateShopHoursintoDB(shopHours);
    res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};
const updateShopHoursConfig = async (req, res, next) => {
  const shopHours = req.body.config;
  validateShopHours(shopHours);
  try {
    const result = await bulkupdateShopHoursintoDB(shopHours);
    res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export {
  getShopHoursConfig,
  createShopHoursConfig,
  updateShopHoursConfig,
  getShopHoursConfigByDay,
};
