import { format } from 'date-fns';
import { REACT_DEFAULT_PROPS } from '../config/config';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { FileImage, FileText, FileSpreadsheet, FileArchive, File } from 'lucide-react';

const isNumber = (val: unknown): val is number => typeof val === 'number';

export interface CustomDateFormatProps {
  dateFormat?: string;
  value?: string | number | Date | null;
  defaultValue?: string;
}

interface CustomRelativeDateFormatProps {
  value?: string | number | Date | null;
  textOnly?: boolean;
  className?: string;
}

export interface NamedItem {
  name: string;
}

/**
 * Formats a date into a string.
 */
export const formatDateTime = (
  value?: string | number | Date | null,
  dateFormat?: string,
  defaultValue = "None"
): string => {
  if (!value) return defaultValue;

  const date = isNumber(value)
    ? new Date(Number(value) * 1000) // Unix timestamp (seconds)
    : new Date(value);

  return format(
    new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000),
    dateFormat || (window as any)?.REACT_DEFAULT_PROPS?.dateFormat || REACT_DEFAULT_PROPS.dateFormatUK
  );
};

/**
 * React component.
 */
export const CustomDateFormat: React.FC<CustomDateFormatProps> = ({
  value,
  dateFormat,
  defaultValue = "None",
}) => <>{formatDateTime(value, dateFormat, defaultValue)}</>;

/**
 * Returns a relative time string.
 */
export const timeAgo = (
  value?: string | number | Date | null,
  suffix = "ago",
  prefix = "In"
): string => {
  if (!value) return "None";

  const periods = [
    "sec",
    "min",
    "hr",
    "day",
    "week",
    "month",
    "year",
    "decade",
  ];

  const lengths = [60, 60, 24, 7, 4.35, 12, 10];

  const now = Date.now() / 1000;

  const time = isNumber(value)
    ? Number(value)
    : new Date(value).getTime() / 1000;

  let difference = now - time;
  const isPast = difference >= 0;
  difference = Math.abs(difference);

  let index = 0;

  while (index < lengths.length - 1 && difference >= lengths[index]) {
    difference /= lengths[index];
    index++;
  }

  const amount = Math.round(difference);
  const period = amount === 1 ? periods[index] : `${periods[index]}s`;

  return isPast
    ? `${amount} ${period} ${suffix}`
    : `${prefix} ${amount} ${period}`;
};

/**
 * React component for relative format
 */
export const CustomRelativeDateFormat: React.FC<
  CustomRelativeDateFormatProps
> = ({
  value,
  textOnly = false,
  className = "",
}) => {
  const text = timeAgo(value);

  if (textOnly) return <>{text}</>;

  const isPast =
    value &&
    (isNumber(value)
      ? Number(value) <= Date.now() / 1000
      : new Date(value).getTime() <= Date.now());

  return (
    <span
      className={`${isPast ? "text-danger" : "text-primary"} ${className}`}
    >
      {text}
    </span>
  );
};

/**
 * Reduces an array of items into a few visible items, retaining count 
 */
export const minimizeItemsDisplayed = <T,>(
  items: T[] = [],
  getLabel: (item: T) => string,
  visibleCount = 1
): string => {
  const labels = items
    .map(getLabel)
    .filter(Boolean);

  if (!labels.length) return "None";

  if (labels.length <= visibleCount) {
    return labels.join(", ");
  }

  return `${labels.slice(0, visibleCount).join(", ")} +${
    labels.length - visibleCount
  } more`;
};

export const isNullishOrEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

