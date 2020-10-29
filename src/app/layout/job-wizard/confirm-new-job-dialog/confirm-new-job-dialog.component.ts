import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-new-job-dialog',
  templateUrl: './confirm-new-job-dialog.component.html',
  styleUrls: ['./confirm-new-job-dialog.component.css']
})
export class ConfirmNewJobDialogComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
