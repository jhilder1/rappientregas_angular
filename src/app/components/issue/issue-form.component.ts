import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IssueService, Issue } from '../../services/issue.service';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit, OnChanges {
  @Input() selected: Issue | null = null;
  @Input() motorcycles: any[] = [];
  @Output() clear = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();

  issueForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private snackBar: MatSnackBar
  ) {
    this.issueForm = this.fb.group({
      motorcycle_id: ['', Validators.required],
      issue_type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date_reported: [new Date(), Validators.required],
      status: ['open', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.selected) {
      this.loadIssue(this.selected);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && this.selected) {
      this.loadIssue(this.selected);
    } else if (!this.selected) {
      this.issueForm.reset({
        motorcycle_id: '',
        issue_type: '',
        description: '',
        date_reported: new Date(),
        status: 'open'
      });
    }
  }

  loadIssue(issue: Issue): void {
    const dateReported = issue.date_reported || issue.date ? new Date(issue.date_reported || issue.date!) : new Date();
    const issueType = issue.issue_type || issue.type || '';

    this.issueForm.patchValue({
      motorcycle_id: issue.motorcycle_id || '',
      issue_type: issueType,
      description: issue.description || '',
      date_reported: dateReported,
      status: issue.status || 'open'
    });
  }

  onSubmit(): void {
    if (this.issueForm.valid) {
      const formValue = this.issueForm.value;
      const data = {
        ...formValue,
        date_reported: formValue.date_reported ? new Date(formValue.date_reported).toISOString() : new Date().toISOString()
      };

      if (this.selected?.id) {
        this.issueService.update(String(this.selected.id), data).subscribe({
          next: () => {
            this.snackBar.open('Inconveniente actualizado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.issueForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al actualizar inconveniente', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.issueService.create(data).subscribe({
          next: () => {
            this.snackBar.open('Inconveniente creado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.issueForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al crear inconveniente', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  onClear(): void {
    this.issueForm.reset({
      motorcycle_id: '',
      issue_type: '',
      description: '',
      date_reported: new Date(),
      status: 'open'
    });
    this.clear.emit();
  }
}
