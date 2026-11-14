
export const REACT_DEFAULT_PROPS = {

    countryCode: "+254",
    currency: "KES",
  
    dayFormat: "dd",
    dayMonthFormat: "MMM dd",
    yearMonthFormat: "MMM yyyy",
    yearFormat: "yyyy",
  
    dateFormat: "yyyy-MM-dd",
    dateFormatUK: "dd MMM yyyy",
  
    dateTimeFormat: "yyyy-MM-dd hh:mm a",
    dateTimeFormatUK: "dd MMM yyyy hh:mm a",
  
    dateMomentFormat: "YYYY-MM-DDTHH:mm:ss",
    timeFormat: "hh:mm a",
  
    pageSize: 10,
}

export enum YesNo {
    Yes = "Y",
    No = "N",
}

export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other',
}
  
export type YesNoOrNull = YesNo | null | undefined;
 
export enum NotificationChannel{
    Sms = 'sms',
    Email = 'email',
    Inline = 'inline',
    QrCode = 'qr-code',
    Push = "push"
}