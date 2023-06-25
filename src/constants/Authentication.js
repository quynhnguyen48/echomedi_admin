export const JWT_TOKEN = "TRAYCE_ADMIN_TOKEN";
export const BRANCH = "ECHOMEDI_BRANCH";

export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  AUTHENTICATED: "authenticated",
  PUBLIC: "public",
  DOCTOR: "doctor",
  NURSE: "nurse",
  PHARMACIST: "pharmacist",
  CARE_CONCIERGE: "care_concierge"
};

export const STAFF_ROLES = [USER_ROLE.SUPER_ADMIN];

export const STAFF_ROLES_TITLE = {
  [USER_ROLE.SUPER_ADMIN]: "Super Admin",
};
