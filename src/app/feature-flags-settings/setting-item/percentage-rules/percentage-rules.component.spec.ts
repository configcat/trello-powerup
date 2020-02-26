import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageRulesComponent } from './percentage-rules.component';

describe('PercentageRulesComponent', () => {
  let component: PercentageRulesComponent;
  let fixture: ComponentFixture<PercentageRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentageRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
