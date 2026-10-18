export const RegistrationStep = {
  PARTICIPATION: 1,
  DETAILS: 2,
  PAYMENT: 3,
  CONFIRMATION: 4,
} as const;

export type RegistrationStep =
  (typeof RegistrationStep)[keyof typeof RegistrationStep];
