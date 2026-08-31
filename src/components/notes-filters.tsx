import { Trans, useLingui } from "@lingui/react/macro";
import { ListFilter, Search, X } from "lucide-react";
import { type ChangeEvent, useCallback, useId } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  NOTE_LABEL_ICONS,
  NOTE_TYPES,
  type NoteType,
  noteLabelMessage,
} from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";

const TAP_SCALE =
  "transition-[scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96]";

export function NotesFilters({
  day,
  onDayChange,
  onSearchChange,
  onSortChange,
  onTypeFilterChange,
  q,
  sort,
  typeFilter,
}: {
  day: string;
  onDayChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: "desc" | "asc") => void;
  onTypeFilterChange: (value: NoteType | "all") => void;
  q: string;
  sort: "desc" | "asc";
  typeFilter: NoteType | "all";
}) {
  const { i18n, t } = useLingui();
  const searchId = useId();
  const dayId = `${searchId}-day`;
  const activeCount = (typeFilter === "all" ? 0 : 1) + (day === "" ? 0 : 1);

  const onSearchInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange]
  );

  const onTypeValueChange = useCallback(
    (next: string[]) => {
      const [selected] = next;
      if (selected === "all" || selected === "note" || selected === "url") {
        onTypeFilterChange(selected);
      }
    },
    [onTypeFilterChange]
  );

  const onDayInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onDayChange(event.target.value);
    },
    [onDayChange]
  );

  const onClearDay = useCallback(() => {
    onDayChange("");
  }, [onDayChange]);

  const onSortValueChange = useCallback(
    (next: string[]) => {
      const [selected] = next;
      if (selected === "desc" || selected === "asc") {
        onSortChange(selected);
      }
    },
    [onSortChange]
  );

  const onClearPopoverFilters = useCallback(() => {
    onTypeFilterChange("all");
    onDayChange("");
  }, [onDayChange, onTypeFilterChange]);

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={searchId}>
          <Trans>Search</Trans>
        </label>
        <InputGroup>
          <InputGroupAddon>
            <Search aria-hidden className="size-4" strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id={searchId}
            onChange={onSearchInput}
            placeholder={t`Full-text search…`}
            type="search"
            value={q}
          />
        </InputGroup>
      </div>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-haspopup="dialog"
              aria-label={t`Filters`}
              className={cn("shrink-0", TAP_SCALE)}
              type="button"
              variant={activeCount > 0 ? "secondary" : "outline"}
            />
          }
        >
          <ListFilter
            aria-hidden
            className="size-4"
            data-icon="inline-start"
            strokeWidth={2}
          />
          <Trans>Filters</Trans>
          {activeCount > 0 ? (
            <Badge
              aria-hidden
              className="h-5 min-w-5 px-1 tabular-nums"
              variant="default"
            >
              {activeCount}
            </Badge>
          ) : null}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-4" sideOffset={8}>
          <PopoverTitle className="sr-only">
            <Trans>Filters</Trans>
          </PopoverTitle>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-muted-foreground text-xs">
                <Trans>Type</Trans>
              </p>
              <ToggleGroup
                aria-label={t`Type`}
                className="w-full"
                onValueChange={onTypeValueChange}
                size="sm"
                spacing={0}
                value={[typeFilter]}
                variant="outline"
              >
                <ToggleGroupItem className="flex-1" value="all">
                  <Trans>All</Trans>
                </ToggleGroupItem>
                {NOTE_TYPES.map((label) => {
                  const Icon = NOTE_LABEL_ICONS[label];
                  return (
                    <ToggleGroupItem
                      className="flex-1 data-pressed:[&_svg]:fill-current"
                      key={label}
                      value={label}
                    >
                      <Icon
                        aria-hidden
                        className="size-4 shrink-0"
                        data-icon="inline-start"
                        strokeWidth={2}
                      />
                      {i18n._(noteLabelMessage(label))}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                className="font-medium text-muted-foreground text-xs"
                htmlFor={dayId}
              >
                <Trans>Day</Trans>
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  className="h-8"
                  id={dayId}
                  onChange={onDayInput}
                  type="date"
                  value={day}
                />
                {day ? (
                  <Button
                    aria-label={t`Clear date`}
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      TAP_SCALE
                    )}
                    onClick={onClearDay}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <X strokeWidth={2} />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-muted-foreground text-xs">
                <Trans>Sort</Trans>
              </p>
              <ToggleGroup
                aria-label={t`Sort`}
                className="w-full"
                onValueChange={onSortValueChange}
                size="sm"
                spacing={0}
                value={[sort]}
                variant="outline"
              >
                <ToggleGroupItem className="flex-1" value="desc">
                  <Trans>Newest</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem className="flex-1" value="asc">
                  <Trans>Oldest</Trans>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {activeCount > 0 ? (
            <>
              <Separator />
              <Button
                className={cn("self-start", TAP_SCALE)}
                onClick={onClearPopoverFilters}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trans>Clear filters</Trans>
              </Button>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
