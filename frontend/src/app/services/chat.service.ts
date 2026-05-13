import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  send(messages: Message[]): Observable<Message> {
    return this.http.post<Message>('http://localhost:8000/api/chat', { messages });
  }
}
