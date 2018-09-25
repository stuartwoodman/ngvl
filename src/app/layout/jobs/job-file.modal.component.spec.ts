import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFileModalContent } from './job-file.modal.component';

describe('JobsComponent', () => {
  let component: JobFileModalContent;
  let fixture: ComponentFixture<JobFileModalContent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobFileModalContent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFileModalContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
