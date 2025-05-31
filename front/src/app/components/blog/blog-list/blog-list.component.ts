import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../../services/blog.service';
import { Blog } from '../../../models/blog.model';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogListComponent implements OnInit {
  articles: Blog[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.fetchArticles();
  }

  fetchArticles(): void {
    this.loading = true;
    this.blogService.getArticles().subscribe({
      next: (response) => {
        this.articles = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Une erreur s'est produite lors du chargement des articles";
        this.loading = false;
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

  truncateContent(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }
}
