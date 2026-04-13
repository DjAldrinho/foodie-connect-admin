import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BaseService } from './base.service';

/**
 * BaseService Unit Tests
 *
 * Tests for the base HTTP service that provides common functionality
 * for all feature services.
 */
describe('BaseService', () => {
  let service: BaseService;
  let httpMock: HttpTestingController;
  let httpClient: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BaseService],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    service = new BaseService(httpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should make GET request', () => {
      const mockData = { id: '1', name: 'Test' };

      service.get<{ id: string; name: string }>('api/test').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('api/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should make POST request', () => {
      const mockBody = { name: 'New' };
      const mockResponse = { id: '1', ...mockBody };

      service.post('api/test', mockBody).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('api/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });

    it('should make PUT request', () => {
      const mockBody = { name: 'Updated' };
      const mockResponse = { id: '1', ...mockBody };

      service.put('api/test/1', mockBody).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('api/test/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });

    it('should make DELETE request', () => {
      service.delete('api/test/1').subscribe();

      const req = httpMock.expectOne('api/test/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should make PATCH request', () => {
      const mockBody = { name: 'Patched' };
      const mockResponse = { id: '1', ...mockBody };

      service.patch('api/test/1', mockBody).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('api/test/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error gracefully', () => {
      const mockError = new ErrorEvent('error');

      service.get('api/test').subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('api/test');
      req.error(mockError);
    });

    it('should handle 404 error', () => {
      service.get('api/notfound').subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('api/notfound');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 error', () => {
      service.get('api/server-error').subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('api/server-error');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('URL Building', () => {
    it('should build correct URL with path params', () => {
      service.get('api/test/{id}', { id: '123' }).subscribe();

      const req = httpMock.expectOne('api/test/123');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should build correct URL with query params', () => {
      service.get('api/test', undefined, { page: 1, limit: 10 } as any).subscribe();

      const req = httpMock.expectOne('api/test?page=1&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
