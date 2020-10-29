import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmNewJobDialogComponent } from './confirm-new-job-dialog.component';

describe('ConfirmNewJobDialogComponent', () => {
  let component: ConfirmNewJobDialogComponent;
  let fixture: ComponentFixture<ConfirmNewJobDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmNewJobDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmNewJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
