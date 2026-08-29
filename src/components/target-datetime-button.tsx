import { Trans, useLingui } from "@lingui/react/macro";
import { CalendarClock, X } from "lucide-react";
import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { Badge } from "~/components/ui/badge";
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
import {
  DEFAULT_TARGET_TIME,
  localDateAtTime,
  parseDatetimeLocal,
  presetForLocalValue,
  shiftLocalDay,
  type TargetDatetimePreset,
  timePartFromDate,
  toDatetimeLocalValue,
} from "~/lib/target-datetime";
import { cn } from "~/lib/utils";

const PRESET_BADGE_CLASS = "h-8 px-2.5 transition-colors duration-150";

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
  const preset = presetForLocalValue(value);
  const [timePart, setTimePart] = useState(() =>
    selected ? timePartFromDate(selected) : DEFAULT_TARGET_TIME
  );

  useEffect(() => {
    const d = parseDatetimeLocal(value);
    if (d) {
      setTimePart(timePartFromDate(d));
    } else {
      setTimePart(DEFAULT_TARGET_TIME);
    }
  }, [value]);

  const labelText =
    selected === undefined
      ? t`Pick target date and time`
      : selected.toLocaleString(i18n.locale, {
          dateStyle: "medium",
          timeStyle: "short",
        });

  const shortDate =
    selected === undefined
      ? ""
      : selected.toLocaleDateString(i18n.locale, {
          day: "numeric",
          month: "short",
        });

  const onTimeChange = useCallback(
    (timeValue: string) => {
      setTimePart(timeValue);
      if (!value.trim()) {
        return;
      }
      const base = parseDatetimeLocal(value);
      if (!base) {
        return;
      }
      onChange(toDatetimeLocalValue(localDateAtTime(base, timeValue)));
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
      onChange(toDatetimeLocalValue(localDateAtTime(date, timePart)));
    },
    [onChange, timePart]
  );

  const clear = useCallback(() => {
    onChange("");
    setOpen(false);
  }, [onChange]);

  const onClearChip = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      clear();
    },
    [clear]
  );

  const togglePreset = useCallback(
    (next: Exclude<TargetDatetimePreset, "custom">) => {
      if (preset === next) {
        onChange("");
        return;
      }
      const day = next === "today" ? new Date() : shiftLocalDay(new Date(), 1);
      onChange(toDatetimeLocalValue(localDateAtTime(day, timePart)));
    },
    [onChange, preset, timePart]
  );

  const onTodayClick = useCallback(() => {
    togglePreset("today");
  }, [togglePreset]);

  const onTomorrowClick = useCallback(() => {
    togglePreset("tomorrow");
  }, [togglePreset]);

  const picker = (
    <PopoverContent align="start" className="w-auto gap-0 overflow-hidden p-0">
      <Calendar
        defaultMonth={selected ?? new Date()}
        mode="single"
        onSelect={onDaySelect}
        selected={selected}
      />
      <Separator />
      <div className="flex items-center gap-3 px-4 py-3">
        <Label className="shrink-0 text-muted-foreground" htmlFor={timeInputId}>
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
  );

  return (
    <fieldset
      className={cn("m-0 flex items-center gap-1 border-0 p-0", className)}
    >
      <legend className="sr-only">
        <Trans>Pick target date and time</Trans>
      </legend>
      <Popover onOpenChange={setOpen} open={open}>
        {preset === "custom" && selected ? (
          <Badge
            className="h-8 gap-0.5 pr-1 pl-2.5 transition-colors duration-150"
            variant="secondary"
          >
            <PopoverTrigger
              render={
                <button
                  aria-expanded={open}
                  aria-haspopup="dialog"
                  aria-label={t`Target date ${labelText}`}
                  className="font-medium"
                  disabled={disabled}
                  type="button"
                />
              }
            >
              {shortDate}
            </PopoverTrigger>
            <button
              aria-label={t`Clear date`}
              className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"
              disabled={disabled}
              onClick={onClearChip}
              type="button"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ) : (
          <>
            <Badge
              aria-pressed={preset === "today"}
              className={PRESET_BADGE_CLASS}
              onClick={onTodayClick}
              render={<button disabled={disabled} type="button" />}
              variant={preset === "today" ? "secondary" : "outline"}
            >
              <Trans>Today</Trans>
            </Badge>
            <Badge
              aria-pressed={preset === "tomorrow"}
              className={PRESET_BADGE_CLASS}
              onClick={onTomorrowClick}
              render={<button disabled={disabled} type="button" />}
              variant={preset === "tomorrow" ? "secondary" : "outline"}
            >
              <Trans>Tomorrow</Trans>
            </Badge>
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
                  className="text-muted-foreground"
                  disabled={disabled}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                />
              }
            >
              <CalendarClock />
            </PopoverTrigger>
          </>
        )}
        {picker}
      </Popover>
    </fieldset>
  );
}
