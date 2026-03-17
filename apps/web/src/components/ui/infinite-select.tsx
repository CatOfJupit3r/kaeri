import { ClientOnly } from '@tanstack/react-router';
import { merge } from 'lodash-es';
import type { ReactNode, Ref } from 'react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { LuLoader } from 'react-icons/lu';
import SelectComponent, { components, createFilter } from 'react-select';
import type { ActionMeta, GroupBase, MenuListProps, Props, SelectInstance } from 'react-select';

import { cn } from '@~/lib/utils';
import { isOnClient } from '@~/utils/ssr-helpers';

import type { iOptionType } from './select';
import {
  ClearIndicator,
  defaultClassNames,
  defaultStyles,
  DropdownIndicator,
  Menu,
  MultiValue,
  MultiValueRemove,
  Option,
  SingleValue,
} from './select';

interface iInfiniteSelectBaseProps<IsMulti extends boolean = false> extends Omit<
  Props<iOptionType, IsMulti, GroupBase<iOptionType>>,
  'options' | 'isLoading'
> {
  /** Items loaded so far */
  items: iOptionType[];
  /** Whether more items are loading */
  isLoadingMore?: boolean;
  /** Whether the initial load is happening */
  isLoading?: boolean;
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Called when more items should be loaded */
  onLoadMore?: VoidFunction;
  /** Total count (optional, for display) */
  total?: number;
  /** Whether to use DOM portal target */
  isDOMTarget?: boolean;
}

const OPTION_HEIGHT = 35;
const MAX_VISIBLE_OPTIONS = 6;
const MAX_MENU_HEIGHT = OPTION_HEIGHT * MAX_VISIBLE_OPTIONS;
const LOAD_MORE_THRESHOLD = 50; // px from bottom to trigger load more

/**
 * Custom MenuList with infinite scroll support
 */
function InfiniteMenuList({
  children,
  hasMore,
  isLoadingMore,
  onLoadMore,
  ...props
}: MenuListProps<iOptionType> & {
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: VoidFunction;
}) {
  const menuListRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = menuListRef.current;
    if (!el || !hasMore || isLoadingMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - LOAD_MORE_THRESHOLD;

    if (isNearBottom) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const el = menuListRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const shouldShowAllLoaded = !hasMore && !isLoadingMore;

  return (
    <div ref={menuListRef} className={cn('morel-scrollbar max-h-52 overflow-y-auto', props.className)}>
      <components.MenuList {...props}>{children}</components.MenuList>
      {isLoadingMore ? (
        <div className="flex items-center justify-center py-2 text-muted-foreground">
          <LuLoader className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm">Loading more...</span>
        </div>
      ) : null}
      {shouldShowAllLoaded ? (
        <div className="py-2 text-center text-xs text-muted-foreground">All items loaded</div>
      ) : null}
    </div>
  );
}

const BaseInfiniteSelect = <IsMulti extends boolean = false>(
  props: iInfiniteSelectBaseProps<IsMulti> & { isMulti?: IsMulti },
  ref: Ref<SelectInstance<iOptionType, IsMulti, GroupBase<iOptionType>>>,
) => {
  const {
    items,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore,
    styles = defaultStyles,
    classNames = {},
    components: componentsFromProps = {},
    isDOMTarget = true,
    maxMenuHeight = MAX_MENU_HEIGHT,
    ...rest
  } = props;
  const instanceId = useId();

  // Custom MenuList with infinite scroll
  const MenuListWithInfinite = useCallback(
    (menuListProps: MenuListProps<iOptionType>) => (
      <InfiniteMenuList {...menuListProps} hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={onLoadMore} />
    ),
    [hasMore, isLoadingMore, onLoadMore],
  );

  return (
    <ClientOnly>
      <SelectComponent<iOptionType, IsMulti, GroupBase<iOptionType>>
        ref={ref}
        instanceId={instanceId}
        unstyled
        filterOption={createFilter({
          matchFrom: 'any',
          stringify: (option) => option.label,
        })}
        menuPortalTarget={isDOMTarget && isOnClient ? document.body : undefined}
        maxMenuHeight={maxMenuHeight}
        isLoading={isLoading}
        options={items}
        components={{
          DropdownIndicator,
          ClearIndicator,
          MultiValueRemove,
          MultiValue,
          Option,
          SingleValue,
          Menu,
          MenuList: MenuListWithInfinite,
          ...componentsFromProps,
        }}
        styles={styles}
        classNames={merge(defaultClassNames, classNames)}
        {...rest}
      />
    </ClientOnly>
  );
};

const ForwardedInfiniteSelect = forwardRef(BaseInfiniteSelect) as <IsMulti extends boolean = false>(
  p: iInfiniteSelectBaseProps<IsMulti> & {
    ref?: Ref<SelectInstance<iOptionType, IsMulti, GroupBase<iOptionType>>>;
    isMulti?: IsMulti;
  },
) => ReactNode;

export interface iInfiniteSingleSelectProps extends Omit<
  iInfiniteSelectBaseProps,
  'value' | 'defaultValue' | 'onChange' | 'isMulti'
> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, option: iOptionType | null, action: ActionMeta<iOptionType>) => void;
  onOptionChange?: Props<iOptionType, false, GroupBase<iOptionType>>['onChange'];
}

