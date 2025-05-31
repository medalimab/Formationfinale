import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog, Commentaire } from '../models/blog.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {  private apiUrl = `${environment.apiUrl}/blog`;

  constructor(private http: HttpClient) { }

  getArticles(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getArticle(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createArticle(articleData: Blog): Observable<any> {
    return this.http.post<any>(this.apiUrl, articleData);
  }

  updateArticle(id: string, articleData: Partial<Blog>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, articleData);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addComment(articleId: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${articleId}/commentaires`, { texte: comment });
  }
}
