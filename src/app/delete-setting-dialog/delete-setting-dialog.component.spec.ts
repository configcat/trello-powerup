import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteSettingDialogComponent } from './delete-setting-dialog.component';

describe('DeleteSettingDialogComponent', () => {
  let component: DeleteSettingDialogComponent;
  let fixture: ComponentFixture<DeleteSettingDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSettingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
