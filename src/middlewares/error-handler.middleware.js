import crypto from "crypto";

const ERROR_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "INTERNAL_SERVER_ERROR",
};

const DB_ERRORS = {
  "23505": { status: 409, msg: "Ushbu ma'lumot bazada allaqachon mavjud." },
  "23503": { status: 400, msg: "Bog'langan ma'lumot topilmadi (Foreign key error)." },
  "22P02": { status: 400, msg: "Yuborilgan ma'lumot formati noto'g'ri." },
  "23502": { status: 400, msg: "Majburiy maydonlar to'ldirilmagan." },
};

const errorHandler = (err, req, res, next) => {
  console.error("Global error handler catch:", err);

  let statusCode = 500;
  let message = err.message || "Serverda kutilmagan xatolik yuz berdi.";

  // Drizzle ORM xatoni err.cause ichiga o'raydi — uni ochib olamiz
  const pgErr = err.cause ?? err;

  // 1. PostgreSQL xatolarini tahlil qilish
  if (pgErr.code && DB_ERRORS[pgErr.code]) {
    statusCode = DB_ERRORS[pgErr.code].status;
    message = DB_ERRORS[pgErr.code].msg;

    if (pgErr.code === "23505" && pgErr.detail) {
      const fieldMatch = pgErr.detail.match(/\((.*?)\)/);
      if (fieldMatch?.[1]) {
        message = `Ushbu '${fieldMatch[1]}' bazada allaqachon mavjud.`;
      }
    }
  }
  // 2. Custom Errorlar (Controller yoki Service dan kelgan)
  else if (typeof err.statusCode === "number" || (typeof err.code === "number" && ERROR_CODES[err.code])) {
    statusCode = err.statusCode || err.code;
    message = err.message;
  }

  const errorCode = ERROR_CODES[statusCode] || "INTERNAL_SERVER_ERROR";

  const body = {
    success: false,
    message: message,
    error: {
      code: errorCode,
      statusCode,
    },
  };

  // 500 xatoliklar uchun debug ma'lumotlari
  if (statusCode === 500) {
    body.error.requestId = `req_${crypto.randomBytes(6).toString("hex")}`;
    if (process.env.NODE_ENV !== 'production') {
        body.error.details = err.message; 
    }
  }

  res.status(statusCode).json(body);
};

export default errorHandler;