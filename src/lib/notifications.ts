
import { NotificationChannel, YesNo } from "../config/config";
import { apiRequest } from "./api";
import { getValidAuthToken } from "./auth";

export enum NotificationStatus {
  Pending = "Pending",
  Sent = "Sent",
}

export enum MessageFolderType {
  All = "all",
  Inbox = "inbox",
  Sent = "sent",
  Draft = "draft",
  Archive = "archive",
  Spam = "spam",
  Trash = "trash",
  Starred = "starred",
  Important = "important",
}

export interface Notification {
  notificationID?: string;
  templateID?: string | null;
  messageTitle: string;
  moduleCode?: string;
  messageBody: string | null;
  sender?: string;
  recipient: string;
  messageFolderType?: MessageFolderType | string;
  notificationDate?: string | Date;
  sendingCost?: number;
  messageType: NotificationChannel;
  userID?: string;
  notificationStatus?: NotificationStatus;
  isRead?: YesNo;
  isStarred?: YesNo;
  isImportant?: YesNo;
  tags?: string[];
  companyID?: string;
  ownerID?: string | null;
  remoteMessageID?: string | null;
  extraData?: Record<string, any>;
  attachments: any[];
}

export interface NotificationFilter {
  where?: Record<string, any>;
  fields?: Record<string, any>;
  include?: any[];
  order?: string[];
  limit?: number;
  skip?: number;
}

export interface MailboxOptions {
  userID?: string;
  folder?: MessageFolderType | string;
  starred?: string;
  important?: string;
  tags?: string;
  channel?: NotificationChannel | string;
  search?: string;
  limit?: number;
  skip?: number;
}

/**
 * Execute an authenticated notification API request.
 */
async function notificationRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const token = getValidAuthToken();

  return apiRequest<T>(path, {
    ...(token ? { token } : {}),
    method: options.method || "GET",
    ...(options.body !== undefined ? { body: options.body } : {}),
  });
}

/**
 * Get all notifications.
 * GET /notifications?filter={filter}
 */
export async function getAll(
  filter: NotificationFilter = {},
): Promise<Notification[]> {
  const query = encodeURIComponent(JSON.stringify(filter));

  return notificationRequest<Notification[]>(
    `/notifications?filter=${query}`,
  );
}

/**
 * Get a notification by ID.
 * GET /notifications/{id}
 */
export async function getById(id: string): Promise<Notification> {
  const notificationID = id.trim();

  if (!notificationID) {
    throw new Error("A notification ID is required.");
  }

  return notificationRequest<Notification>(
    `/notifications/${encodeURIComponent(notificationID)}`,
  );
}

/**
 * Create a notification.
 * POST /notifications
 */
export async function createNotification(
  payload: Notification,
): Promise<Notification> {
  return notificationRequest<Notification>("/notifications", {
    method: "POST",
    body: payload,
  });
}

/**
 * Send a notification.
 * POST /notifications/send
 */
export async function sendNotification(
  payload: any,
): Promise<any> {
  return notificationRequest<any>("/notifications/send", {
    method: "POST",
    body: payload,
  });
}

/**
 * Update a notification.
 * PATCH /notifications/{id}
 */
