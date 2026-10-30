"use client";

/**
 * C-157 / C-155 — 21st chatgpt-prompt-input (id=3035) adapted to Dark Luxury.
 * Structure: attach image · tools popover · mic · send.
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
  }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md px-1.5 py-1 text-xs",
        "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-glass)]",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    >
      {props.children}
      {showArrow ? (
        <TooltipPrimitive.Arrow className="-my-px fill-[var(--bg-elevated)]" />
      ) : null}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-xl p-2 shadow-md outline-none",
        "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-glass)]",
        "animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--bg-elevated)] p-1 shadow-2xl border border-[var(--border-glass)]">
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-[var(--bg-canvas)] p-1 transition-all hover:bg-[var(--bg-hover)]">
          <XIcon className="h-5 w-5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 5V19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Settings2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 7h-9" />
    <path d="M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 5.25L12 18.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 12L12 5.25L5.25 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.71 4.63a1 1 0 0 0-1.41 0l-2.83 2.83-1.41-1.41 2.83-2.83a1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 0L7 11.17V14h2.83L20.71 3.12a1 1 0 0 0 0-1.41zM4 18c0 1.1.9 2 2 2h2c2.21 0 4-1.79 4-4v-1H7a3 3 0 0 0-3 3z" />
  </svg>
);

const TelescopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.13" />
    <path d="m13.412 11.774 4.38 1.044" />
    <path d="m16.186 4.222 1.76 4.345" />
    <path d="m18 15-2.5 2.5" />
    <path d="m9 18 6 3" />
    <path d="m14 15 4 3" />
  </svg>
);

const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 7C9.23858 7 7 9.23858 7 12C7 13.3613 7.54402 14.5955 8.42651 15.4972C8.77025 15.8484 9.05281 16.2663 9.14923 16.7482L9.67833 19.3924C9.86537 20.3272 10.6862 21 11.6395 21H12.3605C13.3138 21 14.1346 20.3272 14.3217 19.3924L14.8508 16.7482C14.9472 16.2663 15.2297 15.8484 15.5735 15.4972C16.456 14.5955 17 13.3613 17 12C17 9.23858 14.7614 7 12 7Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 4V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 6L19 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12H3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5L6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 17H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

const toolsList = [
  {
    id: "createImage",
    name: "Create an image",
    shortName: "Image",
    icon: PaintBrushIcon,
  },
  {
    id: "searchWeb",
    name: "Search the web",
    shortName: "Search",
    icon: GlobeIcon,
  },
  {
    id: "writeCode",
    name: "Write or code",
    shortName: "Write",
    icon: PencilIcon,
  },
  {
    id: "deepResearch",
    name: "Run deep research",
    shortName: "Deep Search",
    icon: TelescopeIcon,
    extra: "5 left",
  },
  {
    id: "thinkLonger",
    name: "Think for longer",
    shortName: "Think",
    icon: LightbulbIcon,
  },
] as const;

export type PromptBoxProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onSubmit"
> & {
  /** Controlled value (AgentChatComposer / mic). */
  value?: string;
  onValueChange?: (value: string) => void;
  onSend?: () => void;
  onMicClick?: () => void;
  micListening?: boolean;
  micDisabled?: boolean;
  sendDisabled?: boolean;
  /** C-carousel-chrome — hide Plus attach + Tools popover (Create footer). */
  hideTools?: boolean;
  /**
   * S48 — slot inside input chrome (mic-area row), e.g. HandoffRoundButton.
   * Renders left of mic/send inside the rounded PromptBox shell.
   */
  trailingActions?: React.ReactNode;
};

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  (
    {
      className,
      value: valueProp,
      onValueChange,
      onChange,
      onSend,
      onMicClick,
      micListening = false,
      micDisabled = false,
      sendDisabled = false,
      hideTools = false,
      trailingActions,
      disabled,
      placeholder = "Message...",
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uncontrolled, setUncontrolled] = React.useState("");
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [selectedTool, setSelectedTool] = React.useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolled;

    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);

    React.useLayoutEffect(() => {
      const textarea = internalTextareaRef.current;
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, [value]);

    const setValue = (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onChange?.(e);
    };

    const handlePlusClick = () => {
      if (disabled) return;
      fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      event.target.value = "";
    };

    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const hasValue = value.trim().length > 0 || Boolean(imagePreview);
    const canSend = hasValue && !sendDisabled && !disabled;
    const activeTool = selectedTool
      ? toolsList.find((t) => t.id === selectedTool)
      : null;
    const ActiveToolIcon = activeTool?.icon;

    return (
      <div
        data-testid="agent-chat-prompt-box"
        className={cn(
          "flex cursor-text flex-col rounded-[28px] border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-2 shadow-sm transition-colors",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {imagePreview ? (
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <div className="relative mb-1 w-fit rounded-[1rem] px-1 pt-1">
              <button
                type="button"
                className="transition-transform"
                onClick={() => setIsImageDialogOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Image preview"
                  className="h-14 w-14 rounded-[1rem] object-cover"
                />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
                aria-label="Remove image"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <DialogContent>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Full size preview"
                className="max-h-[95vh] w-full rounded-[24px] object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : null}

        <textarea
          {...props}
          ref={internalTextareaRef}
          data-testid="agent-chat-input"
          name="message"
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend?.();
            }
          }}
          className={cn(
            "custom-scrollbar w-full min-h-12 resize-none border-0 bg-transparent p-3",
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "focus:ring-0 focus-visible:outline-none",
          )}
        />

        <div className="mt-0.5 p-1 pt-0">
          <TooltipProvider delayDuration={100}>
            <div
              data-testid="agent-chat-actions"
              className="flex items-center gap-2"
            >
              {!hideTools ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handlePlusClick}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none"
                      >
                        <PlusIcon className="h-6 w-6" />
                        <span className="sr-only">Attach image</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow>
                      <p>Attach image</p>
                    </TooltipContent>
                  </Tooltip>

                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 items-center gap-2 rounded-full p-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none"
                          >
                            <Settings2Icon className="h-4 w-4" />
                            {!selectedTool ? "Tools" : null}
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" showArrow>
                        <p>Explore Tools</p>
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent side="top" align="start">
                      <div className="flex flex-col gap-1">
                        {toolsList.map((tool) => (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              setSelectedTool(tool.id);
                              setIsPopoverOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-[var(--bg-hover)]"
                          >
                            <tool.icon className="h-4 w-4" />
                            <span>{tool.name}</span>
                            {"extra" in tool && tool.extra ? (
                              <span className="ml-auto text-xs text-[var(--text-muted)]">
                                {tool.extra}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeTool ? (
                    <>
                      <div className="h-4 w-px bg-[var(--border-glass)]" />
                      <button
                        type="button"
                        onClick={() => setSelectedTool(null)}
                        className="flex h-8 flex-row items-center justify-center gap-2 rounded-full px-2 text-sm text-[var(--accent-blue-bright)] transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        {ActiveToolIcon ? (
                          <ActiveToolIcon className="h-4 w-4" />
                        ) : null}
                        {activeTool.shortName}
                        <XIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}
                </>
              ) : null}

              <div className="ml-auto flex items-center gap-2">
                {/* S48 — handoff / extra actions inside PromptBox chrome */}
                {trailingActions ? (
                  <div
                    data-testid="prompt-box-trailing-actions"
                    className="flex items-center gap-1.5"
                  >
                    {trailingActions}
                  </div>
                ) : null}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-testid="agent-chat-mic"
                      disabled={micDisabled || disabled}
                      onClick={() => onMicClick?.()}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none disabled:opacity-40",
                        micListening && "text-[var(--accent-terracotta)]",
                      )}
                      aria-label={
                        micListening ? "Остановить запись" : "Голосовой ввод"
                      }
                    >
                      <MicIcon className="h-5 w-5" />
                      <span className="sr-only">Record voice</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" showArrow>
                    <p>{micListening ? "Stop" : "Record voice"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-testid="agent-chat-send"
                      disabled={!canSend}
                      onClick={() => onSend?.()}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
                        "bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90",
                        "disabled:pointer-events-none disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)]",
                      )}
                      aria-label="Отправить сообщение"
                    >
                      <SendIcon className="h-6 w-6" />
                      <span className="sr-only">Send message</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" showArrow>
                    <p>Send</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
    );
  },
);
PromptBox.displayName = "PromptBox";
