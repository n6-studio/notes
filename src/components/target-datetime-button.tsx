import { Trans, useLingui } from "@lingui/react/macro";
import { CalendarClock } from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** Local datetime string compatible with `<input type="datetime-local" />`. */
function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function parseDatetimeLocal(value: string): Date | undefined {
  if (!value.trim()) {
    return;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return;
  }
  return d;
}

export interface TargetDatetimeButtonProps {
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export function TargetDatetimeButton({
  value,
  onChange,
  disabled,
  className,
}: TargetDatetimeButtonProps) {
  const { i18n, t } = useLingui();
  const timeInputId = useId();
  const [open, setOpen] = useState(false);
  const selected = parseDatetimeLocal(value);
  const [timePart, setTimePart] = useState(() =>
    selected
      ? `${pad2(selected.getHours())}:${pad2(selected.getMinutes())}`
      : "09:00"
  );

  useEffect(() => {
    const d = parseDatetimeLocal(value);
    if (d) {
      setTimePart(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    } else {
      setTimePart("09:00");
    }
  }, [value]);

  const labelText =
    selected === undefined
      ? t`Date`
      : selected.toLocaleString(i18n.locale, {
          dateStyle: "medium",
          timeStyle: "short",
        });

  const onTimeChange = useCallback(
    (timeValue: string) => {
      setTimePart(timeValue);
      if (!value.trim()) {
        return;
      }
      const [h, m] = timeValue.split(":").map(Number);
      if (!(Number.isFinite(h) && Number.isFinite(m))) {
        return;
      }
      const base = parseDatetimeLocal(value);
      if (!base) {
        return;
      }
      base.setHours(h, m, 0, 0);
      onChange(toDatetimeLocalValue(base));
    },
    [onChange, value]
  );

  const onTimeInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onTimeChange(event.target.value);
    },
    [onTimeChange]
  );

  const onDaySelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        return;
      }
      const [h, m] = timePart.split(":").map(Number);
      const hh = Number.isFinite(h) ? h : 9;
      const mm = Number.isFinite(m) ? m : 0;
      const merged = new Date(date);
      merged.setHours(hh, mm, 0, 0);
      onChange(toDatetimeLocalValue(merged));
    },
    [onChange, timePart]
  );

  const clear = useCallback(() => {
    onChange("");
    setOpen(false);
  }, [onChange]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={
              selected === undefined
                ? t`Pick target date and time`
                : t`Target date ${labelText}`
            }
            className={cn(
              "max-w-[min(160px,100%)] shrink-0 justify-start gap-2 font-normal text-muted-foreground",
              className
            )}
            disabled={disabled}
            size="sm"
            type="button"
            variant="ghost"
          />
        }
      >
        <CalendarClock className="size-4 shrink-0" />
        <span className="truncate">{labelText}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto gap-0 overflow-hidden p-0"
      >
        <Calendar
          defaultMonth={selected ?? new Date()}
          mode="single"
          onSelect={onDaySelect}
          selected={selected}
        />
        <Separator />
        <div className="flex items-center gap-3 px-4 py-3">
          <Label
            className="shrink-0 text-muted-foreground"
            htmlFor={timeInputId}
          >
            <Trans>Time</Trans>
          </Label>
          <Input
            className="h-9 max-w-36 bg-background/50"
            id={timeInputId}
            onChange={onTimeInputChange}
            step={60}
            type="time"
            value={timePart}
          />
        </div>
        <div className="flex justify-end border-border/60 border-t px-3 py-2">
          <Button
            className="text-muted-foreground"
            disabled={!value.trim()}
            onClick={clear}
            size="xs"
            type="button"
            variant="ghost"
          >
            <Trans>Clear</Trans>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
