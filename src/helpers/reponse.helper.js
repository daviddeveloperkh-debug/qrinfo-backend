export const responseSuccess = (message, data = null) => ({
  success: true,
  message,
  ...(data !== null && { data }),
});

export const responsePaginated = (message, data, pagination) => ({
  success: true,
  message,
  data,
  pagination: {
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(pagination.total / pagination.limit),
    hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
    hasPrevPage: pagination.page > 1,
  },
});

export const responseError = (message, code, statusCode) => ({
  success: false,
  message,
  error: {
    code,
    statusCode,
  },
});

export const responseValidationError = (message, errors) => ({
  success: false,
  message,
  errors,
});
