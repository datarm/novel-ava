import { Editor } from "@tiptap/core";
import { ChevronDown, CornerDownLeft } from "lucide-react";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useContext,
  useState,
  useCallback,
} from "react";
import { NAVIGATION_KEYS } from "@/lib/constants";
import { LoadingCircle, Magic } from "@/ui/icons";
import { useCompletion } from "ai/react";
import * as Popover from "@radix-ui/react-popover";
import { NovelContext } from "../provider";
import { toast } from "sonner";
import va from "@vercel/analytics";
import aiOptions from "./default_ai_options";

interface AISelectorProps {
  editor: Editor | undefined;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

interface AISelectorItem {
  name: string;
  icon: FC<{ className: string }>;
  prompt: string;
  isLoading: boolean;
}

export const AISelector: FC<AISelectorProps> = ({
  editor,
  isOpen,
  setIsOpen,
}) => {
  const [items, setItems] = useState<AISelectorItem[]>(aiOptions);

  const updateItemLoadingStatus = (index: number, status: boolean) =>
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, isLoading: status } : item
      )
    );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (NAVIGATION_KEYS.includes(e.key)) {
        e.preventDefault();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
    } else {
      document.removeEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const { completionApi } = useContext(NovelContext);

  const { complete } = useCompletion({
    id: "novel-edit",
    api: completionApi,
    initialCompletion: "",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate Limit Reached");
        return;
      }
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const onClickHandler = useCallback(
    async (index: number, prompt: string) => {
      updateItemLoadingStatus(index, true);

      const { from, to } = editor!.state.selection;
      const text = editor!.state.doc.textBetween(from, to, " ");

      const result = await complete(`${prompt}${text}`);

      if (result)
        editor!
          .chain()
          .deleteRange({ from: from, to: to })
          .insertContentAt(from, result, { updateSelection: true })
          .setTextSelection({
            from: from,
            to: from + result.length,
          })
          .run();

      setIsOpen(false);
      updateItemLoadingStatus(index, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [complete]
  );

  return (
    <Popover.Root open={isOpen}>
      <div className="novel-relative novel-h-full">
        <Popover.Trigger
          className="novel-flex novel-h-full novel-items-center novel-gap-1 novel-border-r novel-border-stone-200 novel-p-2 novel-text-sm novel-font-medium novel-text-purple-500 hover:bg-stone-100 novel-active:bg-stone-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Magic className="novel-h-4 novel-w-4" />
          <span className="novel-whitespace-nowrap">Ask AVA</span>
          <ChevronDown className="novel-h-4 novel-w-4" />
        </Popover.Trigger>

        {isOpen && (
          <Popover.Content
            align="start"
            className="novel-fixed novel-top-full novel-z-[99999] novel-mt-1 novel-w-60 novel-overflow-hidden novel-rounded novel-border novel-border-stone-200 novel-bg-white novel-p-2 novel-shadow-xl novel-animate-in novel-fade-in novel-slide-in-from-top-1"
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => onClickHandler(index, item.prompt)}
                className="novel-flex novel-w-full novel-items-center novel-justify-between novel-rounded-sm novel-px-2 novel-py-1 novel-text-sm novel-text-stone-600 hover:bg-stone-100"
              >
                <div className="novel-flex novel-items-center novel-space-x-2">
                  {item.isLoading ? (
                    <LoadingCircle />
                  ) : (
                    <item.icon className="novel-h-4 novel-w-4 novel-text-purple-500" />
                  )}
                  <span>{item.name}</span>
                </div>
                <CornerDownLeft className="novel-invisible novel-h-4 novel-w-4 novel-aria-selected:visible" />
              </button>
            ))}
          </Popover.Content>
        )}
      </div>
    </Popover.Root>
  );
};
