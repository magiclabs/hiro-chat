import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialogCancel,
  AlertDialogDescription,
} from "@radix-ui/react-alert-dialog";

export function PinInput(props: {
  open: boolean;
  title: string;
  description: string;
  onSubmit?: (s: string) => void;
  onCancel?: () => void;
  pinLength?: number;
}) {
  const [value, setValue] = useState("");
  const length = props.pinLength ?? 4;

  useEffect(() => {
    if (props.open) setValue("");
  }, [props.open]);

  return (
    <AlertDialog open={props.open}>
      <AlertDialogContent className={props.description ? "w-[24rem]" : "w-60"}>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.length === length) props.onSubmit?.(value);
          }}
        >
          <AlertDialogHeader className="items-center gap-2">
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            {props.description && (
              <AlertDialogDescription className="!mt-0 text-center opacity-60">
                {props.description}
              </AlertDialogDescription>
            )}
            <InputOTP
              autoFocus={props.open}
              maxLength={length}
              value={value}
              onChange={setValue}
            >
              <InputOTPGroup>
                {Array.from({ length }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-4">
            {props.onCancel && (
              <AlertDialogCancel onClick={() => props.onCancel?.()}>
                Cancel
              </AlertDialogCancel>
            )}
            <AlertDialogAction disabled={value.length < length} type="submit">
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const usePinInput = ({
  title = "Enter PIN",
  description = "",
  allowCancel = true,
} = {}) => {
  const [isPinOpen, setIsPinOpen] = useState(false);
  const pinPromiseRef = useRef<(s?: string) => void>();
  const pinInput = (
    <PinInput
      open={isPinOpen}
      title={title}
      description={description}
      onCancel={allowCancel ? pinPromiseRef.current : undefined}
      onSubmit={pinPromiseRef.current}
    />
  );

  const getPin = useCallback(async () => {
    setIsPinOpen(true);
    const pin = await new Promise((resolve) => {
      pinPromiseRef.current = resolve;
    });
    setIsPinOpen(false);
    return pin;
  }, []);

  return { pinInput, getPin };
};
