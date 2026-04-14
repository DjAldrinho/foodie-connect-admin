import { TestBed } from '@angular/core/testing';
import { LoadingStateService } from './loading-state.service';

/**
 * LoadingStateService Unit Tests
 *
 * Tests for loading state management with signals
 */
describe('LoadingStateService', () => {
  let service: LoadingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingStateService],
    });

    service = TestBed.inject(LoadingStateService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with no active requests', () => {
      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
      expect(service.hasActiveRequests()).toBe(false);
    });

    it('should not show loading initially', () => {
      expect(service.shouldShowLoading()).toBe(false);
    });
  });

  describe('incrementLoading() method', () => {
    it('should increment active request count', () => {
      service.incrementLoading();

      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);
      expect(service.hasActiveRequests()).toBe(true);
    });

    it('should increment multiple times', () => {
      service.incrementLoading();
      service.incrementLoading();
      service.incrementLoading();

      expect(service.getActiveRequestCount()).toBe(3);
    });

    it('should update isLoading signal correctly', () => {
      expect(service.isLoading()).toBe(false);

      service.incrementLoading();

      expect(service.isLoading()).toBe(true);
    });
  });

  describe('decrementLoading() method', () => {
    it('should decrement active request count', () => {
      service.incrementLoading();
      service.incrementLoading();

      service.decrementLoading();

      expect(service.getActiveRequestCount()).toBe(1);
    });

    it('should not go below zero', () => {
      service.incrementLoading();
      service.decrementLoading();
      service.decrementLoading(); // Extra decrement

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should update isLoading signal when reaching zero', () => {
      service.incrementLoading();
      expect(service.isLoading()).toBe(true);

      service.decrementLoading();

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('setLoading() method', () => {
    it('should increment when setting true', () => {
      service.setLoading(true);

      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);
    });

    it('should decrement when setting false', () => {
      service.incrementLoading();

      service.setLoading(false);

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle multiple toggle operations', () => {
      service.setLoading(true);
      service.setLoading(true);
      expect(service.getActiveRequestCount()).toBe(2);

      service.setLoading(false);
      expect(service.getActiveRequestCount()).toBe(1);

      service.setLoading(false);
      expect(service.getActiveRequestCount()).toBe(0);
    });
  });

  describe('multiple concurrent requests', () => {
    it('should track multiple active requests', () => {
      service.incrementLoading();
      service.incrementLoading();
      service.incrementLoading();

      expect(service.getActiveRequestCount()).toBe(3);
      expect(service.isLoading()).toBe(true);
    });

    it('should remain loading until all requests complete', () => {
      service.incrementLoading();
      service.incrementLoading();
      service.incrementLoading();

      service.decrementLoading();
      expect(service.isLoading()).toBe(true);

      service.decrementLoading();
      expect(service.isLoading()).toBe(true);

      service.decrementLoading();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('reset() method', () => {
    it('should reset active request count to zero', () => {
      service.incrementLoading();
      service.incrementLoading();
      service.incrementLoading();

      expect(service.getActiveRequestCount()).toBe(3);

      service.reset();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should reset signals', () => {
      service.incrementLoading();
      expect(service.isLoading()).toBe(true);

      service.reset();

      expect(service.isLoading()).toBe(false);
      expect(service.hasActiveRequests()).toBe(false);
    });
  });

  describe('shouldShowLoading() method', () => {
    it('should return true when loading', () => {
      service.incrementLoading();

      expect(service.shouldShowLoading()).toBe(true);
    });

    it('should return false when not loading', () => {
      expect(service.shouldShowLoading()).toBe(false);
    });

    it('should return false after all requests complete', () => {
      service.incrementLoading();
      service.decrementLoading();

      expect(service.shouldShowLoading()).toBe(false);
    });
  });

  describe('configuration getters', () => {
    it('should return loading delay', () => {
      expect(service.getLoadingDelay()).toBe(300);
    });

    it('should return minimum display time', () => {
      expect(service.getMinDisplayTime()).toBe(500);
    });
  });

  describe('signals reactivity', () => {
    it('should update isLoading signal reactively', () => {
      const values: boolean[] = [];

      // Simulate signal subscription
      values.push(service.isLoading());
      service.incrementLoading();
      values.push(service.isLoading());
      service.decrementLoading();
      values.push(service.isLoading());

      expect(values).toEqual([false, true, false]);
    });

    it('should update hasActiveRequests signal reactively', () => {
      const values: boolean[] = [];

      values.push(service.hasActiveRequests());
      service.incrementLoading();
      values.push(service.hasActiveRequests());
      service.reset();
      values.push(service.hasActiveRequests());

      expect(values).toEqual([false, true, false]);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid increment/decrement operations', () => {
      for (let i = 0; i < 100; i++) {
        service.incrementLoading();
      }

      expect(service.getActiveRequestCount()).toBe(100);

      for (let i = 0; i < 100; i++) {
        service.decrementLoading();
      }

      expect(service.getActiveRequestCount()).toBe(0);
    });

    it('should handle decrement before increment', () => {
      service.decrementLoading();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle multiple reset operations', () => {
      service.incrementLoading();
      service.reset();
      service.reset();

      expect(service.getActiveRequestCount()).toBe(0);
    });
  });
});
