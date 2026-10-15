export interface ECitizenPayload {
    apiClientID: string;
    serviceID: number;
    billDesc: string;
    currency: string;
    billRefNumber: string;
    clientMSISDN: number;
    clientName: string;
    clientIDNumber: string;
    clientEmail: string;
    callBackURLONSuccess: string;
    amountExpected: number;
    notificationURL: string;
    secureHash: string;
    format: string;
    sendSTK: string;
}