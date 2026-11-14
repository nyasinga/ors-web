import { Archive, Bell, ChevronLeft, ChevronRight, Circle, CircleCheck, Filter, Inbox, Mail, MailOpen, MessageCircle, Pencil, RefreshCw, Search, Send, ShieldAlert, Star, Trash2, X, AlertCircle, StarOff, CircleX, Download, Forward, Reply, FileText, Paperclip, Bold, Italic, List, ListOrdered, AlignCenter, AlignJustify, AlignLeft, AlignRight, Code, Link, Quote, Redo2, Strikethrough, Underline, Undo2, Unlink, Upload, Users, MousePointerClick } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import { Subscript as SubscriptExtension } from "@tiptap/extension-subscript";
import { Superscript as SuperscriptExtension }  from "@tiptap/extension-superscript";
import StarterKit from "@tiptap/starter-kit";
import { jsonToFormData, extractEmailAddress, formatEmailDisplay, CustomDateFormat, getMimeType, createBase64URL, getAttachmentIcon, formatAttachmentType, formatBytes } from "../../lib/formatters";
import { NotificationChannel, REACT_DEFAULT_PROPS, YesNo } from "../../config/config";
import ConfirmationDialog from "../../components/ui/confirm";
import useConfirmation from "../../hooks/useConfirmation";

import {
    archiveMany,
    deleteMany,
    deleteNotification,
    getById,
    getMailbox,
    getRemoteEmails,
    markAsRead,
    markAsUnread,
    markImportant,
    markImportantMany,
    markManyAsRead,
    markManyAsUnread,
    markNotImportant,
    markNotImportantMany,
    MessageFolderType,
    sendNotification,
    spamMany,
    star,
    starMany,
    trash,
    trashMany,
    unstar,
    unstarMany,
    type Notification,
} from "../../lib/notifications";
export type NotificationType = | "sms" | "email" | "push";
export type FolderKey = "inbox" | "starred" | "important" | "sent" | "draft" | "archive" | "spam" | "trash";
const tabs = [
    {
        key: "email" as const,
        label: "Email",
        channel: NotificationChannel.Email,
    },
    {
        key: "sms" as const,
        label: "SMS",
        channel: NotificationChannel.Sms,
    },
    {
        key: "push" as const,
        label: "Push Notifications",
        channel: NotificationChannel.Push,
    },
];
const folders: {
    key: FolderKey;
    label: string;
    icon: React.ReactNode;
}[] = [
    {
        key: "inbox",
        label: "Inbox",
        icon: <Inbox size={17} />,
    },
    {
        key: "starred",
        label: "Starred",
        icon: <Star size={17} />,
    },
    {
        key: "important",
        label: "Important",
        icon: <AlertCircle size={17} />,
    },
    {
        key: "sent",
        label: "Sent",
        icon: <Send size={17} />,
    },
    {
        key: "draft",
        label: "Drafts",
        icon: <Pencil size={17} />,
    },
    {
        key: "archive",
        label: "Archive",
        icon: <Archive size={17} />,
    },
    {
        key: "spam",
        label: "Spam",
        icon: <ShieldAlert size={17} />,
    },
    {
        key: "trash",
        label: "Trash",
        icon: <Trash2 size={17} />,
    },
];
const folderTypes: Record<
    FolderKey,
    MessageFolderType
> = {
    inbox: MessageFolderType.Inbox,
    starred: MessageFolderType.Starred,
    important: MessageFolderType.Important,
    sent: MessageFolderType.Sent,
    draft: MessageFolderType.Draft,
    archive: MessageFolderType.Archive,
    spam: MessageFolderType.Spam,
    trash: MessageFolderType.Trash,
};
const notificationIcons: Record<
    NotificationType,
    React.ReactNode
> = {
    email: <Mail size={16} />,
    sms: <MessageCircle size={16} />,
    push: <Bell size={16} />,
};

