import mysql from "mysql2";

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

//  SERVICES RELATED QUERIES
export async function getServicesfromDB(status) {
  const [row] = await pool.query(
    `
      SELECT * FROM services
      ${status !== undefined ? "WHERE status = ?" : ""}

      `,
    status !== undefined ? [status] : [],
  );
  return row;
}
export async function getServicefromDB(id) {
  const [row] = await pool.query(
    `
      SELECT * FROM services
      WHERE id = ?
      `,
    [id],
  );
  return row[0];
}

export async function createServiceintoDB(name, price, duration) {
  const [row] = await pool.query(
    `INSERT INTO services (name, price, duration,status) 
    VALUES (?, ?)`,
    [name, price, duration, true],
  );
  return row;
}

export async function updateServiceintoDB(name, price, duration, id) {
  const [row] = await pool.query(
    `
    UPDATE services 
    SET name = ?, price = ?, duration = ?
    WHERE id = ?
    `,
    [name, price, duration, id],
  );
  return row;
}
export async function updateServiceStatusInDb(status, id) {
  const [row] = await pool.query(
    `
    UPDATE services 
    SET status = ?  
    WHERE id = ?
    `,
    [status, id],
  );
  return row;
}

// CUSTOMERS RELATED QUERIES
export async function getCustomersfromDB() {
  const [row] = await pool.query(
    `
      SELECT * FROM customers
      `,
  );
  return row;
}
export async function getCustomerfromDB(id) {
  const [row] = await pool.query(
    `
      SELECT * FROM customers
      WHERE id = ?
      `,
    [id],
  );
  return row[0];
}
export async function getCustomerfromDBbyPhone(phonenumber) {
  const [row] = await pool.query(
    `
      SELECT * FROM customers
      WHERE phonenumber = ?
      `,
    [phonenumber],
  );
  return row[0];
}

export async function createCustomerintoDB(firstname, lastname, phonenumber) {
  const [row] = await pool.query(
    `INSERT INTO customers (firstname,lastname, phonenumber) 
    VALUES (?, ?, ?)`,
    [firstname, lastname, phonenumber],
  );
  return row;
}

export async function updateCustomerintoDB(
  firstname,
  lastname,
  phonenumber,
  id,
) {
  const [row] = await pool.query(
    `
    UPDATE customers 
    SET firstname = ?, lastname= ?, phonenumber = ?
    WHERE id = ?
    `,
    [firstname, lastname, phonenumber, id],
  );
  return row;
}

// SHOP HOURS CONFIG

export async function getShopHoursfromDB() {
  const [row] = await pool.query(
    `
      SELECT * FROM shop_hours;
      `,
  );
  return row;
}
export async function getDayConfigfromDB(day) {
  const [row] = await pool.query(
    `
      SELECT * FROM shop_hours
      WHERE day = ?;
      `,
    [day],
  );
  return row[0];
}

export async function createShopHoursintoDB(
  day,
  openingTime,
  closingTime,
  isClosed,
) {
  const [row] = await pool.query(
    `INSERT INTO shop_hours (day, openingTime, closingTime, isClosed) 
    VALUES (?, ?, ?, ?)`,
    [day, openingTime, closingTime, isClosed],
  );
  return row;
}

export async function bulkcreateShopHoursintoDB(shopHours) {
  const values = shopHours.map((hour) => [
    hour.day,
    hour.openingTime,
    hour.closingTime,
    hour.isClosed,
  ]);
  const [row] = await pool.query(
    `INSERT INTO shop_hours (day, openingTime, closingTime, isClosed) 
    VALUES ?`,
    [values],
  );
  return row;
}

export async function bulkupdateShopHoursintoDB(shopHours) {
  // const promises = shopHours.map((hour) =>
  //   pool.query(
  //     `
  //   UPDATE shop_hours
  //   SET openingTime = ?, closingTime = ?, isClosed = ?
  //   WHERE day = ?
  //   `,
  //     [hour.openingTime, hour.closingTime, hour.isClosed, hour.day],
  //   ),
  // );
  // return Promise.all(promises);

  shopHours.forEach(async (hour) => {
    await pool.query(
      `
    UPDATE shop_hours 
    SET openingTime = ?, closingTime = ?, isClosed = ?
    WHERE day = ?
    `,
      [hour.openingTime, hour.closingTime, hour.isClosed, hour.day],
    );
  });
  return getShopHoursfromDB();
}

export async function updateSingleDayShopHoursintoDB(
  day,
  openingTime,
  closingTime,
  isClosed,
) {
  const [row] = await pool.query(
    `
    UPDATE shop_hours 
    SET openingTime = ?, closingTime = ?, isClosed = ?
    WHERE day = ?
    `,
    [openingTime, closingTime, isClosed, day],
  );
  return row;
}

// APPOINTMENTS RELATED QUERIES
export async function getAppointmentsfromDB(status) {
  const [row] = await pool.query(
    `
      SELECT * FROM appointments
       ${status !== undefined ? "WHERE status = ?" : ""}
      `,
    status !== undefined ? [status] : [],
  );
  return row;
}

export async function getAppointmentfromDB(id) {
  const [row] = await pool.query(
    `
      SELECT * FROM appointments
      WHERE id = ?
      `,
    [id],
  );
  return row[0];
}

export async function getAppointmentsByDatefromDB(date, status) {
  const [row] = await pool.query(
    `
      SELECT * FROM appointments
      WHERE appointmentDate = ? ${status ? "AND status = ?" : ""} 
      `,
    [date, status ? status : ""],
  );
  return row;
}
export async function createAppointmentintoDB(appointment) {
  const { appointmentDate, startTime, endTime, serviceId, customerId, status } =
    appointment;

  console.log(appointment, "got to query");
  const [row] = await pool.query(
    `INSERT INTO appointments (appointmentDate,startTime,endTime,serviceId,customerId,status) 
    VALUES (?, ?, ?,?,?,?)`,
    [appointmentDate, startTime, endTime, serviceId, customerId, status],
  );
  return row;
}
export async function cancelAppointmentStatusintoDB(status, id) {
  console.log(status, id);
  const [row] = await pool.query(
    `
    UPDATE appointments 
    SET status = ?  
    WHERE id = ?
    `,
    [status, id],
  );
  return row;
}
export async function updateAppointmentStatusintoDB(status, id) {
  const [row] = await pool.query(
    `
    UPDATE appointments 
    SET status = ?  
    WHERE id = ?
    `,
    [status, id],
  );
  return row;
}
