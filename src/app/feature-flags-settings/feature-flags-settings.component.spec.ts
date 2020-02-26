import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFlagsSettingsComponent } from './feature-flags-settings.component';

describe('FeatureFlagsSettingsComponent', () => {
  let component: FeatureFlagsSettingsComponent;
  let fixture: ComponentFixture<FeatureFlagsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureFlagsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureFlagsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
