export const welderStatus = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 0,
});

const StatusTranslations = {
  1: "Активный",
  0: "Неактивный",
};

export const welderStatusOptions = [
  {
    value: welderStatus.ACTIVE,
    label: StatusTranslations[welderStatus.ACTIVE],
  },
  {
    value: welderStatus.INACTIVE,
    label: StatusTranslations[welderStatus.INACTIVE],
  },
];

export const getWelderStatusText = (statusId) => {
  return StatusTranslations[statusId] ?? "Неизвестный";
};
