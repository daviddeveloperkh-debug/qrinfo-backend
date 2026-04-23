export const userStatus = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 0,
});

const StatusTranslations = {
  1: "Активный",
  0: "Неактивный",
};

export const userStatusOptions = [
  {
    value: userStatus.ACTIVE,
    label: StatusTranslations[userStatus.ACTIVE],
  },
  {
    value: userStatus.INACTIVE,
    label: StatusTranslations[userStatus.INACTIVE],
  },
];

export const getStatusText = (statusId) => {
  return StatusTranslations[statusId] || "Неизвестный";
};