export async function updateNotification(
  id: string,
  data: Partial<Notification>,
): Promise<Notification> {
  const notificationID = id.trim();

  if (!notificationID) {
    throw new Error("A notification ID is required.");
  }

  return notificationRequest<Notification>(
    `/notifications/${encodeURIComponent(notificationID)}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}

/**
 * Delete a notification.
 * DELETE /notifications/{id}
 */
export async function deleteNotification(id: string): Promise<any> {
  const notificationID = id.trim();

  if (!notificationID) {
    throw new Error("A notification ID is required.");
  }

  return notificationRequest<any>(
    `/notifications/${encodeURIComponent(notificationID)}`,
    { method: "DELETE" },
  );
}

/**
 * Delete multiple notifications.
 * DELETE /notifications?where={where}
 */
export async function deleteManyNotifications(
  where: Record<string, any>,
): Promise<any> {
  const query = encodeURIComponent(JSON.stringify(where));

  return notificationRequest<any>(
    `/notifications?where=${query}`,
    { method: "DELETE" },
  );
}

/**
 * Update multiple notifications.
 * PATCH /notifications?where={where}
 */
export async function updateManyNotifications(
  where: Record<string, any>,
  data: Partial<Notification>,
): Promise<any> {
  const query = encodeURIComponent(JSON.stringify(where));

  return notificationRequest<any>(
    `/notifications?where=${query}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}

/**
 * Get mailbox notifications using the supplied filters.
 */
export async function getMailbox({
  userID,
  folder = MessageFolderType.All,
  starred = "All",
  important = "All",
  tags = "All",
  channel,
  search,
  limit,
  skip,
}: MailboxOptions = {}): Promise<Notification[]> {
  const where: Record<string, any> = {};

  if (userID) where.userID = userID;

  if (folder !== MessageFolderType.All) {
    where.messageFolderType = folder;
  }

  if (starred !== "All") {
    where.isStarred = YesNo.Yes;
  }

  if (important !== "All") {
    where.isImportant = YesNo.Yes;
  }

  if (tags !== "All") {
    where.tags = { inq: [tags] };
  }

  if (channel) {
    where.messageType = channel;
  }

  if (search?.trim()) {
    const value = search.trim();

    where.or = [
      { messageTitle: { like: value } },
      { messageBody: { like: value } },
      { sender: { like: value } },
      { recipient: { like: value } },
    ];
  }

  return getAll({
    where,
    order: ["notificationDate DESC"],
    limit,
    skip,
  });
}

/**
 * Get notifications by channel.
 */
export async function getByChannel(
  messageType: NotificationChannel,
  options: Omit<MailboxOptions, "channel"> = {},
): Promise<Notification[]> {
  return getMailbox({
    ...options,
    channel: messageType,
  });
}

/**
 * Get email notifications.
 */
export async function getEmails(
  options: Omit<MailboxOptions, "channel"> = {},
): Promise<Notification[]> {
  return getByChannel(NotificationChannel.Email, options);
}

/**
 * Get SMS notifications.
 */
export async function getSms(
  options: Omit<MailboxOptions, "channel"> = {},
): Promise<Notification[]> {
  return getByChannel(NotificationChannel.Sms, options);
}

/**
 * Get push notifications.
 */
export async function getPushNotifications(
  options: Omit<MailboxOptions, "channel"> = {},
): Promise<Notification[]> {
  return getByChannel(NotificationChannel.Push, options);
}

/**
 * Get unread notifications.
 */
export async function getUnread(
  userID?: string,
  messageType?: NotificationChannel,
): Promise<Notification[]> {
  return getMailbox({
    userID,
    channel: messageType,
  });
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(id: string): Promise<Notification> {
  return updateNotification(id, {
    isRead: YesNo.Yes,
  });
}

/**
 * Mark a notification as unread.
 */
export async function markAsUnread(id: string): Promise<Notification> {
  return updateNotification(id, {
    isRead: YesNo.No,
  });
}

/**
 * Mark multiple notifications as read.
 */
export async function markManyAsRead(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isRead: YesNo.Yes },
  );
}

/**
 * Mark multiple notifications as unread.
 */
export async function markManyAsUnread(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isRead: YesNo.No },
  );
}

/**
 * Star a notification.
 */
export async function star(id: string): Promise<Notification> {
  return updateNotification(id, {
    isStarred: YesNo.Yes,
  });
}

/**
 * Unstar a notification.
 */
export async function unstar(id: string): Promise<Notification> {
  return updateNotification(id, {
    isStarred: YesNo.No,
  });
}

/**
 * Star multiple notifications.
 */
export async function starMany(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isStarred: YesNo.Yes },
  );
}

/**
 * Unstar multiple notifications.
 */
export async function unstarMany(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isStarred: YesNo.No },
  );
}

/**
 * Mark a notification as important.
 */
