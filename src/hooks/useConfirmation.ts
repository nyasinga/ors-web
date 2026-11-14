import { useCallback, useState } from "react";

export interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export default function useConfirmation() {
    const [isOpen, setIsOpen] =
        useState(false);

    const [options, setOptions] =
        useState<ConfirmationOptions>({
            title: "Confirm Action",
            message:
                "Are you sure you want to continue?",
            confirmText: "Confirm",
            cancelText: "Cancel",
        });

    const [pendingAction, setPendingAction] =
        useState<
            (() => Promise<void>) | null
        >(null);

    const confirm = useCallback(
        (
            action: () => Promise<void>,
            confirmation: ConfirmationOptions
        ) => {
            setOptions({
                title:
                    confirmation.title ||
                    "Confirm Action",
                message:
                    confirmation.message,
                confirmText:
                    confirmation.confirmText ||
                    "Confirm",
                cancelText:
                    confirmation.cancelText ||
                    "Cancel",
            });

            setPendingAction(
                () => action
            );

            setIsOpen(true);
        },
        []
    );

    const close = useCallback(() => {
        setIsOpen(false);
        setPendingAction(null);
    }, []);

    const handleConfirm =
        useCallback(async () => {
            if (!pendingAction) {
                close();
                return;
            }

            try {
                await pendingAction();
            } finally {
                close();
            }
        }, [
            pendingAction,
            close,
        ]);

    return {
        isOpen,
        options,
        confirm,
        close,
        handleConfirm,
    };
}