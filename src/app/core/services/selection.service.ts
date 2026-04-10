import { Injectable, signal, computed } from '@angular/core';

/**
 * Generic selection service for managing selection state
 * Supports any entity type with proper type safety
 */
@Injectable({
  providedIn: 'root',
})
export class SelectionService<T> {
  // Private state using Set for efficient lookups
  private readonly selectedSet = signal<Set<T>>(new Set());

  // Public signals
  public readonly selected = computed(() => Array.from(this.selectedSet()));
  public readonly selectedCount = computed(() => this.selectedSet().size);
  public readonly isNotEmpty = computed(() => this.selectedSet().size > 0);
  public readonly isEmpty = computed(() => this.selectedSet().size === 0);

  /**
   * Toggle item selection
   * Adds item if not selected, removes if already selected
   * @param item Item to toggle
   */
  toggle(item: T): void {
    const currentSet = this.selectedSet();

    if (currentSet.has(item)) {
      // Remove item
      const newSet = new Set(currentSet);
      newSet.delete(item);
      this.selectedSet.set(newSet);
    } else {
      // Add item
      const newSet = new Set(currentSet);
      newSet.add(item);
      this.selectedSet.set(newSet);
    }
  }

  /**
   * Select a single item (clears previous selection)
   * @param item Item to select
   */
  select(item: T): void {
    this.selectedSet.set(new Set([item]));
  }

  /**
   * Select multiple items (replaces current selection)
   * @param items Items to select
   */
  selectMany(items: T[]): void {
    this.selectedSet.set(new Set(items));
  }

  /**
   * Select all items from a list
   * @param items All items to select
   */
  selectAll(items: T[]): void {
    this.selectedSet.set(new Set(items));
  }

  /**
   * Deselect a specific item
   * @param item Item to deselect
   */
  deselect(item: T): void {
    const currentSet = this.selectedSet();

    if (currentSet.has(item)) {
      const newSet = new Set(currentSet);
      newSet.delete(item);
      this.selectedSet.set(newSet);
    }
  }

  /**
   * Deselect multiple items
   * @param items Items to deselect
   */
  deselectMany(items: T[]): void {
    const currentSet = this.selectedSet();
    const newSet = new Set(currentSet);

    items.forEach((item) => newSet.delete(item));

    this.selectedSet.set(newSet);
  }

  /**
   * Deselect all items
   */
  deselectAll(): void {
    this.selectedSet.set(new Set());
  }

  /**
   * Clear selection (alias for deselectAll)
   */
  clear(): void {
    this.deselectAll();
  }

  /**
   * Check if item is selected
   * @param item Item to check
   * @returns true if item is selected
   */
  isSelected(item: T): boolean {
    return this.selectedSet().has(item);
  }

  /**
   * Check if any items are selected
   * @returns true if at least one item is selected
   */
  hasSelection(): boolean {
    return this.selectedSet().size > 0;
  }

  /**
   * Check if all items from a list are selected
   * @param items Items to check
   * @returns true if all items are selected
   */
  areAllSelected(items: T[]): boolean {
    const currentSet = this.selectedSet();

    return items.length > 0 && items.every((item) => currentSet.has(item));
  }

  /**
   * Check if some items from a list are selected
   * @param items Items to check
   * @returns true if at least one item is selected
   */
  areSomeSelected(items: T[]): boolean {
    const currentSet = this.selectedSet();

    return items.some((item) => currentSet.has(item));
  }

  /**
   * Check if exactly one item is selected
   * @returns true if only one item is selected
   */
  isSingleSelected(): boolean {
    return this.selectedSet().size === 1;
  }

  /**
   * Check if multiple items are selected
   * @returns true if more than one item is selected
   */
  isMultipleSelected(): boolean {
    return this.selectedSet().size > 1;
  }

  /**
   * Get the first selected item
   * @returns First selected item or undefined
   */
  getFirstSelected(): T | undefined {
    const selectedArray = Array.from(this.selectedSet());
    return selectedArray[0];
  }

  /**
   * Get all selected items as array
   * @returns Array of selected items
   */
  getSelected(): T[] {
    return Array.from(this.selectedSet());
  }

  /**
   * Get selected items count
   * @returns Number of selected items
   */
  getCount(): number {
    return this.selectedSet().size;
  }

  /**
   * Replace current selection with new items
   * @param items New selection
   */
  setSelection(items: T[]): void {
    this.selectedSet.set(new Set(items));
  }

  /**
   * Filter selected items based on predicate
   * @param predicate Filter function
   * @returns Filtered selected items
   */
  filterSelected(predicate: (item: T) => boolean): T[] {
    return this.getSelected().filter(predicate);
  }

  /**
   * Map selected items to different type
   * @param mapper Map function
   * @returns Mapped array
   */
  mapSelected<R>(mapper: (item: T) => R): R[] {
    return this.getSelected().map(mapper);
  }

  /**
   * Check if selected items match a condition
   * @param predicate Predicate function
   * @returns true if all selected items match predicate
   */
  everySelected(predicate: (item: T) => boolean): boolean {
    return this.getSelected().every(predicate);
  }

  /**
   * Check if any selected item matches a condition
   * @param predicate Predicate function
   * @returns true if any selected item matches predicate
   */
  someSelected(predicate: (item: T) => boolean): boolean {
    return this.getSelected().some(predicate);
  }

  /**
   * Get selected items IDs (for entities with id property)
   * @returns Array of IDs
   */
  getSelectedIds(): (string | number)[] {
    return this.getSelected()
      .filter((item) => typeof item === 'object' && item !== null && 'id' in item)
      .map((item) => (item as { id: string | number }).id);
  }

  /**
   * Select items by IDs (for entities with id property)
   * @param items All items
   * @param ids IDs to select
   */
  selectByIds(items: T[], ids: (string | number)[]): void {
    const idSet = new Set(ids);

    const itemsToSelect = items.filter((item) => {
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return idSet.has((item as { id: string | number }).id);
      }
      return false;
    });

    this.selectMany(itemsToSelect);
  }

  /**
   * Toggle all items (select all if none/some selected, deselect all if all selected)
   * @param items All items
   */
  toggleAll(items: T[]): void {
    if (this.areAllSelected(items)) {
      this.deselectAll();
    } else {
      this.selectAll(items);
    }
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.selectedSet.set(new Set());
  }

  /**
   * Clone selection service for independent instance
   * @returns New SelectionService instance with copied selection
   */
  clone(): SelectionService<T> {
    const newService = new SelectionService<T>();
    newService.selectMany(this.getSelected());
    return newService;
  }
}

/**
 * Factory function for SelectionService
 * Required for Angular's inject()-based DI
 */
export function selectionServiceFactory<T>(): SelectionService<T> {
  return new SelectionService<T>();
}
