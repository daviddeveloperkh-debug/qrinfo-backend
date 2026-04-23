const ADMIN = 1;
const SUPER_ADMIN = 2;

export const ROLE_NAME = {
  [ADMIN]: "Admin",
  [SUPER_ADMIN]: "Super Admin",
};

export const userRoleOptions = [
  {
    value: ADMIN,
    label: ROLE_NAME[ADMIN],
  },
  {
    value: SUPER_ADMIN,
    label: ROLE_NAME[SUPER_ADMIN],
  },
];

export default {
  ADMIN,
  SUPER_ADMIN,
};