/**
 * Single select with infinite scroll support.
 * Use this for selects that need to load large datasets.
 *
 * @example
 * ```tsx
 * const { items, hasMore, fetchNextPage, isFetchingNextPage, isPending } = useCharacterListInfinite(seriesId);
 *
 * <InfiniteSingleSelect
 *   items={items.map(c => ({ label: c.name, value: c._id }))}
 *   isLoading={isPending}
 *   isLoadingMore={isFetchingNextPage}
 *   hasMore={hasMore}
 *   onLoadMore={() => fetchNextPage()}
 *   value={selectedId}
 *   onValueChange={setSelectedId}
 *   placeholder="Select a character..."
 * />
 * ```
 */
export const InfiniteSingleSelect = forwardRef<
  SelectInstance<iOptionType, false, GroupBase<iOptionType>>,
  iInfiniteSingleSelectProps
>(({ value, defaultValue, onValueChange, onOptionChange, items, ...rest }, ref) => {
  const computedValue = useMemo<iOptionType | null | undefined>(() => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return items.find((option) => option.value === value) ?? null;
  }, [items, value]);

  const computedDefaultValue = useMemo<iOptionType | null | undefined>(() => {
    if (defaultValue === undefined) return undefined;
    if (defaultValue === null) return null;
    return items.find((option) => option.value === defaultValue) ?? null;
  }, [defaultValue, items]);

  return (
    <ForwardedInfiniteSelect
      {...rest}
      ref={ref}
      items={items}
      value={computedValue}
      defaultValue={computedDefaultValue}
      onChange={(selected, actionMeta) => {
        onOptionChange?.(selected, actionMeta);
        const normalizedOption = selected ?? null;
        onValueChange?.(normalizedOption?.value ?? null, normalizedOption, actionMeta);
      }}
    />
  );
});
InfiniteSingleSelect.displayName = 'InfiniteSingleSelect';

export interface iInfiniteMultiSelectProps extends Omit<
  iInfiniteSelectBaseProps<true>,
  'value' | 'defaultValue' | 'onChange' | 'isMulti'
> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[], options: iOptionType[], action: ActionMeta<iOptionType>) => void;
  onOptionChange?: Props<iOptionType, true, GroupBase<iOptionType>>['onChange'];
}

/**
 * Multi select with infinite scroll support.
 * Use this for multi-selects that need to load large datasets.
 *
 * @example
 * ```tsx
 * const { items, hasMore, fetchNextPage, isFetchingNextPage, isPending } = useCharacterListInfinite(seriesId);
 *
 * <InfiniteMultiSelect
 *   items={items.map(c => ({ label: c.name, value: c._id }))}
 *   isLoading={isPending}
 *   isLoadingMore={isFetchingNextPage}
 *   hasMore={hasMore}
 *   onLoadMore={() => fetchNextPage()}
 *   value={selectedIds}
 *   onValueChange={setSelectedIds}
 *   placeholder="Select characters..."
 * />
 * ```
 */
export const InfiniteMultiSelect = forwardRef<
  SelectInstance<iOptionType, true, GroupBase<iOptionType>>,
  iInfiniteMultiSelectProps
>(({ value, defaultValue, onValueChange, onOptionChange, items, closeMenuOnSelect = false, ...rest }, ref) => {
  const computedValue = useMemo<readonly iOptionType[] | undefined>(() => {
    if (value === undefined) return undefined;
    if (!value || value.length === 0) return [];
    const lookup = new Set(value);
    return items.filter((option) => lookup.has(option.value));
  }, [items, value]);

  const computedDefaultValue = useMemo<readonly iOptionType[] | undefined>(() => {
    if (defaultValue === undefined) return undefined;
    if (!defaultValue || defaultValue.length === 0) return [];
    const lookup = new Set(defaultValue);
    return items.filter((option) => lookup.has(option.value));
  }, [defaultValue, items]);

  return (
    <ForwardedInfiniteSelect
      {...rest}
      ref={ref}
      isMulti
      items={items}
      closeMenuOnSelect={closeMenuOnSelect}
      value={computedValue}
      defaultValue={computedDefaultValue}
      onChange={(selected, actionMeta) => {
        onOptionChange?.(selected, actionMeta);
        const normalizedOptions: iOptionType[] = Array.isArray(selected) ? [...selected] : [];
        onValueChange?.(
          normalizedOptions.map((option) => option.value),
          normalizedOptions,
          actionMeta,
        );
      }}
    />
  );
});
InfiniteMultiSelect.displayName = 'InfiniteMultiSelect';
