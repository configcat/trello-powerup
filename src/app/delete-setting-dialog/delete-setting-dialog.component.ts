import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

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

  cancel() {
    this.dialogRef.close({ button: 'cancel' });
  }
}
