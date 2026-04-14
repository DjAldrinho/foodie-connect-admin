import { TestBed } from '@angular/core/testing';
import { SelectionService } from './selection.service';

/**
 * Test interface for selection tests
 */
interface TestItem {
  id: string;
  name: string;
}

/**
 * SelectionService Unit Tests
 *
 * Tests for generic selection service with type safety
 */
describe('SelectionService', () => {
  let service: SelectionService<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelectionService],
    });

    service = TestBed.inject(SelectionService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with empty selection', () => {
      expect(service.selectedCount()).toBe(0);
      expect(service.isEmpty()).toBe(true);
      expect(service.isNotEmpty()).toBe(false);
    });

    it('should return empty array for selected items', () => {
      expect(service.selected()).toEqual([]);
    });
  });

  describe('toggle() method', () => {
    it('should add item when not selected', () => {
      service.toggle('item1');

      expect(service.isSelected('item1')).toBe(true);
      expect(service.selectedCount()).toBe(1);
    });

    it('should remove item when already selected', () => {
      service.toggle('item1');
      service.toggle('item1');

      expect(service.isSelected('item1')).toBe(false);
      expect(service.selectedCount()).toBe(0);
    });

    it('should handle multiple toggle operations', () => {
      service.toggle('item1');
      service.toggle('item2');
      service.toggle('item1');

      expect(service.isSelected('item1')).toBe(false);
      expect(service.isSelected('item2')).toBe(true);
      expect(service.selectedCount()).toBe(1);
    });
  });

  describe('select() method', () => {
    it('should select single item and clear previous selection', () => {
      service.select('item1');
      service.select('item2');

      expect(service.selectedCount()).toBe(1);
      expect(service.isSelected('item2')).toBe(true);
      expect(service.isSelected('item1')).toBe(false);
    });

    it('should replace existing selection', () => {
      service.toggle('item1');
      service.toggle('item2');
      service.select('item3');

      expect(service.selectedCount()).toBe(1);
      expect(service.isSelected('item3')).toBe(true);
    });
  });

  describe('selectMany() method', () => {
    it('should select multiple items', () => {
      service.selectMany(['item1', 'item2', 'item3']);

      expect(service.selectedCount()).toBe(3);
      expect(service.isSelected('item1')).toBe(true);
      expect(service.isSelected('item2')).toBe(true);
      expect(service.isSelected('item3')).toBe(true);
    });

    it('should replace existing selection', () => {
      service.select('item1');
      service.selectMany(['item2', 'item3']);

      expect(service.selectedCount()).toBe(2);
      expect(service.isSelected('item1')).toBe(false);
    });
  });

  describe('selectAll() method', () => {
    it('should select all provided items', () => {
      const items = ['item1', 'item2', 'item3'];
      service.selectAll(items);

      expect(service.selectedCount()).toBe(3);
      expect(service.areAllSelected(items)).toBe(true);
    });

    it('should replace existing selection', () => {
      service.select('old-item');
      service.selectAll(['new1', 'new2']);

      expect(service.selectedCount()).toBe(2);
      expect(service.isSelected('old-item')).toBe(false);
    });
  });

  describe('deselect() method', () => {
    it('should deselect specific item', () => {
      service.selectMany(['item1', 'item2', 'item3']);
      service.deselect('item2');

      expect(service.selectedCount()).toBe(2);
      expect(service.isSelected('item2')).toBe(false);
    });

    it('should do nothing if item not selected', () => {
      service.select('item1');
      service.deselect('item2');

      expect(service.selectedCount()).toBe(1);
    });
  });

  describe('deselectMany() method', () => {
    it('should deselect multiple items', () => {
      service.selectMany(['item1', 'item2', 'item3', 'item4']);
      service.deselectMany(['item2', 'item3']);

      expect(service.selectedCount()).toBe(2);
      expect(service.isSelected('item1')).toBe(true);
      expect(service.isSelected('item4')).toBe(true);
    });
  });

  describe('deselectAll() and clear() methods', () => {
    it('should deselect all items', () => {
      service.selectMany(['item1', 'item2', 'item3']);
      service.deselectAll();

      expect(service.selectedCount()).toBe(0);
      expect(service.isEmpty()).toBe(true);
    });

    it('should clear selection', () => {
      service.selectMany(['item1', 'item2']);
      service.clear();

      expect(service.selectedCount()).toBe(0);
    });
  });

  describe('isSelected() method', () => {
    it('should return true for selected items', () => {
      service.select('item1');

      expect(service.isSelected('item1')).toBe(true);
    });

    it('should return false for non-selected items', () => {
      expect(service.isSelected('item1')).toBe(false);
    });
  });

  describe('hasSelection() method', () => {
    it('should return true when items are selected', () => {
      service.select('item1');

      expect(service.hasSelection()).toBe(true);
    });

    it('should return false when no items selected', () => {
      expect(service.hasSelection()).toBe(false);
    });
  });

  describe('areAllSelected() method', () => {
    it('should return true when all items are selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.selectAll(items);

      expect(service.areAllSelected(items)).toBe(true);
    });

    it('should return false when not all items are selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.selectMany(['item1', 'item2']);

      expect(service.areAllSelected(items)).toBe(false);
    });

    it('should return false for empty list', () => {
      expect(service.areAllSelected([])).toBe(false);
    });
  });

  describe('areSomeSelected() method', () => {
    it('should return true when some items are selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.selectMany(['item1', 'item2']);

      expect(service.areSomeSelected(items)).toBe(true);
    });

    it('should return false when no items are selected', () => {
      expect(service.areSomeSelected(['item1', 'item2'])).toBe(false);
    });
  });

  describe('isSingleSelected() method', () => {
    it('should return true when only one item is selected', () => {
      service.select('item1');

      expect(service.isSingleSelected()).toBe(true);
    });

    it('should return false when multiple items selected', () => {
      service.selectMany(['item1', 'item2']);

      expect(service.isSingleSelected()).toBe(false);
    });

    it('should return false when no items selected', () => {
      expect(service.isSingleSelected()).toBe(false);
    });
  });

  describe('isMultipleSelected() method', () => {
    it('should return true when multiple items selected', () => {
      service.selectMany(['item1', 'item2']);

      expect(service.isMultipleSelected()).toBe(true);
    });

    it('should return false when single item selected', () => {
      service.select('item1');

      expect(service.isMultipleSelected()).toBe(false);
    });
  });

  describe('getFirstSelected() method', () => {
    it('should return first selected item', () => {
      service.selectMany(['item2', 'item1', 'item3']);

      const first = service.getFirstSelected();
      expect(first).toBeDefined();
    });

    it('should return undefined when no selection', () => {
      expect(service.getFirstSelected()).toBeUndefined();
    });
  });

  describe('getSelected() method', () => {
    it('should return all selected items as array', () => {
      service.selectMany(['item1', 'item2', 'item3']);

      const selected = service.getSelected();
      expect(selected).toHaveLength(3);
      expect(selected).toContain('item1');
      expect(selected).toContain('item2');
      expect(selected).toContain('item3');
    });

    it('should return empty array when no selection', () => {
      expect(service.getSelected()).toEqual([]);
    });
  });

  describe('getCount() method', () => {
    it('should return correct count', () => {
      service.selectMany(['item1', 'item2', 'item3']);

      expect(service.getCount()).toBe(3);
    });
  });

  describe('setSelection() method', () => {
    it('should replace current selection', () => {
      service.selectMany(['old1', 'old2']);
      service.setSelection(['new1', 'new2', 'new3']);

      expect(service.selectedCount()).toBe(3);
      expect(service.isSelected('new1')).toBe(true);
      expect(service.isSelected('old1')).toBe(false);
    });
  });

  describe('filterSelected() method', () => {
    it('should filter selected items', () => {
      service.selectMany(['item1', 'item2', 'item3']);

      const filtered = service.filterSelected((item) => item.includes('1'));

      expect(filtered).toEqual(['item1']);
    });

    it('should return empty array when no match', () => {
      service.selectMany(['item1', 'item2']);

      const filtered = service.filterSelected((item) => item.includes('99'));

      expect(filtered).toEqual([]);
    });
  });

  describe('mapSelected() method', () => {
    it('should map selected items', () => {
      service.selectMany(['item1', 'item2']);

      const mapped = service.mapSelected((item) => item.toUpperCase());

      expect(mapped).toEqual(['ITEM1', 'ITEM2']);
    });

    it('should return empty array when no selection', () => {
      const mapped = service.mapSelected((item) => item.toUpperCase());

      expect(mapped).toEqual([]);
    });
  });

  describe('everySelected() method', () => {
    it('should return true when all items match predicate', () => {
      service.selectMany(['item1', 'item2', 'item3']);

      expect(service.everySelected((item) => item.startsWith('item'))).toBe(true);
    });

    it('should return false when some items do not match', () => {
      service.selectMany(['item1', 'other', 'item3']);

      expect(service.everySelected((item) => item.startsWith('item'))).toBe(false);
    });
  });

  describe('someSelected() method', () => {
    it('should return true when some items match predicate', () => {
      service.selectMany(['item1', 'other', 'item3']);

      expect(service.someSelected((item) => item === 'other')).toBe(true);
    });

    it('should return false when no items match', () => {
      service.selectMany(['item1', 'item2']);

      expect(service.someSelected((item) => item === 'other')).toBe(false);
    });
  });

  describe('toggleAll() method', () => {
    it('should select all when none selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.toggleAll(items);

      expect(service.areAllSelected(items)).toBe(true);
    });

    it('should select all when some selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.select('item1');
      service.toggleAll(items);

      expect(service.areAllSelected(items)).toBe(true);
    });

    it('should deselect all when all selected', () => {
      const items = ['item1', 'item2', 'item3'];
      service.selectAll(items);
      service.toggleAll(items);

      expect(service.selectedCount()).toBe(0);
    });
  });

  describe('reset() method', () => {
    it('should reset to empty state', () => {
      service.selectMany(['item1', 'item2', 'item3']);
      service.reset();

      expect(service.selectedCount()).toBe(0);
      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('clone() method', () => {
    it('should create independent copy with same selection', () => {
      service.selectMany(['item1', 'item2']);

      const clone = service.clone();

      expect(clone.selectedCount()).toBe(2);
      expect(clone.isSelected('item1')).toBe(true);

      clone.deselect('item1');

      expect(service.isSelected('item1')).toBe(true);
      expect(clone.isSelected('item1')).toBe(false);
    });
  });

  describe('signals', () => {
    it('should update selectedCount signal', () => {
      expect(service.selectedCount()).toBe(0);

      service.select('item1');
      expect(service.selectedCount()).toBe(1);

      service.select('item2');
      expect(service.selectedCount()).toBe(2);
    });

    it('should update isEmpty signal', () => {
      expect(service.isEmpty()).toBe(true);

      service.select('item1');
      expect(service.isEmpty()).toBe(false);
    });

    it('should update isNotEmpty signal', () => {
      expect(service.isNotEmpty()).toBe(false);

      service.select('item1');
      expect(service.isNotEmpty()).toBe(true);
    });
  });

  describe('with object items (TestItem)', () => {
    let objectService: SelectionService<TestItem>;
    const testItems: TestItem[] = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
    ];

    beforeEach(() => {
      objectService = new SelectionService<TestItem>();
    });

    it('should select objects by reference', () => {
      objectService.select(testItems[0]);

      expect(objectService.isSelected(testItems[0])).toBe(true);
      expect(objectService.selectedCount()).toBe(1);
    });

    it('should get selected IDs', () => {
      objectService.selectMany(testItems);

      const ids = objectService.getSelectedIds();
      expect(ids).toEqual(['1', '2', '3']);
    });

    it('should select by IDs', () => {
      objectService.selectByIds(testItems, ['1', '3']);

      expect(objectService.selectedCount()).toBe(2);
      expect(objectService.isSelected(testItems[0])).toBe(true);
      expect(objectService.isSelected(testItems[2])).toBe(true);
      expect(objectService.isSelected(testItems[1])).toBe(false);
    });
  });
});
