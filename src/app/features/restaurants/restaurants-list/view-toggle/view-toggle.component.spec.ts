import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ViewToggleComponent, ViewMode } from './view-toggle.component';

describe('ViewToggleComponent', () => {
  let component: ComponentFixture<ViewToggleComponent>;
  let fixture: ComponentFixture<ViewToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewToggleComponent],
      schemas: [NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with grid view mode', () => {
    expect(component.viewMode()).toBe('grid');
  });

  it('should emit viewModeChange when switching to list', (done) => {
    component.viewModeChange.subscribe((mode) => {
      expect(mode).toBe('list');
      done();
    });

    component.onListView();
  });

  it('should emit viewModeChange when switching to grid', (done) => {
    component.viewModeChange.subscribe((mode) => {
      expect(mode).toBe('grid');
      done();
    });

    component.onGridView();
  });

  it('should not emit if already in list mode', () => {
    const emitSpy = jest.spyOn(component.viewModeChange, 'emit');

    component.viewMode.set('list');
    fixture.detectChanges();

    component.onListView();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit if already in grid mode', () => {
    const emitSpy = jest.spyOn(component.viewModeChange, 'emit');

    component.viewMode.set('grid');
    fixture.detectChanges();

    component.onGridView();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
