/** Hidden form fields posted into the Pesaflow / eCitizen iframe. */
export type ECitizenCheckoutFields = {
  apiClientID: string;
  serviceID: string | number;
  billDesc: string;
  currency: string;
  billRefNumber: string;
  clientMSISDN: string | number;
  clientName: string;
  clientIDNumber: string;
  clientEmail: string;
  callBackURLONSuccess: string;
  amountExpected: string | number;
  notificationURL: string;
  secureHash: string;
  format: string;
  sendSTK: string;
  [key: string]: string | number | undefined;
};

/** Response from POST /ecitizen/initiate-checkout */
export type ECitizenCheckoutSession = {
  url: string;
  fields: ECitizenCheckoutFields;
};

/** @deprecated Prefer ECitizenCheckoutFields */
export type ECitizenPayload = ECitizenCheckoutFields;
