// @route   GET /api/v1/dashboard

import { getAppointmentsfromDB, getServicefromDB } from "../database.js";

// @desc    Get  dashboard data
export const getdasboardData = async (req, res) => {
  const totalAppointments = await getAppointmentsfromDB();
  const today = new Date().toISOString().split("T")[0];
  const upcomingAppointments = totalAppointments.filter(
    (appointment) =>
      appointment.date >= today && appointment.status === "confirmed",
  );
  const completedAppointments = totalAppointments.filter(
    (appointment) => appointment.status === "completed",
  );
  const coonfirmedAppointments = totalAppointments.filter(
    (appointment) => appointment.status === "confirmed",
  );
  const cancelledAppointments = totalAppointments.filter(
    (appointment) => appointment.status === "cancelled",
  );

  let serviceCountArray = [];
  totalAppointments.forEach((appointment) => {
    const serviceId = serviceCountArray.find(
      (service) => service.id === appointment.serviceId,
    );
    if (serviceId) {
      serviceId.count += 1;
    } else {
      serviceCountArray.push({ id: appointment.serviceId, count: 1 });
    }
  });

  const mostPopularService = serviceCountArray.reduce(
    (max, service) => {
      return service.count > max.count ? service : max;
    },
    { id: null, count: 0 },
  );

  const service = await getServicefromDB(mostPopularService.id);

  const dashboardData = {
    totalAppointments: totalAppointments.length,
    upcomingAppointments: {
      count: upcomingAppointments.length,
      appointments: upcomingAppointments,
    },
    completedAppointments: completedAppointments.length,
    confirmedAppointments: coonfirmedAppointments.length,
    cancelledAppointments: cancelledAppointments.length,
    mostPopularService: service
      ? { id: service.id, name: service.name, count: mostPopularService.count }
      : null,
  };

  res.status(200).json(dashboardData);
};
