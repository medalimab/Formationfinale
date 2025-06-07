import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-user-edit.component.html',
  styleUrls: ['./admin-user-edit.component.css']
})
export class AdminUserEditComponent implements OnInit {
  userForm!: FormGroup;
  loading = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getUser(id).subscribe({
        next: (res) => {
          const user = res.data || res;
          this.userForm.patchValue({
            nom: user.nom || user.name || '',
            email: user.email || '',
            role: user.role || ''
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors du chargement de l\'utilisateur';
          this.loading = false;
        }
      });
    }
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.userService.updateUser(id, this.userForm.value).subscribe({
      next: () => {
        this.success = 'Utilisateur mis à jour avec succès';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/admin/users']), 1200);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    });
  }
}

export default AdminUserEditComponent;