export async function markImportant(id: string): Promise<Notification> {
  return updateNotification(id, {
    isImportant: YesNo.Yes,
  });
}

/**
 * Remove the important flag from a notification.
 */
export async function markNotImportant(id: string): Promise<Notification> {
  return updateNotification(id, {
    isImportant: YesNo.No,
  });
}

/**
 * Mark multiple notifications as important.
 */
export async function markImportantMany(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isImportant: YesNo.Yes },
  );
}

/**
 * Remove the important flag from multiple notifications.
 */
export async function markNotImportantMany(ids: string[]): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { isImportant: YesNo.No },
  );
}

/**
 * Move a notification to another folder.
 */
export async function move(
  id: string,
  messageFolderType: MessageFolderType | string,
): Promise<Notification> {
  return updateNotification(id, {
    messageFolderType,
  });
}

/**
 * Move multiple notifications to another folder.
 */
export async function moveMany(
  ids: string[],
  messageFolderType: MessageFolderType | string,
): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { messageFolderType },
  );
}

/**
 * Move a notification to trash.
 */
export async function trash(id: string): Promise<Notification> {
  return move(id, MessageFolderType.Trash);
}

/**
 * Move multiple notifications to trash.
 */
export async function trashMany(ids: string[]): Promise<any> {
  return moveMany(ids, MessageFolderType.Trash);
}

/**
 * Archive multiple notifications.
 */
export async function archiveMany(ids: string[]): Promise<any> {
  return moveMany(ids, MessageFolderType.Archive);
}

/**
 * Restore multiple notifications to a folder.
 */
export async function restoreMany(
  ids: string[],
  folder: MessageFolderType | string = MessageFolderType.Inbox,
): Promise<any> {
  return moveMany(ids, folder);
}

/**
 * Mark multiple notifications as spam.
 */
export async function spamMany(ids: string[]): Promise<any> {
  return moveMany(ids, MessageFolderType.Spam);
}

/**
 * Update notification tags.
 */
export async function updateTags(
  id: string,
  tags: string[],
): Promise<Notification> {
  return updateNotification(id, { tags });
}

/**
 * Update tags for multiple notifications.
 */
export async function updateManyTags(
  ids: string[],
  tags: string[],
): Promise<any> {
  return updateManyNotifications(
    { notificationID: { inq: ids } },
    { tags },
  );
}

/**
 * Add tags to multiple notifications.
 */
export async function addTags(
  notifications: Notification[],
  tags: string[],
): Promise<any> {
  const ids = notifications
    .map((item) => item.notificationID)
    .filter(Boolean) as string[];

  if (!ids.length) return;

  const existingTags = [
    ...new Set(notifications.flatMap((item) => item.tags || [])),
  ];

  const mergedTags = [
    ...new Set([...existingTags, ...tags]),
  ];

  return updateManyTags(ids, mergedTags);
}

/**
 * Remove tags from multiple notifications.
 */
export async function removeTags(
  notifications: Notification[],
  tags: string[],
): Promise<any> {
  const ids = notifications
    .map((item) => item.notificationID)
    .filter(Boolean) as string[];

  if (!ids.length) return;

  const remove = new Set(tags);

  const remainingTags = [
    ...new Set(notifications.flatMap((item) => item.tags || [])),
  ].filter((tag) => !remove.has(tag));

  return updateManyTags(ids, remainingTags);
}

/**
 * Delete multiple notifications by IDs.
 */
export async function deleteMany(ids: string[]): Promise<any> {
  return deleteManyNotifications({
    notificationID: { inq: ids },
  });
}

/**
 * Get remote emails.
 * GET /notifications/remote-emails
 */
export async function getRemoteEmails(): Promise<any> {
  return notificationRequest<any>("/notifications/remote-emails");
}

/**
 * Refresh mailbox notifications.
 */
export async function refresh(
  options: MailboxOptions = {},
): Promise<Notification[]> {
  if (options.channel) {
    return getByChannel(
      options.channel as NotificationChannel,
      options,
    );
  }

  return getMailbox(options);
}
