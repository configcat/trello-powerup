import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddFeatureFlagComponent } from './add-feature-flag.component';

describe('AddFeatureFlagComponent', () => {
  let component: AddFeatureFlagComponent;
  let fixture: ComponentFixture<AddFeatureFlagComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFeatureFlagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFeatureFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
