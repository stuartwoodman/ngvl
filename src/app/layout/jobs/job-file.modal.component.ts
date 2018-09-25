import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CloudFileInformation } from '../../shared/modules/vgl/models';


@Component({
    selector: 'job-file-modal-content',
    styleUrls: ['job-file.modal.component.scss'],
    templateUrl: './job-file.modal.component.html'
})


/*
 * Modal to display job status logs
 */
export class JobFileModalContent {

    @Input() cloudFiles: CloudFileInformation[];  // Selected job

    selectedFiles: CloudFileInformation[] = [];


    constructor(public activeModal: NgbActiveModal) { }


}
