import e from "express";
import {
  cancelAppointmentStatusintoDB,
  createAppointmentintoDB,
  createCustomerintoDB,
  getAppointmentfromDB,
  getAppointmentsByDatefromDB,
  getAppointmentsfromDB,
  getCustomerfromDBbyPhone,
  getDayConfigfromDB,
  getServicefromDB,
  updateAppointmentStatusintoDB,
} from "../database.js";

// @route   GET /api/v1/appointments
// @desc    Get all appointments
const getAppointments = async (req, res) => {
  const status = req.query.status;
  const appointments = await getAppointmentsfromDB(status);
  res.status(200).json(appointments);
};

// @route   GET /api/v1/appointments/:id
// @desc    Get a single appointment by ID
const getAppointmentById = async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const appointment = await getAppointmentfromDB(appointmentId);
  if (appointment) {
    res.status(200).json(appointment);
    return;
  }
  const error = new Error("Appointment not found");
  error.status = 404;
  return next(error);
};

const calculateEndTime = (startTime, duration) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const totalMinutes = startHour * 60 + startMinute + duration;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;
  return `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;
};

const getAvailableTimeSlots = async (req, res, next) => {
  const { date, serviceId } = req.body;
  if (!date || !serviceId) {
    const error = new Error("Missing required fields");
    error.status = 400;
    return next(error);
  }

  try {
    const service = await getServicefromDB(serviceId);
    if (!service) {
      const error = new Error("Service not found");
      error.status = 404;
      return next(error);
    }
    const now = new Date();
    const nowTime = now.toISOString().split("T")[1].split(".")[0].slice(0, 5);
    if (date < now.toISOString().split("T")[0]) {
      const error = new Error("Date cannot be in the past");
      error.status = 400;
      return next(error);
    }
    const shopHours = await getDayConfigfromDB(
      new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
    );
    if (shopHours.isClosed) {
      return res.status(200).json({ availableTimeSlots: [] });
    }
    // if (nowTime > shopHours.closingTime) {
    //   const error = new Error("No available time slots for the selected date");
    //   error.status = 400;
    //   return next(error);
    // }

    const alreadyBooked = await getAppointmentsByDatefromDB(date, "confirmed");
    const timeSlots = [];
    const openingTime = shopHours.openingTime;
    const closingTime = shopHours.closingTime;
    let currentTime = nowTime > openingTime ? nowTime : openingTime;

    while (currentTime < closingTime) {
      const endTime = calculateEndTime(currentTime, service.duration);
      if (endTime > closingTime) {
        break;
      }
      const isBooked = alreadyBooked.some((appointment) => {
        const appointmentStartTime = appointment.startTime;
        const appointmentEndTime = appointment.endTime;

        return (
          (currentTime >= appointmentStartTime &&
            currentTime < appointmentEndTime) ||
          (endTime > appointmentStartTime && endTime <= appointmentEndTime)
        );
      });
      if (!isBooked) {
        timeSlots.push({ start: currentTime, end: endTime });
      }
      const [currentHour, currentMinute] = currentTime.split(":").map(Number);
      const totalMinutes = currentHour * 60 + currentMinute + 15;
      const nextHour = Math.floor(totalMinutes / 60) % 24;
      const nextMinute = totalMinutes % 60;
      currentTime = `${nextHour.toString().padStart(2, "0")}:${nextMinute
        .toString()
        .padStart(2, "0")}`;
    }
    res.status(200).json({ availableTimeSlots: timeSlots });
  } catch (error) {
    return next(error);
  }
};

// @route   POST /api/v1/appointments
// @desc    Create a new appointment
const createAppointment = async (req, res, next) => {
  const {
    date,
    startTime,
    serviceId,
    customerFirstName,
    customerLastName,
    customerPhoneNumber,
  } = req.body;

  if (
    !date ||
    !startTime ||
    !serviceId ||
    !customerFirstName ||
    !customerLastName ||
    !customerPhoneNumber
  ) {
    const error = new Error("Missing required fields");
    error.status = 400;
    return next(error);
  }
  try {
    const service = await getServicefromDB(serviceId);

    if (!service) {
      const error = new Error("Service not found");
      error.status = 404;
      return next(error);
    }
    if (service.staus === 0) {
      const error = new Error("Service is currently unavailable");
      error.status = 404;
      return next(error);
    }
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      const error = new Error("Appointment date cannot be in the past");
      error.status = 400;
      return next(error);
    }
    const endTime = calculateEndTime(startTime, service.duration);
    const shopHours = await getDayConfigfromDB(
      new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
    );
    if (shopHours.isClosed) {
      const error = new Error("Shop is closed on the selected date");
      error.status = 400;
      return next(error);
    }
    const normalize = (time) => time.slice(0, 5);
    if (
      normalize(startTime) < normalize(shopHours.openingTime) ||
      normalize(endTime) > normalize(shopHours.closingTime)
    ) {
      const error = new Error(
        `Appointment time must be within shop hours: ${shopHours.openingTime} - ${shopHours.closingTime}`,
      );
      error.status = 400;
      return next(error);
    }
    const alreadyBooked = await getAppointmentsByDatefromDB(date, "confirmed");
    const isTimeSlotAvailable = !alreadyBooked.some((appointment) => {
      const appointmentStartTime = normalize(appointment.startTime);
      const appointmentEndTime = normalize(appointment.endTime);

      return (
        (startTime >= appointmentStartTime && startTime < appointmentEndTime) ||
        (endTime > appointmentStartTime && endTime <= appointmentEndTime)
      );
    });
    if (!isTimeSlotAvailable) {
      const error = new Error("Time slot is already booked");
      error.status = 400;
      return next(error);
    }
    let customer = await getCustomerfromDBbyPhone(customerPhoneNumber);
    if (!customer) {
      customer = await createCustomerintoDB(
        customerFirstName,
        customerLastName,
        customerPhoneNumber,
      );
    }
    const newAppointment = {
      appointmentDate: date,
      startTime,
      endTime,
      serviceId,
      customerId: customer.insertId || customer.id,
      status: "confirmed",
    };
    const createdAppointment = await createAppointmentintoDB(newAppointment);
    const appointment = {
      id: createdAppointment.insertId,
    };

    res.status(201).json(appointment);
  } catch (error) {
    return next(error);
  }
};

// @route   PUT /api/v1/appointments/:id
// @desc    Update an appintment status (e.g., confirm, cancel, complete)
const cancelAppointment = async (req, res, next) => {
  const appointmentId = parseInt(req.params.id);
  const { status } = req.body;
  if (status !== "cancelled") {
    const error = new Error("Invalid status value");
    error.status = 400;
    return next(error);
  }
  if (!appointmentId) {
    const error = new Error("Invalid appointment ID");
    error.status = 400;
    return next(error);
  }
  try {
    const appointment = await getAppointmentfromDB(appointmentId);
    if (!appointment) {
      const error = new Error("Appointment not found");
      error.status = 404;
      return next(error);
    }
    if (appointment.status === "canceled") {
      const error = new Error("Appointment is already canceled");
      error.status = 400;
      return next(error);
    }
    if (appointment.status === "completed") {
      const error = new Error("Completed appointment cannot be canceled");
      error.status = 400;
      return next(error);
    }
    const updatedAppointment = await cancelAppointmentStatusintoDB(
      status,
      appointmentId,
    );
    res.status(200).json({ id: appointmentId, status });
  } catch (error) {
    return next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  const appointmentId = parseInt(req.params.id);
  const { status } = req.body;
  if (!["confirmed", "cancelled", "completed"].includes(status)) {
    const error = new Error("Invalid status value");
    error.status = 400;
    return next(error);
  }
  if (!appointmentId) {
    const error = new Error("Invalid appointment ID");
    error.status = 400;
    return next(error);
  }
  try {
    const appointment = await getAppointmentfromDB(appointmentId);
    if (!appointment) {
      const error = new Error("Appointment not found");
      error.status = 404;
      return next(error);
    }
    const updatedAppointment = await updateAppointmentStatusintoDB(
      status,
      appointmentId,
    );
    res.status(200).json({ id: appointmentId, status });
  } catch (error) {
    return next(error);
  }
};
export {
  getAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  updateAppointment,
  getAvailableTimeSlots,
};