export function MessagesPage() {
    const [showCompose, setShowCompose] = useState(false);
    const [composeMail, setComposeMail] = useState<any>({});
    const {
        isOpen: confirmationOpen,
        options: confirmationOptions,
        confirm,
        close: closeConfirmation,
        handleConfirm,
    } = useConfirmation();
    const [activeTab, setActiveTab] =
        useState<NotificationType>("email");
    const [activeFolder, setActiveFolder] =
        useState<FolderKey>("inbox");
    const [notifications, setNotifications] =
        useState<Notification[]>([]);
    const [selectedId, setSelectedId] =
        useState<string | null>(null);
    const [
        selectedNotification,
        setSelectedNotification,
    ] = useState<Notification | null>(null);
    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);
    const [search, setSearch] =
        useState("");
    const [loading, setLoading] =
        useState(false);
    const [loadingDetails, setLoadingDetails] =
        useState(false);
    const activeChannel = useMemo(
        () =>
            tabs.find(
                tab => tab.key === activeTab
            )?.channel,
        [activeTab]
    );
    const updateLocal = useCallback(
        (
            id: string,
            data: Partial<Notification>
        ) => {
            setNotifications(current =>
                current.map(item =>
                    item.notificationID === id
                        ? {
                              ...item,
                              ...data,
                          }
                        : item
                )
            );
            setSelectedNotification(
                (current: any) =>
                    current?.notificationID === id
                        ? {
                              ...current,
                              ...data,
                          }
                        : current
            );
        },
        []
    );
    const clearSelection =
        useCallback(() => {
            setSelectedId(null);
            setSelectedNotification(null);
            setSelectedIds([]);
        }, []);
    const loadNotificationDetails =
        useCallback(
            async (
                notification: Notification,
                markRead = false
            ) => {
                const id =
                    notification.notificationID;
                if (!id) return;
                setSelectedId(id);
                setLoadingDetails(true);
                try {
                    const details = await getById(id);
                    setSelectedNotification(
                        details
                    );
                    if (details) {
                        updateLocal(
                            id,
                            details
                        );
                    }
                    if (
                        markRead &&
                        notification.isRead !==
                            YesNo.Yes
                    ) {
                        try {
                            await markAsRead(id);
                            updateLocal(id, {
                                isRead: YesNo.Yes,
                            });
                        } catch (error) {
                            console.error(
                                "Failed to mark notification as read:",
                                error
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        "Failed to load notification details:",
                        error
                    );
                    setSelectedNotification(
                        notification
                    );
                } finally {
                    setLoadingDetails(false);
                }
            },
            [
                getById,
                markAsRead,
                updateLocal,
            ]
        );
    const loadNotifications =
        useCallback(
            async (folder: FolderKey) => {
                setLoading(true);
                try {
                    const response: any =
                        await getMailbox({
                            channel:
                                activeChannel,
                            folder:
                                folderTypes[
                                    folder
                                ],
                            search:
                                search.trim() ||
                                undefined,
                        });
                    const data: Notification[] =
                        Array.isArray(response)
                            ? response
                            : response?.data ||
                              response?.items ||
                              [];
                    setNotifications(data);
                    const first = data[0];
                    if (
                        first?.notificationID
                    ) {
                        await loadNotificationDetails(
                            first
                        );
                    } else {
                        clearSelection();
                    }
                } catch (error) {
                    console.error(
                        "Failed to load notifications:",
                        error
                    );
                    setNotifications([]);
                    clearSelection();
                } finally {
                    setLoading(false);
                }
            },
            [
                getMailbox,
                activeChannel,
                search,
                loadNotificationDetails,
                clearSelection,
            ]
    );
    useEffect(() => {
        const initialize =
            async () => {
                try {
                    await getRemoteEmails();
                } catch (error) {
                    console.error(
                        "Failed to fetch remote emails:",
                        error
                    );
                }
                await loadNotifications(
                    activeFolder
                );
            };
        initialize();
    }, [
        getRemoteEmails,
        loadNotifications,
        activeFolder,
    ]);
    const handleOpenNotification =
        useCallback(
            (
                notification: Notification
            ) => {
                return loadNotificationDetails(
                    notification,
                    true
                );
            },
            [loadNotificationDetails]
        );
    const selectedCount =
        selectedIds.length;
    const allSelected =
        notifications.length > 0 &&
        selectedCount ===
            notifications.length;
    const unreadCount =
        notifications.filter(
            item =>
                item.isRead !== YesNo.Yes
        ).length;
    const changeChannel = (
        type: NotificationType
    ) => {
        setActiveTab(type);
        clearSelection();
    };
    const changeFolder = (
        folder: FolderKey
    ) => {
        setActiveFolder(folder);
        clearSelection();
    };
    const toggleSelection = (
        id?: string
    ) => {
        if (!id) return;
        setSelectedIds(current =>
            current.includes(id)
                ? current.filter(
                      item => item !== id
                  )
                : [...current, id]
        );
    };
    const toggleSelectAll = () => {
        setSelectedIds(
            allSelected
                ? []
                : notifications
                      .map(
                          item =>
                              item.notificationID
                      )
                      .filter(
                          (
                              id
                          ): id is string =>
                              Boolean(id)
                      )
        );
    };
    const updateSelected =
        useCallback(
            (
                data: Partial<Notification>,
                ids = selectedIds
            ) => {
                setNotifications(
                    current =>
                        current.map(item =>
                            ids.includes(
                                item.notificationID ||
                                    ""
                            )
                                ? {
                                      ...item,
                                      ...data,
                                  }
                                : item
                        )
                );
                setSelectedNotification(
                    (current: any) =>
                        current &&
                        ids.includes(
                            current.notificationID ||
                                ""
                        )
                            ? {
                                  ...current,
                                  ...data,
                              }
                            : current
                );
            },
            [selectedIds]
        );
    const removeSelected =
        useCallback(
            (ids = selectedIds) => {
                setNotifications(
                    current =>
                        current.filter(
                            item =>
                                !ids.includes(
                                    item.notificationID ||
                                        ""
                                )
                        )
                );
                setSelectedIds(
                    current =>
                        current.filter(
                            id =>
                                !ids.includes(
                                    id
                                )
                        )
                );
                setSelectedId(
                    current =>
                        current &&
                        ids.includes(current)
                            ? null
                            : current
                );
                setSelectedNotification(
                    (current: any) =>
                        current &&
                        ids.includes(
                            current.notificationID ||
                                ""
                        )
                            ? null
                            : current
                );
            },
            [selectedIds]
        );
    /*
     * Read / unread
     */
    const handleRead = async (
        notification: Notification
    ) => {
        const id =
            notification.notificationID;
        if (!id) return;
        const read =
            notification.isRead === YesNo.Yes;
        try {
            if (read) {
                await markAsUnread(id);
                updateLocal(id, {
                    isRead: YesNo.No,
                });
            } else {
                await markAsRead(id);
                updateLocal(id, {
                    isRead: YesNo.Yes,
                });
            }
        } catch (error) {
            console.error(
                "Failed to update read status:",
                error
            );
        }
    };
    /*
     * Star
     */
    const handleStar = async (
        notification: Notification
    ) => {
        const id =
            notification.notificationID;
        if (!id) return;
        const starred =
            notification.isStarred ===
            YesNo.Yes;
        try {
            if (starred) {
                await unstar(id);
            } else {
                await star(id);
            }
            updateLocal(id, {
                isStarred: starred
                    ? YesNo.No
                    : YesNo.Yes,
            });
        } catch (error) {
            console.error(
                "Failed to update star:",
                error
            );
        }
    };
    /*
     * Important
     */
    const handleImportant = async (
        notification: Notification
    ) => {
        const id =
            notification.notificationID;
        if (!id) return;
        const important =
            notification.isImportant ===
            YesNo.Yes;
        try {
            if (important) {
                await markNotImportant(id);
            } else {
                await markImportant(id);
            }
            updateLocal(id, {
                isImportant: important
                    ? YesNo.No
                    : YesNo.Yes,
            });
        } catch (error) {
            console.error(
                "Failed to update importance:",
                error
            );
        }
    };
    /*
     * Generic bulk action
     */
    const handleBulk = async (
        action: (
            ids: string[]
        ) => Promise<unknown>,
        data?: Partial<Notification>,
        clear = false
    ) => {
        if (!selectedIds.length) return;
        const ids = [...selectedIds];
        try {
            await action(ids);
            if (data) {
                updateSelected(data, ids);
            }
            if (clear) {
                setSelectedIds([]);
            }
        } catch (error) {
            console.error(
                "Bulk notification action failed:",
                error
            );
        }
    };
    const handleBulkRead = () =>
        handleBulk(
            markManyAsRead,
            {
                isRead: YesNo.Yes,
            },
            true
        );
    const handleBulkUnread = () =>
        handleBulk(
            markManyAsUnread,
            {
                isRead: YesNo.No,
            },
            true
        );
    const handleBulkStar = () =>
        handleBulk(starMany, {
            isStarred: YesNo.Yes,
        });
    const handleBulkUnstar = () =>
        handleBulk(unstarMany, {
            isStarred: YesNo.No,
        });
    const handleBulkImportant = () =>
        handleBulk(
            markImportantMany,
            {
                isImportant: YesNo.Yes,
            }
        );
    const handleBulkNotImportant = () =>
        handleBulk(
            markNotImportantMany,
            {
                isImportant: YesNo.No,
            }
        );
    /*
     * Confirmed bulk archive
     */
    const handleArchive = () => {
        if (!selectedIds.length) return;
        const ids = [...selectedIds];
        confirm(
            async () => {
                await archiveMany(ids);
                removeSelected(ids);
            },
            {
                title: "Archive Messages",
                message: `Are you sure you want to archive ${ids.length} selected message${
                    ids.length === 1
                        ? ""
                        : "s"
                }?`,
                confirmText: "Archive",
            }
        );
    };
    /*
     * Confirmed bulk spam
     */
    const handleSpam = () => {
        if (!selectedIds.length) return;
        const ids = [...selectedIds];
        confirm(
            async () => {
                await spamMany(ids);
                removeSelected(ids);
            },
            {
                title: "Report as Spam",
                message: `Are you sure you want to report ${ids.length} selected message${
                    ids.length === 1
                        ? ""
                        : "s"
                } as spam?`,
                confirmText: "Report Spam",
            }
        );
    };
    /*
     * Confirmed bulk trash
     */
    const handleTrash = () => {
        if (!selectedIds.length) return;
        const ids = [...selectedIds];
        confirm(
            async () => {
                await trashMany(ids);
                removeSelected(ids);
            },
            {
                title: "Delete Messages",
                message: `Are you sure you want to move ${ids.length} selected message${
                    ids.length === 1
                        ? ""
                        : "s"
                } to the trash?`,
                confirmText: "Delete",
            }
        );
    };
    /*
     * Single message archive
     */
    const handleArchiveCurrent =
        async (
            notification: Notification
        ) => {
            const id =
                notification.notificationID;
            if (!id) return;
            confirm(
                async () => {
                    await archiveMany([id]);
                    removeSelected([id]);
                },
                {
                    title: "Archive Message",
                    message: `Are you sure you want to archive "${
                        notification.messageTitle ||
                        "this message"
                    }"?`,
                    confirmText: "Archive",
                }
            );
        };
    /*
     * Single message spam
     */
    const handleSpamCurrent = (
        notification: Notification
    ) => {
        const id =
            notification.notificationID;
        if (!id) return;
        confirm(
            async () => {
                await spamMany([id]);
                removeSelected([id]);
            },
            {
                title: "Report as Spam",
                message: `Are you sure you want to report "${
                    notification.messageTitle ||
                    "this message"
                }" as spam?`,
                confirmText: "Report Spam",
            }
        );
    };
    /*
     * Single message trash
     */
    const handleTrashCurrent = (
        notification: Notification
    ) => {
        const id =
            notification.notificationID;
        if (!id) return;
        confirm(
            async () => {
                await trash(id);
                removeSelected([id]);
            },
            {
                title: "Delete Message",
                message: `Are you sure you want to move "${
                    notification.messageTitle ||
                    "this message"
                }" to the trash?`,
                confirmText: "Delete",
            }
        );
    };
    const handleDeleteNotification = () => {
        if (!selectedIds.length) return;
        const ids = [...selectedIds];
        confirm(
            async () => {
                await deleteMany(ids);
                removeSelected(ids);
            },
            {
                title: "Delete Forever",
                message: `Are you sure you want to permanently delete ${ids.length} selected message${
                    ids.length === 1 ? "" : "s"
                }? This action cannot be undone.`,
                confirmText: "Delete Forever",
            }
        );
    };
    const handleDeleteNotificationCurrent = (
        notification: Notification
    ) => {
        const id = notification.notificationID;
        if (!id) return;
        confirm(
            async () => {
                await deleteNotification(id);
                removeSelected([id]);
            },
            {
                title: "Delete Forever",
                message: `Are you sure you want to permanently delete "${
                    notification.messageTitle || "this message"
                }"? This action cannot be undone.`,
                confirmText: "Delete Forever",
            }
        );
    };
    /*
     * Reading pane navigation
     */
    const selectedIndex = useMemo(
        () =>
            notifications.findIndex(
                item =>
                    item.notificationID ===
                    selectedId
            ),
        [
            notifications,
            selectedId,
        ]
    );
    const openPrevious = () => {
        if (
            selectedIndex <= 0
        )
            return;
        const previous =
            notifications[
                selectedIndex - 1
            ];
        if (previous) {
            loadNotificationDetails(
                previous,
                true
            );
        }
    };
    const openNext = () => {
        if (
            selectedIndex < 0 ||
            selectedIndex >=
                notifications.length - 1
        )
            return;
        const next =
            notifications[
                selectedIndex + 1
            ];
        if (next) {
            loadNotificationDetails(
                next,
                true
            );
        }
    };
    const refresh = () => loadNotifications(activeFolder);
    const onSubmitMail = async (submittedMail: any, onSuccessCb?: any) => {
        const { to = [], cc = [], bcc = [], subject, message, extraData = {}, attachments = [] } = submittedMail;
        const inReplyTo = extraData?.inReplyTo;
        const data = {
            messageTitle: subject,
            messageBody: message,
            recipient: to.map((item: any) => typeof item === "string" ? item : item?.name || item?.email || "").filter(Boolean).join(","),
            messageFolderType: MessageFolderType.Draft,
            messageType: NotificationChannel.Email,
            noticeType: 'general',
            notificationDate: new Date(),
            hasAttachments: attachments.length > 0,
            extraData: {
                ...(inReplyTo && { inReplyTo }),
                cc: cc.map((item: any) => typeof item === "string" ? item : item?.name || item?.email || "").filter(Boolean),
                bcc: bcc.map((item: any) => typeof item === "string" ? item : item?.name || item?.email || "").filter(Boolean)
            }
        };
        const { formData } = jsonToFormData(data);
        attachments.forEach((file: File) => {
            formData.append(file.name, file, file.name);
        });
        confirm(
            async () => {
                const { error } = await sendNotification(formData);
                if (!error) onSuccessCb?.();
            },
            {
                title: "Email Sending",
                message: `Are you sure you want to send email "${subject}"?`,
                confirmText: "Confirm Email Send"
            }
        );
    };
    const handleCompose = () => {
        setComposeMail({});
        setShowCompose(true);
    };
    const handleReply = (mail: any) => {
        setComposeMail({
            to: [extractEmailAddress(mail?.sender) ],
            cc: [],
            bcc: [],
            subject: `Re: ${mail?.messageTitle}`,
            message: "",
            inReplyTo: mail?.extraData?.messageId
        });
        setShowCompose(true);
    };
    const handleForward = (mail: any) => {
        setComposeMail({
            to: [],
            cc: [],
            bcc: [],
            subject: `Fwd: ${mail.messageTitle}`,
            message: mail.messageBody || "",
            inReplyTo: undefined
        });
        setShowCompose(true);
    };
    return (
        <div className="space-y-4 text-[#101b61]">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Messages</h1>
                    <p className="text-base text-blue-600">Communicate with participants, speakers, delegates and exhibitors.</p>
                </div>
                <button type="button" onClick={handleCompose} className="inline-flex items-center gap-2 rounded-lg bg-[#0755f5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                    <Send size={15} /> Send Message
                </button>
            </div>
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                    { label: "Total Messages", value: notifications.length, icon: Mail, tone: "bg-blue-50 text-blue-600" },
                    { label: "Messages Sent", value: notifications.filter(item => item.messageFolderType === MessageFolderType.Sent).length, icon: Send, tone: "bg-emerald-50 text-emerald-600" },
                    { label: "Unread Messages", value: unreadCount, icon: Users, tone: "bg-orange-50 text-orange-600" },
                    { label: "Engagement", value: "—", icon: MousePointerClick, tone: "bg-purple-50 text-purple-600" },
                ].map((item) => {
                    const Icon = item.icon;
                    return <article key={item.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e2edfc] bg-white px-4 py-3.5 shadow-[0_3px_12px_rgba(57,118,188,.04)]">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.tone}`}><Icon size={23} /></div>
                        <div className="min-w-0"><b className="block text-2xl font-extrabold text-blue-950">{item.value}</b><span className="text-sm text-slate-600">{item.label}</span></div>
                    </article>;
                })}
            </section>
        <div className="flex h-[calc(100vh-230px)] min-h-[600px] overflow-hidden rounded-xl border border-[#e2edfc] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="border-r border-gray-200 w-60 shrink-0 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900">
                <div className="p-4">
                    <button
                        type="button"
                        title="Compose new message"
                        aria-label="Compose new message"
                        onClick={handleCompose}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-color-purple)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-color-purple)]"
                    >
                        <Pencil size={16} />
                        Compose
                    </button>
                </div>
                <nav className="px-2">
                    {folders.map(
                        folder => {
                            const active =
                                activeFolder ===
                                folder.key;
                            return (
                                <button
                                    key={
                                        folder.key
                                    }
                                    type="button"
                                    title={
                                        folder.label
                                    }
                                    onClick={() =>
                                        changeFolder(
                                            folder.key
                                        )
                                    }
                                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                        active
                                            ? "bg-[var(--accent-color-3)] font-semibold text-[var(--accent-color-purple)] dark:bg-blue-950/40 dark:text-[var(--accent-color-2)]"
                                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <span className="flex justify-center w-5">
                                        {
                                            folder.icon
                                        }
                                    </span>
                                    <span className="flex-1 text-left">
                                        {
                                            folder.label
                                        }
                                    </span>
                                    {folder.key ===
                                        "inbox" &&
                                        unreadCount >
                                            0 && (
                                            <span className="text-xs font-semibold">
                                                {
                                                    unreadCount
                                                }
                                            </span>
                                        )}
                                </button>
                            );
                        }
                    )}
                </nav>
            </aside>
            {/* Main */}
            <main className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between px-5 py-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {
                                    folders.find(
                                        folder =>
                                            folder.key ===
                                            activeFolder
                                    )?.label
                                }
                            </h1>
                            <p className="mt-0.5 text-xs text-gray-500">
                                {
                                    notifications.length
                                }{" "}
                                messages
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            {tabs.map(
                                tab => {
                                    const active =
                                        activeTab ===
                                        tab.key;
                                    return (
                                        <button
                                            key={
                                                tab.key
                                            }
                                            type="button"
                                            title={
                                                tab.label
                                            }
                                            onClick={() =>
                                                changeChannel(
                                                    tab.key
                                                )
                                            }
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                                                active
                                                    ? "bg-[var(--accent-color-3)] text-[var(--accent-color-purple)] dark:bg-blue-950/40 dark:text-[var(--accent-color-2)]"
                                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {
                                                notificationIcons[
                                                    tab.key
                                                ]
                                            }
                                            <span>
                                                {
                                                    tab.label
                                                }
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                    {/* Search */}
                    <div className="flex items-center gap-2 px-5 pb-4">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute text-gray-400 left-3 top-3"
                            />
                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={event =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                onKeyDown={event => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        loadNotifications(
                                            activeFolder
                                        );
                                    }
                                }}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <ToolbarButton
                            title="Refresh"
                            onClick={
                                refresh
                            }
                            disabled={
                                loading
                            }
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </ToolbarButton>
                    </div>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-5 py-2 border-t border-gray-100 dark:border-gray-800">
                        <ToolbarButton
                            title={
                                allSelected
                                    ? "Deselect all"
                                    : "Select all"
                            }
                            onClick={
                                toggleSelectAll
                            }
                        >
                            {allSelected ? (
                                <CircleCheck
                                    size={18}
                                />
                            ) : (
                                <Circle
                                    size={18}
                                />
                            )}
                        </ToolbarButton>
                        {selectedCount >
                        0 ? (
                            <>
                                <span className="mr-2 text-xs text-gray-500">
                                    {
                                        selectedCount
                                    }{" "}
                                    selected
                                </span>
                                <ToolbarButton
                                    title="Archive selected messages"
                                    onClick={
                                        handleArchive
                                    }
                                >
                                    <Archive
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Mark selected messages as read"
                                    onClick={
                                        handleBulkRead
                                    }
                                >
                                    <MailOpen
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Mark selected messages as unread"
                                    onClick={
                                        handleBulkUnread
                                    }
                                >
                                    <Mail
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Star selected messages"
                                    onClick={
                                        handleBulkStar
                                    }
                                >
                                    <Star
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Unstar selected messages"
                                    onClick={
                                        handleBulkUnstar
                                    }
                                >
                                    <StarOff
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Mark selected messages as important"
                                    onClick={
                                        handleBulkImportant
                                    }
                                >
                                    <AlertCircle
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Mark selected messages as not important"
                                    onClick={
                                        handleBulkNotImportant
                                    }
                                >
                                    <X
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Report selected messages as spam"
                                    onClick={
                                        handleSpam
                                    }
                                >
                                    <ShieldAlert
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                {activeFolder !== "trash" && (
                                    <ToolbarButton
                                        title="Move selected messages to trash"
                                        onClick={handleTrash}>
                                        <Trash2 size={17} />
                                    </ToolbarButton>
                                )}
                                {activeFolder === "trash" && (
                                    <ToolbarButton
                                        title="Delete selected messages forever"
                                        onClick={handleDeleteNotification}
                                    >
                                        <CircleX size={17} className="text-red-800" />
                                    </ToolbarButton>
                                )}
                            </>
                        ) : (
                            <>
                                <ToolbarButton
                                    title="Refresh"
                                    onClick={
                                        refresh
                                    }
                                >
                                    <RefreshCw
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                                <ToolbarButton
                                    title="Filter"
                                    onClick={() => {}}
                                >
                                    <Filter
                                        size={
                                            17
                                        }
                                    />
                                </ToolbarButton>
                            </>
                        )}
                    </div>
                </header>
                {/* Content */}
                <div className="flex flex-1 min-h-0">
                    {/* Message list */}
                    <section className="w-[440px] shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                        {loading && (
                            <div className="p-10 text-sm text-center text-gray-500">
                                Loading messages...
                            </div>
                        )}
                        {!loading &&
                            !notifications.length && (
                                <div className="flex items-center justify-center h-full p-10 text-center text-gray-500">
                                    <div>
                                        <Mail
                                            size={
                                                42
                                            }
                                            className="mx-auto mb-3 opacity-30"
                                        />
                                        <div className="font-medium">
                                            No
                                            messages
                                        </div>
                                        <div className="mt-1 text-xs">
                                            Your
                                            mailbox
                                            is
                                            empty.
                                        </div>
                                    </div>
                                </div>
                            )}
                        {!loading &&
                            notifications.map(
                                notification => {
                                    const id =
                                        notification.notificationID ||
                                        "";
                                    const selected =
                                        selectedId ===
                                        id;
                                    const checked =
                                        selectedIds.includes(
                                            id
                                        );
                                    const unread =
                                        notification.isRead !==
                                        YesNo.Yes;
                                    const type =
                                        getNotificationType(
                                            notification.messageType
                                        );
                                    return (
                                        <div
                                            key={
                                                id
                                            }
                                            className={`group flex border-b border-gray-100 dark:border-gray-800 ${
                                                selected
                                                    ? "bg-gray-100 dark:bg-blue-950/30"
                                                    : unread
                                                      ? "bg-white dark:bg-gray-900"
                                                      : "bg-gray-50/40 dark:bg-gray-900/60"
                                            }`}
                                        >
                                            <div className="flex items-start justify-center w-10 pt-5 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        checked
                                                    }
                                                    onChange={() =>
                                                        toggleSelection(
                                                            id
                                                        )
                                                    }
                                                    title="Select message"
                                                    className="w-4 h-4 text-[var(--accent-color-purple)] border-gray-300 rounded"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                disabled={
                                                    loadingDetails &&
                                                    selected
                                                }
                                                onClick={() =>
                                                    handleOpenNotification(
                                                        notification
                                                    )
                                                }
                                                title={`Open ${
                                                    notification.messageTitle ||
                                                    "message"
                                                }`}
                                                className="flex-1 min-w-0 py-4 pr-3 text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">
                                                        {
                                                            notificationIcons[
                                                                type
                                                            ]
                                                        }
                                                    </span>
                                                    <span
                                                        className={`min-w-0 flex-1 gap-5 truncate text-sm ${
                                                            unread
                                                                ? "font-bold text-gray-900 dark:text-white"
                                                                : "font-medium text-gray-600 dark:text-gray-400"
                                                        }`}>
                                                        <span>
                                                        {
                                                            formatEmailDisplay(notification.sender || notification.recipient, true)
                                                        }
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 text-[11px] text-gray-400">
                                                        {formatDate(
                                                            notification.notificationDate
                                                        )}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`mt-1 truncate text-sm ${
                                                        unread
                                                            ? "font-semibold text-gray-900 dark:text-white"
                                                            : "text-gray-600 dark:text-gray-400"
                                                    }`}
                                                >
                                                    {
                                                        notification.messageTitle
                                                    }
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500 truncate">
                                                    {stripHtml(
                                                        notification
                                                            .extraData
                                                            ?.summary
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span
                                                        role="button"
                                                        tabIndex={
                                                            0
                                                        }
                                                        title={
                                                            notification.isStarred ===
                                                            YesNo.Yes
                                                                ? "Unstar"
                                                                : "Star"
                                                        }
                                                        aria-label={
                                                            notification.isStarred ===
                                                            YesNo.Yes
                                                                ? "Unstar"
                                                                : "Star"
                                                        }
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            handleStar(
                                                                notification
                                                            );
                                                        }}
                                                        onKeyDown={event => {
                                                            if (
                                                                event.key ===
                                                                    "Enter" ||
                                                                event.key ===
                                                                    " "
                                                            ) {
                                                                event.preventDefault();
                                                                event.stopPropagation();
                                                                handleStar(
                                                                    notification
                                                                );
                                                            }
                                                        }}
                                                        className={`cursor-pointer ${
                                                            notification.isStarred ===
                                                            YesNo.Yes
                                                                ? "text-yellow-500"
                                                                : "text-gray-300 opacity-0 group-hover:opacity-100"
                                                        }`}
                                                    >
                                                        <Star
                                                            size={
                                                                15
                                                            }
                                                            fill={
                                                                notification.isStarred ===
                                                                YesNo.Yes
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />
                                                    </span>
                                                    {notification.isImportant ===
                                                        YesNo.Yes && (
                                                        <span
                                                            title="Important"
                                                            className="text-red-500"
                                                        >
                                                            <AlertCircle
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </span>
                                                    )}
                                                    {notification.tags
                                                        ?.slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (tag: any) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800">
                                                                    { tag }
                                                                </span>
                                                            )
                                                        )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                }
                            )}
                    </section>
                    {/* Reading pane */}
                    <section className="flex-1 min-w-0 overflow-y-auto">
                        {loadingDetails ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <RefreshCw
                                    size={30}
                                    className="mb-3 animate-spin"
                                />
                                <div className="text-sm">
                                    Loading
                                    message...
                                </div>
                            </div>
                        ) : !selectedNotification ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Mail
                                    size={52}
                                    className="mb-3 opacity-30"
                                />
                                <div className="text-sm">
                                    Select a
                                    message to
                                    read
                                </div>
                            </div>
                        ) : (
                            <NotificationDetails
                                notification={selectedNotification}
                                activeFolder={activeFolder}
                                onStar={handleStar}
                                onImportant={handleImportant}
                                onArchive={handleArchiveCurrent}
                                onSpam={handleSpamCurrent}
                                onTrash={handleTrashCurrent}
                                onDeleteForever={handleDeleteNotificationCurrent}
                                onRead={() =>
                                    handleRead(
                                        selectedNotification
                                    )
                                }
                                onBack={() =>
                                    setSelectedNotification(
                                        null
                                    )
                                }
                                onPrevious={openPrevious}
                                onNext={openNext}
                                canPrevious={selectedIndex > 0}
                                canNext={
                                    selectedIndex >=
                                        0 &&
                                    selectedIndex <
                                        notifications.length -
                                            1
                                }
                                onReply={handleReply}
                                onForward={handleForward}
                            />
                        )}
                    </section>
                </div>
            </main>
            <ConfirmationDialog
                isOpen={
                    confirmationOpen
                }
                onClose={
                    closeConfirmation
                }
                onConfirm={
                    handleConfirm
                }
                title={
                    confirmationOptions.title
                }
                message={
                    confirmationOptions.message
                }
            />
            <ComposeMail
                show={showCompose}
                onHide={() => setShowCompose(false)}
                initialMail={composeMail}
                onSubmitMail={onSubmitMail}
            />
        </div>
        </div>
    );
}
/* -------------------------------------------------------------------------- */
/* Toolbar Button                                                             */
/* -------------------------------------------------------------------------- */
function ToolbarButton({
    children,
    title,
    onClick,
    disabled = false,
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            className="p-2 text-gray-500 transition rounded-lg hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
            {children}
        </button>
    );
}
/* -------------------------------------------------------------------------- */
/* Notification Details                                                       */
/* -------------------------------------------------------------------------- */
function NotificationDetails({
    notification,
    activeFolder,
    onStar,
    onImportant,
    onArchive,
    onSpam,
    onTrash,
    onDeleteForever,
    onRead,
    onBack,
    onPrevious,
    onNext,
    canPrevious,
    canNext,
    onReply,
    onForward
}: {
    notification: Notification;
    activeFolder: FolderKey;
    onStar: (notification: Notification) => void;
    onImportant: (notification: Notification) => void;
    onArchive: (notification: Notification) => void;
    onSpam: (notification: Notification) => void;
    onTrash: (notification: Notification) => void;
    onDeleteForever: (notification: Notification) => void;
    onRead: () => void;
    onBack: () => void;
    onPrevious: () => void;
    onNext: () => void;
    canPrevious: boolean;
    canNext: boolean;
    onReply: (submittedMail: any) => void;
    onForward: (submittedMail: any) => void;
}) {
    const type =
        getNotificationType(
            notification.messageType
        );
    return (
        <div className="min-h-full">
            {/* Reading toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        title="Back to message list"
                        onClick={
                            onBack
                        }
                    >
                        <ChevronLeft
                            size={18}
                        />
                    </ToolbarButton>
                    <ToolbarButton
                        title={
                            notification.isRead ===
                            YesNo.Yes
                                ? "Mark as unread"
                                : "Mark as read"
                        }
                        onClick={
                            onRead
                        }
                    >
                        {notification.isRead ===
                        YesNo.Yes ? (
                            <Mail
                                size={17}
                            />
                        ) : (
                            <MailOpen
                                size={17}
                            />
                        )}
                    </ToolbarButton>
                    <ToolbarButton
                        title="Archive message"
                        onClick={() =>
                            onArchive(
                                notification
                            )
                        }
                    >
                        <Archive
                            size={17}
                        />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Report message as spam"
                        onClick={() =>
                            onSpam(
                                notification
                            )
                        }
                    >
                        <ShieldAlert
                            size={17}
                        />
                    </ToolbarButton>
                    {activeFolder === "trash" ? (
                        <ToolbarButton
                            title="Delete forever"
                            onClick={() => onDeleteForever(notification)}
                        >
                            <CircleX size={17} className="text-red-800" />
                        </ToolbarButton>
                    ) : (
                        <ToolbarButton
                            title="Move message to trash"
                            onClick={() => onTrash(notification)}
                        >
                            <Trash2 size={17} />
                        </ToolbarButton>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        title="Previous message"
                        onClick={
                            onPrevious
                        }
                        disabled={
                            !canPrevious
                        }
                    >
                        <ChevronLeft
                            size={17}
                        />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Next message"
                        onClick={
                            onNext
                        }
                        disabled={
                            !canNext
                        }
                    >
                        <ChevronRight
                            size={17}
                        />
                    </ToolbarButton>
                </div>
            </div>
            <article className="max-w-4xl p-8 mx-auto">
                <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {
                                notification.messageTitle
                            }
                        </h2>
                        <div className="mt-2 text-xs text-gray-400">
                            {formatDate(
                                notification.notificationDate
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            title={
                                notification.isStarred ===
                                YesNo.Yes
                                    ? "Unstar"
                                    : "Star"
                            }
                            aria-label={
                                notification.isStarred ===
                                YesNo.Yes
                                    ? "Unstar"
                                    : "Star"
                            }
                            onClick={() =>
                                onStar(
                                    notification
                                )
                            }
                            className={`rounded-lg p-2 ${
                                notification.isStarred ===
                                YesNo.Yes
                                    ? "text-yellow-500"
                                    : "text-gray-300 hover:text-yellow-500"
                            }`}
                        >
                            <Star
                                size={20}
                                fill={
                                    notification.isStarred ===
                                    YesNo.Yes
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                        <button
                            type="button"
                            title={
                                notification.isImportant ===
                                YesNo.Yes
                                    ? "Mark as not important"
                                    : "Mark as important"
                            }
                            aria-label={
                                notification.isImportant ===
                                YesNo.Yes
                                    ? "Mark as not important"
                                    : "Mark as important"
                            }
                            onClick={() =>
                                onImportant(
                                    notification
                                )
                            }
                            className={`rounded-lg p-2 ${
                                notification.isImportant ===
                                YesNo.Yes
                                    ? "text-red-500"
                                    : "text-gray-300 hover:text-red-500"
                            }`}
                        >
                            <AlertCircle
                                size={20}
                            />
                        </button>
                    </div>
                </div>
                <div className="flex items-start gap-3 pb-6 mt-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-10 h-10 font-semibold text-[var(--accent-color-purple)] bg-[var(--accent-color-3)] rounded-full shrink-0">
                        {
                            (formatEmailDisplay(notification.sender || notification.recipient, true) || "?")
                            .charAt(0)
                            .toUpperCase()
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                { formatEmailDisplay(notification.sender) ||
                                    "System"}
                            </span>
                            <span className="text-xs text-gray-400">
                                &lt;
                                {
                                    extractEmailAddress(notification.sender || notification.recipient)
                                }
                                &gt;
                            </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            to{" "}
                            <span className="text-gray-700 dark:text-gray-300">
                                {
                                    notification.recipient
                                }
                            </span>
                        </div>
                    </div>
                    <div
                        className="text-gray-500"
                        title={
                            type
                        }
                    >
                        {
                            notificationIcons[
                                type
                            ]
                        }
                    </div>
                </div>
                <div className="py-8">
                    {type ===
                        "email" && (
                        <EmailDetails
                            notification={
                                notification
                            }
                            onReply={onReply}
                            onForward={onForward}
                        />
                    )}
                    {type === "sms" && (
                        <SmsDetails
                            notification={
                                notification
                            }
                        />
                    )}
                    {type === "push" && (
                        <PushDetails
                            notification={
                                notification
                            }
                        />
                    )}
                </div>
                {!!notification.tags
                    ?.length && (
                    <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                            Labels
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {notification.tags.map(
                                (tag: any) => (
                                    <span
                                        key={
                                            tag
                                        }
                                        className="px-3 py-1 text-xs font-medium text-[var(--accent-color-purple)] rounded-full bg-gray-100 dark:bg-blue-950/40 dark:text-[var(--accent-color-2)]"
                                    >
                                        {
                                            tag
                                        }
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
/* -------------------------------------------------------------------------- */
/* Email                                                                      */
/* -------------------------------------------------------------------------- */
function EmailDetails({
        notification,
        children,
        onReply,
        onForward
    }: {
        notification: Notification;
        children?: Notification[],
        onReply: (mail: Notification) => void,
        onForward: (mail: Notification) => void
}) {
    const thread = children?.length ? children : [notification];
    const [expanded, setExpanded] = useState<string | number>(
        thread.length ? thread[thread.length - 1]?.notificationID || "" : ""
    );
    return (
        <div className="space-y-3">
            {thread.map((mail, index) => {
                const id = mail.notificationID || index;
                const isOpen = expanded === id;
                const body = mail.messageBody && mail.messageBody !== "false"
                    ? mail.messageBody
                    : mail.extraData?.summary || "";
                const attachments = mail.attachments
                    ? Array.isArray(mail.attachments) ? mail.attachments : [mail.attachments]
                    : [];
                return (
                    <div key={id} className="overflow-hidden">
                        <button type="button" onClick={() => setExpanded(isOpen ? "" : id)} className="flex items-center w-full gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{ formatEmailDisplay(mail.sender || mail.recipient, true) }</div>
                                <div className="text-xs text-gray-500 truncate">{mail.messageTitle}</div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                                <CustomDateFormat value={mail.notificationDate?.toString()} dateFormat={REACT_DEFAULT_PROPS.dateTimeFormat}/>
                            </div>
                        </button>
                        {isOpen && (
                            <div className="px-3 pb-4">
                                <div className="text-sm leading-7 prose text-gray-700 max-w-none dark:prose-invert dark:text-gray-300" dangerouslySetInnerHTML={{ __html: body }} />
                                {!!attachments.length && <EmailAttachments attachments={attachments} />}
                            </div>
                        )}
                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => onReply(mail)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Reply size={16} />
                                Reply
                            </button>
                            <button
                                type="button"
                                onClick={() => onForward(mail)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Forward size={16} />
                                Forward
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
function EmailAttachments({ attachments }: { attachments: any[] }) {
    return (
        <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Attachments</div>
                <div className="mt-0.5 text-xs text-gray-500">{attachments.length} {attachments.length === 1 ? "file" : "files"}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {attachments.map((a, index) => {
                    const ext = a?.filename?.split('.')?.[1]?.trim();
                    const type = getMimeType(ext);
                    const source = createBase64URL(a?.content,type);
                    const title = a?.filename;
                    const size = a?.size;
                    const name = title || `Attachment ${index + 1}`;
                    return (
                        <div key={`${name}-${index}`} className="flex items-center gap-3 p-3 transition border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 text-[var(--accent-color-purple)] bg-[var(--accent-color-3)]">
                                {getAttachmentIcon(type, name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate dark:text-gray-200" title={name}>{name}</div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                    {type && <span>{formatAttachmentType(type)}</span>}
                                    {size && <><span>•</span><span>{formatBytes(size,2)}</span></>}
                                </div>
                            </div>
                            {source && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <a href={source} download={name} onClick={e => {
                                        e.preventDefault();
                                        const a = document.createElement("a");
                                        a.href = source;
                                        a.download = name;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                    }} title="Download attachment" className="p-2 text-gray-500 rounded-lg hover:bg-white hover:text-[var(--accent-color-purple)] dark:hover:bg-gray-700">
                                        <Download size={16} />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
/* -------------------------------------------------------------------------- */
/* SMS                                                                        */
/* -------------------------------------------------------------------------- */
function SmsDetails({
    notification,
}: {
    notification: Notification;
}) {
    return (
        <div className="max-w-2xl">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoField
                    label="Phone Number"
                    value={
                        notification.recipient
                    }
                />
                <InfoField
                    label="Sender"
                    value={
                        formatEmailDisplay(notification.sender) ||
                        "System"
                    }
                />
            </div>
            <div className="p-6 bg-gray-100 rounded-2xl dark:bg-gray-800">
                <div className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    SMS Message
                </div>
                <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                    {
                        notification.messageBody
                    }
                </p>
            </div>
        </div>
    );
}
/* -------------------------------------------------------------------------- */
/* Push                                                                       */
/* -------------------------------------------------------------------------- */
function PushDetails({
    notification,
}: {
    notification: Notification;
}) {
    return (
        <div className="max-w-2xl">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoField
                    label="Device"
                    value={
                        notification
                            .extraData
                            ?.device ||
                        notification
                            .extraData
                            ?.platform ||
                        "Mobile Device"
                    }
                />
                <InfoField
                    label="User ID"
                    value={
                        notification.userID ||
                        notification.recipient
                    }
                />
            </div>
            <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 text-[var(--accent-color-purple)] bg-[var(--accent-color-3)] rounded-full shrink-0">
                        <Bell
                            size={22}
                        />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {
                                notification.messageTitle
                            }
                        </div>
                        <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
                            {
                                notification.messageBody
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
/* -------------------------------------------------------------------------- */
/* Info Field                                                                 */
/* -------------------------------------------------------------------------- */
function InfoField({
    label,
    value,
}: {
    label: string;
    value?: string;
}) {
    return (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </div>
            <div className="text-sm font-medium text-gray-800 truncate dark:text-gray-200">
                {value || "-"}
            </div>
        </div>
    );
}
type ComposeMailProps = {
    show: boolean;
    onHide: () => void;
    onSubmitMail: (
        mail: {
            to: string[];
            cc: string[];
            bcc: string[];
            subject: string;
            message: string;
            attachments: File[];
            extraData: any;
        },
        onSuccess: () => void
    ) => void;
    initialMail?: any;
};
const RecipientInput = ({
    label,
    value,
    onChange,
    placeholder
}: {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
}) => {
    const [input, setInput] = useState("");
    const add = () => {
        const email = input.trim().replace(/,$/, "");
        if (!email || value.includes(email)) return;
        onChange([...value, email]);
        setInput("");
    };
    const remove = (email: string) =>
        onChange(value.filter(item => item !== email));
    return (
        <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">
                {label}
            </label>
            <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-1.5 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                {value.map(email => (
                    <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-200"
                    >
                        {email}
                        <button
                            type="button"
                            onClick={() => remove(email)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    value={input}
                    placeholder={placeholder}
                    className="flex-1 min-w-[120px] py-1 text-sm bg-transparent border-0 outline-none dark:text-white"
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            add();
                        }
                    }}
                    onBlur={add}
                />
            </div>
        </div>
    );
};
const ComposeMail = ({
    show,
    onHide,
    onSubmitMail,
    initialMail = {}
}: ComposeMailProps) => {
    const [to, setTo] = useState<any[]>([]);
    const [cc, setCc] = useState<any[]>([]);
    const [bcc, setBcc] = useState<any[]>([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [inReplyTo, setInReplyTo] = useState<string | undefined>();
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            LinkExtension.configure({
                openOnClick: false
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            SubscriptExtension,
            SuperscriptExtension
        ],
        content: "",
        editable: true,
        onUpdate: ({ editor }) => setMessage(editor.getHTML())
    });
    useEffect(() => {
        if (!show) return;
        setTo(initialMail.to || []);
        setCc(initialMail.cc || []);
        setBcc(initialMail.bcc || []);
        setSubject(initialMail.subject || "");
        setMessage(initialMail.message || "");
        setAttachments(initialMail.attachments || []);
        setInReplyTo(initialMail.inReplyTo);
        editor?.commands.setContent(initialMail.message || "");
    }, [show, initialMail, editor]);
    if (!show) return null;
    const handleSubmit = () => {
        onSubmitMail(
            { to, cc, bcc, subject, message, attachments, extraData: { inReplyTo } },
            onHide
        );
    };
    const handleClose = () => {
        onHide();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-xl dark:bg-gray-900">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Mail size={18} />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            { subject || 'New Email' }
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <RecipientInput
                        label="To"
                        value={to}
                        onChange={setTo}
                        placeholder="to@gmail.com"
                    />
                    <RecipientInput
                        label="CC"
                        value={cc}
                        onChange={setCc}
                        placeholder="cc@gmail.com"
                    />
                    <RecipientInput
                        label="BCC"
                        value={bcc}
                        onChange={setBcc}
                        placeholder="bcc@gmail.com"
                    />
                    {
                        !initialMail.subject &&
                        <div>
                            <label className="block mb-1 text-xs font-medium text-gray-500">
                                Subject
                            </label>
                            <div className="flex items-center gap-2 px-3 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                                <FileText size={16} className="text-gray-400" />
                                <input
                                    value={subject}
                                    placeholder="Subject"
                                    className="w-full py-2.5 text-sm bg-transparent border-0 outline-none dark:text-white"
                                    onChange={e => setSubject(e.target.value)}
                                />
                            </div>
                        </div>
                    }
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                            Message
                        </label>
                        <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Bold"
                                >
                                    <Bold size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Italic"
                                >
                                    <Italic size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Underline"
                                >
                                    <Underline size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Strikethrough"
                                >
                                    <Strikethrough size={15} />
                                </button>
                                <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
                                <select
                                    value={
                                        editor?.isActive("heading", { level: 1 }) ? "h1" :
                                        editor?.isActive("heading", { level: 2 }) ? "h2" :
                                        editor?.isActive("heading", { level: 3 }) ? "h3" : "p"
                                    }
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (value === "p") {
                                            editor?.chain().focus().setParagraph().run();
                                        } else {
                                            editor?.chain().focus()
                                                .toggleHeading({ level: Number(value.replace("h", "")) as 1 | 2 | 3 })
                                                .run();
                                        }
                                    }}
                                    className="px-2 py-1 text-xs bg-transparent border-0 outline-none dark:text-gray-300"
                                >
                                    <option value="p">Normal</option>
                                    <option value="h1">Heading 1</option>
                                    <option value="h2">Heading 2</option>
                                    <option value="h3">Heading 3</option>
                                </select>
                                <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Align left"
                                >
                                    <AlignLeft size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Align center"
                                >
                                    <AlignCenter size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Align right"
                                >
                                    <AlignRight size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Justify"
                                >
                                    <AlignJustify size={15} />
                                </button>
                                <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Bullet list"
                                >
                                    <List size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Numbered list"
                                >
                                    <ListOrdered size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Quote"
                                >
                                    <Quote size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleCode().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Code"
                                >
                                    <Code size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleSubscript().run()}
                                    className="px-1.5 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Subscript"
                                >
                                    X₂
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                                    className="px-1.5 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Superscript"
                                >
                                    X²
                                </button>
                                <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = window.prompt("Enter URL");
                                        if (url) {
                                            editor?.chain().focus().setLink({ href: url }).run();
                                        }
                                    }}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Insert link"
                                >
                                    <Link size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().unsetLink().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Remove link"
                                >
                                    <Unlink size={15} />
                                </button>
                                <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().undo().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Undo"
                                >
                                    <Undo2 size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().redo().run()}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Redo"
                                >
                                    <Redo2 size={15} />
                                </button>
                            </div>
                            <EditorContent
                                editor={editor}
                                className="min-h-[220px] [&_.ProseMirror]:min-h-[220px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:shadow-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <AddAttachment
                            attachments={attachments}
                            setAttachments={setAttachments}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onHide}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <Trash2 size={16} />
                        Discard
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!to.length || !subject.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-[var(--accent-color-purple)] hover:opacity-90 disabled:opacity-50"
                    >
                        Send
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export const AddAttachment = ({
  attachments,
  setAttachments,
  maxFiles = 10,
  maxSizeMB = 25,
}: {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxSizeMB?: number;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const addFiles = (files: File[]) => {
    setError("");
    const valid = files.filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizeMB}MB.`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => {
      const unique = [...prev, ...valid].filter(
        (file, i, arr) =>
          i === arr.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          )
      );
      if (unique.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`);
      }
      return unique.slice(0, maxFiles);
    });
    if (inputRef.current) inputRef.current.value = "";
  };
  const removeFile = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  const removeAll = () => {
    setAttachments([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={`group flex min-h-[130px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center outline-none transition-all ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-gray-200 bg-gray-50/70 hover:border-primary hover:bg-primary/5"
        }`}
      >
        <div className="flex items-center justify-center mb-3 text-gray-500 bg-white rounded-full shadow-sm h-11 w-11 group-hover:text-primary">
          {dragging ? <Upload size={21} /> : <Paperclip size={21} />}
        </div>
        <p className="text-sm font-medium text-gray-700">
          {dragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          or <span className="font-medium text-primary">click to browse</span>
        </p>
        <p className="mt-2 text-[11px] text-gray-400">
          Maximum {maxFiles} files · {maxSizeMB}MB per file
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => addFiles(Array.from(e.target.files || []))}
        />
      </div>
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 mt-2 text-xs text-red-600 border border-red-100 rounded-lg bg-red-50">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
      {/* Files */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">
              Attachments ({attachments.length})
            </span>
            <button
              type="button"
              onClick={removeAll}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Remove all
            </button>
          </div>
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 hover:shadow-sm"
            >
              <div className="flex items-center min-w-0 gap-3">
                <div className="flex items-center justify-center rounded-lg h-9 w-9 shrink-0 bg-gray-50 text-primary">
                  {getAttachmentIcon(file.type, file.name)}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium text-gray-700 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(file.size)}
                    {file.type && ` · ${file.type}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                title="Remove attachment"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="flex items-center justify-center ml-3 text-gray-400 rounded-full h-7 w-7 shrink-0 hover:bg-red-50 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function getNotificationType(
    channel: NotificationChannel
): NotificationType {
    switch (channel) {
        case NotificationChannel.Sms:
            return "sms";
        case NotificationChannel.Push:
            return "push";
        default:
            return "email";
    }
}
function formatDate(
    date?: string | Date
) {
    if (!date) return "-";
    const parsed = new Date(date);
    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return String(date);
    }
    return parsed.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}
function stripHtml(
    value?: string
) {
    if (!value) return "";
    const div =
        document.createElement(
            "div"
        );
    div.innerHTML = value;
    return (
        div.textContent ||
        div.innerText ||
        ""
    );
}