export const toTitleCase = (
  value?: string | null,
  force = false
): string => {
  if (!value) return "";

  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (
        !force &&
        word.length <= 4 &&
        word === word.toUpperCase() &&
        /[A-Z]/.test(word)
      ) {
        return word;
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      );
    })
    .join(" ");
};

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload & { exp?: number }>(token);
    if (!decoded.exp) return false;

    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(decimals)} ${units[index]}`;
};

export const formatEmailDisplay = (
  value?: string | null,
  showEmail: boolean = false
): string => {
  if (!value?.trim()) return "";

  const input = value.trim();

  const match = input.match(/^(?:"([^"]+)"|([^<]+))\s*<([^>]+)>$/);

  if (match) {
      const displayName = (match[1] || match[2])?.trim();
      const email = match[3]?.trim();

      if (showEmail) {
          return displayName
              ? `${displayName} <${email}>`
              : email;
      }

      return displayName || email;
  }

  const emailOnly = input.match(/^<([^>]+)>$/);

  if (emailOnly) {
      return emailOnly[1].trim();
  }

  return input;
};

export const extractEmailAddress = (value?: string | null): string => {
  if (!value?.trim()) return "";

  const input = value.trim();
  const match = input.match(/<([^>]+)>/);

  if (match) {
      return match[1].trim();
  }
  
  return input;
};

export const formatTrendDate = (
  date: string | Date,
  options?: {
    ordinal?: boolean;
    showYear?: boolean;
    month?: "short" | "long";
  }
) => {
  const {
    ordinal = false,
    showYear = false,
    month = "short",
  } = options || {};

  const d = new Date(date);

  const day = d.getDate();

  const formattedDay = ordinal
    ? `${day}${
        day >= 11 && day <= 13
          ? "th"
          : day % 10 === 1
          ? "st"
          : day % 10 === 2
          ? "nd"
          : day % 10 === 3
          ? "rd"
          : "th"
      }`
    : day.toString().padStart(2, "0");

  const formattedMonth = d.toLocaleString("en-US", {
    month,
  });

  return `${formattedDay} ${formattedMonth}${
    showYear ? ` ${d.getFullYear()}` : ""
  }`;
};

export function getAttachmentIcon(
  mimeType?: string,
  fileName?: string
) {
  const type = mimeType?.toLowerCase() || "";
  const name = fileName?.toLowerCase() || "";

  if (
      type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
  ) {
      return <FileImage size={20} />;
  }

  if (
      type.includes("pdf") ||
      /\.(pdf)$/i.test(name)
  ) {
      return <FileText size={20} />;
  }

  if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      /\.(xls|xlsx|csv)$/i.test(name)
  ) {
      return <FileSpreadsheet size={20} />;
  }

  if (
      type.includes("zip") ||
      type.includes("compressed") ||
      /\.(zip|rar|7z|tar|gz)$/i.test(name)
  ) {
      return <FileArchive size={20} />;
  }

  if (
      type.includes("word") ||
      type.includes("document") ||
      /\.(doc|docx|txt|rtf)$/i.test(name)
  ) {
      return <FileText size={20} />;
  }

  return <File size={20} />;
}

export function formatAttachmentType(
  mimeType: string
) {
  const type = mimeType.toLowerCase();

  const types: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "Word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "Word",
      "application/vnd.ms-excel": "Excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "Excel",
      "text/csv": "CSV",
      "text/plain": "Text",
      "image/jpeg": "JPEG",
      "image/png": "PNG",
      "image/gif": "GIF",
      "application/zip": "ZIP",
  };

  return (
      types[type] ||
      type.split("/").pop()?.toUpperCase() ||
      "FILE"
  );
}


export const getMimeType = (extension: any)=>{ 
  extension = extension?.replace('.','')?.trim();
  if(extension == "doc" || extension == "docx"){
    return 'application/msword';
  }
  else if(extension == "xls" || extension == "xlsx"){
    return 'application/vnd.ms-excel';
  }
  else if(extension == "ppt" || extension == "pptx"){
    return 'application/vnd.ms-powerpoint';
  }
  else if(extension == "mp3"){
    return 'audio/mpeg3';
  }
  else if(extension == "mp4"){
    return 'audio/mpeg4';
  }
  else if(extension == "mkv"){
    return 'video/mkv';
  }
  else if(extension == "avi"){
    return 'video/avi';
  }
  else if(extension == "pdf"){
    return 'application/x-pdf';
  }
  else if(extension == "zip"){
    return 'application/zip';
  }
  else{
    return 'application/octet-stream';
  }
}

export const base64toBlob = ({ content, type='application/pdf' }: any) => {
  let blob = new Blob([content],
            { type });
      return blob;
};

export const createBase64URL = (input: any, mimeType: any) => {
  if (!input) return null;

  if (input.data && Array.isArray(input.data)) {
    const uint8 = new Uint8Array(input.data);
    const blob = new Blob([uint8], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  if (input instanceof Uint8Array) {
      const blob = new Blob([input as any], { type: mimeType });
      return URL.createObjectURL(blob);
  }

  const sanitizedString = input.replace(/[^A-Za-z0-9+/=]/g, '');
  const byteCharacters = window.atob(sanitizedString);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return URL.createObjectURL(blob);
};

export const jsonToFormData = (
  jsonData: Record<string, any> = {}
): {
  formData: FormData;
  fileKeys: string[];
} => {
  const formData = new FormData();
  const fileKeys: string[] = [];

  for (const key in jsonData) {
      if (!Object.prototype.hasOwnProperty.call(jsonData, key)) continue;

      const value = jsonData[key];
      if (value == null || typeof value === "function") continue;

      if (
          value instanceof FileList ||
          (Array.isArray(value) && value[0] instanceof File)
      ) {
          fileKeys.push(key);
          if (value.length === 1) {
              formData.append(key, value[0]);
          } else {
              Array.from(value).forEach(file =>
                  formData.append(`${key}[]`, file as File)
              );
          }
      } else if (value instanceof File || value instanceof Blob) {
          fileKeys.push(key);
          formData.append(key, value as any);
      } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
      } else {
          formData.append(key, String(value));
      }
  }

  return { formData, fileKeys };
};

export const safeObject = (r: PromiseSettledResult<any>) => r.status === "fulfilled" && r.value ? r.value : {};

export const safeArray = (r: PromiseSettledResult<any>) => r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];