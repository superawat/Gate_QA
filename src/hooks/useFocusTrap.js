import { useEffect } from "react";

export function useFocusTrap(dialogRef, isOpen, onClose) {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                if (onClose) onClose();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) {
                return;
            }

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );

            if (!focusableElements.length) {
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        
        // Auto-focus the first element when modal opens
        setTimeout(() => {
            if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
                const focusableElements = Array.from(
                    dialogRef.current.querySelectorAll(
                        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    )
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        }, 10);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, dialogRef]);
}
