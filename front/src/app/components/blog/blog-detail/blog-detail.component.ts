import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { AuthService } from '../../../services/auth.service';
import { Blog, Commentaire } from '../../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class BlogDetailComponent implements OnInit {
  articleId: string = '';
  article: Blog | null = null;
  loading: boolean = true;
  error: string | null = null;
  commentContent: string = '';
  isAuthenticated: boolean = false;
  isSubmittingComment: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.articleId = id;
        this.fetchArticleDetails();
      } else {
        this.router.navigate(['/blog']);
      }
    });
  }

  fetchArticleDetails(): void {
    this.loading = true;
    this.blogService.getArticle(this.articleId).subscribe({
      next: (response) => {
        this.article = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Une erreur s'est produite lors du chargement de l'article";
        this.loading = false;
        console.error(err);
      }
    });
  }

  submitComment(): void {
    if (!this.commentContent.trim() || !this.isAuthenticated || this.isSubmittingComment) {
      return;
    }

    this.isSubmittingComment = true;
    this.blogService.addComment(this.articleId, this.commentContent).subscribe({
      next: (response) => {
        this.commentContent = '';
        this.fetchArticleDetails();
        this.isSubmittingComment = false;
      },
      error: (err) => {
        alert("Erreur lors de l'ajout du commentaire. Veuillez réessayer.");
        this.isSubmittingComment = false;
        console.error(err);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
