import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RestaurantFiltersComponent } from './restaurant-filters.component';
import { RestaurantFilters, RestaurantStatus, CuisineType, PriceRange } from '../../../../models/restaurants.types';

describe('RestaurantFiltersComponent', () => {
  let component: ComponentFixture<RestaurantFiltersComponent>;
  let fixture: ComponentFixture<RestaurantFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantFiltersComponent],
      schemas: [NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty filters', () => {
    expect(component.filters()).toEqual({});
  });

  it('should emit filtersChange on search input', (done) => {
    const newFilters: RestaurantFilters = { search: 'test' };

    component.filtersChange.subscribe((filters) => {
      expect(filters).toEqual(newFilters);
      done();
    });

    component.onSearchChange('test');
  });

  it('should emit filtersChange on status change', (done) => {
    const newFilters: RestaurantFilters = { status: RestaurantStatus.ACTIVE };

    component.filtersChange.subscribe((filters) => {
      expect(filters).toEqual(newFilters);
      done();
    });

    component.onStatusChange(RestaurantStatus.ACTIVE);
  });

  it('should toggle cuisine in filters', (done) => {
    component.filtersChange.subscribe((filters) => {
      expect(filters.cuisine).toContain(CuisineType.PARRILLA);
      done();
    });

    component.onCuisineToggle(CuisineType.PARRILLA);
  });

  it('should toggle price range in filters', (done) => {
    component.filtersChange.subscribe((filters) => {
      expect(filters.priceRange).toContain(PriceRange.$);
      done();
    });

    component.onPriceRangeToggle(PriceRange.$);
  });

  it('should emit filtersChange on rating change', (done) => {
    const newFilters: RestaurantFilters = { rating: 4 };

    component.filtersChange.subscribe((filters) => {
      expect(filters).toEqual(newFilters);
      done();
    });

    component.onRatingChange(4);
  });

  it('should emit reset event and clear filters', (done) => {
    let resetCalled = false;

    component.reset.subscribe(() => {
      resetCalled = true;
      done();
    });

    component.onReset();

    expect(resetCalled).toBeTrue();
    expect(component.filters()).toEqual({});
  });
});
