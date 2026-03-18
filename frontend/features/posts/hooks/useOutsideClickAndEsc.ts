import { useEffect, useRef } from "react";

interface UseOutsideClickAndEscOptions {
  ref: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ポップアップを、要素外クリックおよびESCキー押下で閉じるための共通フック
 *
 * @example
 * const menuRef = useRef<HTMLDivElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 * useOutsideClickAndEsc({ ref: menuRef, isOpen, onClose: () => setIsOpen(false) });
 */
export function useOutsideClickAndEsc({
  ref,
  isOpen,
  onClose,
}: UseOutsideClickAndEscOptions): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (e: MouseEvent): void => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        onCloseRef.current();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, ref]);
}
