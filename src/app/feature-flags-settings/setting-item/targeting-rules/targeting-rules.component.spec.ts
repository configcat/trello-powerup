import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetingRulesComponent } from './targeting-rules.component';

describe('TargetingRulesComponent', () => {
  let component: TargetingRulesComponent;
  let fixture: ComponentFixture<TargetingRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetingRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetingRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
