import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-setting-dialog',
  templateUrl: './delete-setting-dialog.component.html',
  styleUrls: ['./delete-setting-dialog.component.scss']
})
export class DeleteSettingDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteSettingDialogComponent>) { }

  ngOnInit(): void {
  }

  removeFromCard() {
    this.dialogRef.close({ button: 'removeFromCard' });
  }

  deletePermanently() {
    this.dialogRef.close({ button: 'deletePermanently' });
  }

  cancel() {
    this.dialogRef.close({ button: 'cancel' });
  }
}
