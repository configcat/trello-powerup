import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueGangComponent } from './value-gang.component';

describe('ValueGangComponent', () => {
  let component: ValueGangComponent;
  let fixture: ComponentFixture<ValueGangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueGangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueGangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
