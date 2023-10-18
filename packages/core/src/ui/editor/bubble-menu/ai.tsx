import React, { useEffect, useState } from "react";
import { LoadingCircle } from "@/ui/icons";
// import LoadingDots from "@/ui/shared/loading-dots";
import { Magic } from "@/ui/icons";
import { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react";
// import { useCompletion } from "ai/react";

type Props = {
  editor: Editor | null;
  completion: string;
};

const AIBubbleMenu: React.FC<Props> = ({ editor, completion }: Props) => {
  // const { completion } = useCompletion({
  //   id: "novel-edit",
  //   api: "/api/generate",
  // });
  const [completionContent, setCompletionContent] = useState<string>("");

  useEffect(() => {
    setCompletionContent(completion);
  }, [completion]);

  return (
    <BubbleMenu
      editor={editor ?? undefined}
      tippyOptions={{
        placement: "bottom",
        popperOptions: {
          strategy: "fixed",
        },
      }}
      className="novel-mt-2 novel-w-full novel-overflow-hidden novel-rounded novel-border novel-border-stone-200 novel-bg-white novel-shadow-xl novel-animate-in novel-fade-in novel-slide-in-from-bottom-1"
    >
      <div className="novel-p-4">
        {completionContent.length > 0 ? (
          completionContent
        ) : (
          <LoadingCircle
          // className="h-4 w-4"
          />
        )}
      </div>
      <div className="novel-flex novel-w-full novel-items-center novel-bg-stone-100 novel-p-2">
        <div className="novel-flex novel-items-center novel-space-x-1 novel-text-stone-500">
          <Magic className="novel-h-5 novel-w-5" />
          <p className="novel-text-sm novel-font-medium">AI is writing</p>
          {/* <LoadingDots color="#78716C" /> */}
          <LoadingCircle
          // className="h-4 w-4"
          />
        </div>
      </div>
    </BubbleMenu>
  );
};

export default AIBubbleMenu;
