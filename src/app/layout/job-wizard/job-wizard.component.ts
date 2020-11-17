import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { routerTransition } from '../../router.animations';

import { Observable, combineLatest, EMPTY, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Job, Solution } from '../../shared/modules/vgl/models';
import { SolutionVarBindings } from '../../shared/modules/solutions/models';
import { JobObjectComponent } from './job-object.component';
import { JobDatasetsComponent } from './job-datasets.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmNewJobDialogComponent } from './confirm-new-job-dialog/confirm-new-job-dialog.component';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss'],
  animations: [routerTransition()]
})
export class JobWizardComponent implements AfterViewInit, OnInit, OnDestroy {

  jobIncomplete: boolean = false;
  cancelled: boolean = false;
  noSave: boolean = false;

  solutions: Solution[];
  private _solutionsSub;

  private routeSub;

  @ViewChild(JobObjectComponent, {static: true})
  private jobObject!: JobObjectComponent;

  @ViewChild(JobDatasetsComponent, {static: true})
  private jobDatasetsComponent!: JobDatasetsComponent;


  @ViewChild(JobSolutionsSummaryComponent, {static: true})
  private jobSolutionsSummaryComponent!: JobSolutionsSummaryComponent;



  constructor(private userStateService: UserStateService,
            private vglService: VglService,
            private location: Location,
            private router: Router,
            private route: ActivatedRoute,
            private messageService: MessageService,
            private changeRef: ChangeDetectorRef,
            private modal: NgbModal) {}

  ngOnInit() {
    // Check the URL and parameters to determine whether we're creating a new
    // job or loading an existing one.
    this.routeSub = combineLatest([this.route.url, this.route.paramMap]).pipe(
      switchMap(([parts, params]) => {
        if (parts[0].path === 'new') {
          if (this.userStateService.getJob() !== null) {
            this.modal.open(ConfirmNewJobDialogComponent).result.then(result => {
              if (result === "newJob") {
                // Load a new, empty job object for the user to manage.
                this.userStateService.resetAllBindings();
                this.userStateService.newJob();
                this.jobSolutionsSummaryComponent.patchBindingValues();
              } else {
                // Use the current job as the new job
                if (this.userStateService.getJob().id) {
                  this.location.go("wizard/job/" + this.userStateService.getJob().id);
                }
              }
            });
          }
          // Return current job, newJob should reset everything if the user chooses
          //return of(this.userStateService.getJob());
          return this.userStateService.job;
        } else if (parts[0].path === 'job' && params.has('id')) {
          // Load the specified job from the server
          const id = parseInt(params.get('id'), 10);
          return this.userStateService.loadJob(id).pipe(
            // Notify the user of job load status as a side-effect, then pass on
            // the job object unchanged.
            map(job => {
              this.messageService.add({
                key: 'page-message',
                severity: 'success',
                summary: 'Load success',
                detail: `Job ${job.id} loaded successfully.`
              });
              return job;
            })
          );
        }
      })
    ).subscribe(job => {
        // Only load job downloads after job has loaded
        this.jobDatasetsComponent.loadJobInputs();

        this._solutionsSub = this.userStateService.selectedSolutions.subscribe(
          solutions => {
            this.solutions = solutions;
          }
        );
    });
  }

  ngAfterViewInit() {
    this.changeRef.detectChanges();
  }

  ngOnDestroy() {
    // Clean up subs
    this._solutionsSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  testResetBindings() {
    this.userStateService.resetAllBindings();
    this.jobSolutionsSummaryComponent.patchBindingValues();
  }

  save() {
    this.noSave = true;
    this.messageService.clear();
    this.messageService.add({key: 'page-message', severity: 'info', summary: 'Saving job...', detail: '', sticky: true});

    this.doSave()
      .pipe(catchError((err, obs) => {
        this.messageService.clear();
        this.messageService.add({key: 'page-message', severity: 'error', summary: 'Save failed!', detail: JSON.stringify(err), sticky: true});
        return EMPTY;
      }))
      .subscribe(
        (resp: Job) => {
          if (resp) {
            const id = resp.id;
            this.messageService.clear();
            this.messageService.add({key: 'page-message', severity: 'success', summary: 'Saved', detail: `Job ${id} saved successfully.`});
            this.noSave = false;
            this.router.navigate(['/wizard/job', id]);
          }
        }
      );

  }

  submit() {
    this.noSave = true;
    this.messageService.clear();
    this.messageService.add({key: 'page-message', severity: 'info', summary: 'Submitting job...', detail: '', sticky: true});

    // Save the job first, then submit it an navigate away.
    this.doSave().subscribe(savedJob => {
      this.vglService.submitJob(savedJob).subscribe(
        () => {
              this.messageService.add({
                  key: 'page-message',
                  severity: 'success',
                  summary: 'Submitted',
                  detail: `Job ${savedJob.id} submitted successfully.`,
                  life: 10000
              });
              this.router.navigate(['/jobs']);
          },
        error => {
          console.log('Failed to submit job: ' + error);
        }
      );
    });
  }

  private doSave(): Observable<Job> {
    // Save the job to the backend
    return this.vglService.saveJob(this.getJobObject(),
                                   this.userStateService.getJobDownloads(),
                                   this.userStateService.getJobTemplateWithVars(),
                                   this.userStateService.getSolutionBindings(),
                                   this.userStateService.getUploadedFiles());
  }

  // TODO: Still useful? Have replaced with "Reset"
  cancel() {
    this.location.back();
  }

  confirmReset() {
    this.messageService.add({
      key: 'confirm-reset',
      severity: 'warn',
      sticky: true,
      summary: '',
      detail: ''
    });
  }

  removeConfirmResetDialog() {
    this.messageService.clear('confirm-reset');
  }

  reset() {
    this.messageService.clear('confirm-reset');
    this.userStateService.resetAllBindings();
    this.jobObject.form.reset();

    this.router.navigate(['/wizard/new']);

    this.messageService.add({
      key: 'page-message',
      severity: 'success',
      summary: 'Job Reset',
      detail: `Job details have been reset.`,
      life: 10000
    });
  }

  getJobObject(): Job {
    return this.jobObject.getJobObject();
  }

  isJobComplete(): boolean {
    if (this.solutions && this.solutions.length > 0 && this.validSolutionBindings() && this.jobObject.form.valid) {
      this.jobIncomplete = false;
    } else {
      this.jobIncomplete = true;
    }
    return !this.jobIncomplete;
  }

  hasSolutions(): boolean {
    return this.solutions !== undefined && this.solutions.length > 0;
  }

  validSolutionBindings(): boolean {
    const solutionvarBindings: SolutionVarBindings = this.userStateService.getSolutionBindings();
    for (const solution of this.solutions) {
      if (solutionvarBindings[solution.id]) {
        for (const bindings of solutionvarBindings[solution.id]) {
          if (!bindings.isValid()) {
            return false;
          }
        }
      }
    }
    return true;
  }

}
