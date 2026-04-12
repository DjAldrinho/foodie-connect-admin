import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { RestaurantsService } from './restaurants.service';
import { RestaurantStatus, VerificationStatus, CuisineType, PriceRange } from '../../../../models/restaurants.types';
import { environment } from '../../../environments/environment';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let httpMock: HttpTestingController;
  let originalEnvironment: any;

  beforeEach(() => {
    // Save original environment
    originalEnvironment = { ...environment };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RestaurantsService],
    });

    service = TestBed.inject(RestaurantsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    // Restore environment
    Object.assign(environment, originalEnvironment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('with mock data', () => {
    beforeEach(() => {
      environment.features.useMockRestaurants = true;
    });

    it('should return mock restaurants', (done) => {
      service.getAll({ page: 1, pageSize: 12 }).subscribe((response) => {
        expect(response.items.length).toBeGreaterThan(0);
        expect(response.total).toBe(6);
        done();
      });
    });

    it('should filter by search term', (done) => {
      service.getAll(
        { page: 1, pageSize: 12 },
        { search: 'parrilla' }
      ).subscribe((response) => {
        expect(response.items.length).toBe(1);
        expect(response.items[0].name).toContain('Parrilla');
        done();
      });
    });

    it('should filter by status', (done) => {
      service.getAll(
        { page: 1, pageSize: 12 },
        { status: RestaurantStatus.PENDING }
      ).subscribe((response) => {
        expect(response.items.length).toBe(1);
        expect(response.items[0].status).toBe(RestaurantStatus.PENDING);
        done();
      });
    });

    it('should sort by rating', (done) => {
      service.getAll(
        { page: 1, pageSize: 12, sortBy: 'rating', sortOrder: 'desc' }
      ).subscribe((response) => {
        const ratings = response.items.map(r => r.rating);
        expect(ratings).toEqual(ratings.sort((a, b) => b - a));
        done();
      });
    });

    it('should paginate correctly', (done) => {
      service.getAll({ page: 1, pageSize: 2 }).subscribe((response) => {
        expect(response.items.length).toBe(2);
        expect(response.page).toBe(1);
        expect(response.totalPages).toBe(3);
        done();
      });
    });

    it('should return restaurant by ID', (done) => {
      service.getById('1').subscribe((restaurant) => {
        expect(restaurant).toBeTruthy();
        expect(restaurant.id).toBe('1');
        expect(restaurant.name).toBe('La Parrilla Argentina');
        done();
      });
    });

    it('should return error for non-existent ID', (done) => {
      service.getById('999').subscribe({
        next: () => fail('Expected error but got data'),
        error: (error) => {
          expect(error.message).toBe('Restaurant not found');
          done();
        },
      });
    });
  });

  describe('with real backend', () => {
    beforeEach(() => {
      environment.features.useMockRestaurants = false;
    });

    it('should make HTTP request to get all restaurants', (done) => {
      service.getAll({ page: 1, pageSize: 12 }).subscribe((response) => {
        expect(response.items).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('/api/restaurants?page=1&pageSize=12');
      expect(req.request.method).toBe('GET');
      req.flush({
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 12,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
        success: true,
      });
    });

    it('should make HTTP request to get restaurant by ID', (done) => {
      service.getById('1').subscribe((restaurant) => {
        expect(restaurant).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('/api/restaurants/1');
      expect(req.request.method).toBe('GET');
      req.flush({
        data: {
          id: '1',
          name: 'Test Restaurant',
        } as any,
        success: true,
      });
    });

    it('should handle HTTP errors gracefully', (done) => {
      service.getAll().subscribe({
        next: () => fail('Expected error but got data'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne('/api/restaurants');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should build query params correctly for filters', (done) => {
      service.getAll(
        { page: 2, pageSize: 24 },
        { status: RestaurantStatus.ACTIVE, cuisine: [CuisineType.ITALIANA] }
      ).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('/api/restaurants?page=2&pageSize=24&status=ACTIVE&cuisine=Italiana&cuisine=Italiana');
      expect(req.request.params).toBeDefined();
      req.flush({
        data: {
          items: [],
          total: 0,
          page: 2,
          pageSize: 24,
          totalPages: 0,
          hasNext: false,
          hasPrevious: true,
        },
        success: true,
      });
    });
  });

  describe('verification actions', () => {
    beforeEach(() => {
      environment.features.useMockRestaurants = true;
    });

    it('should approve restaurant', (done) => {
      service.verifyRestaurant('3', { action: 'approve' }).subscribe((restaurant) => {
        expect(restaurant).toBeDefined();
        done();
      });
    });

    it('should reject restaurant', (done) => {
      service.verifyRestaurant('3', { action: 'reject', notes: 'Incomplete' }).subscribe((restaurant) => {
        expect(restaurant).toBeDefined();
        done();
      });
    });
  });

  describe('export functionality', () => {
    beforeEach(() => {
      environment.features.useMockRestaurants = true;
    });

    it('should export to CSV', (done) => {
      service.exportToCsv().subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv');
        done();
      });
    });

    it('should export with filters', (done) => {
      service.exportToCsv({ status: RestaurantStatus.ACTIVE }).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });
  });
});

function fail(message: string): void {
  throw new Error(message);
}
