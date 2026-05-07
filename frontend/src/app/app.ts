import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App implements OnInit, AfterViewChecked {
  showIntro = signal(true);
  introAnimClass = signal('');

  messages = signal<Message[]>([
    { role: 'assistant', content: 'Merhaba! Türkiye hakkında sana nasıl yardımcı olabilirim? Hangi şehri keşfetmek istersin?' }
  ]);
  
  userInput = signal('');
  isLoading = signal(false);
  
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  images = [
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1506015505432-84fc97e412be?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1541432901042-2d8bd64b4e9c?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1576404740263-956fc2235cd6?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1581430872221-d1fbefb26616?auto=format&fit=crop&q=80&w=1000'
  ];

  imagesReverse = [...this.images].reverse();

  private http = inject(HttpClient);

  ngOnInit() {
    // Hide intro after animation
    setTimeout(() => {
      this.introAnimClass.set('fade-out');
      setTimeout(() => {
        this.showIntro.set(false);
      }, 1000);
    }, 3500); // Intro duration 3.5s
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  onInputChange(event: any) {
    this.userInput.set(event);
  }

  sendMessage() {
    const input = this.userInput();
    if (!input.trim() || this.isLoading()) return;

    const userMessage = input.trim();
    this.messages.update(msgs => [...msgs, { role: 'user', content: userMessage }]);
    this.userInput.set('');
    this.isLoading.set(true);

    this.http.post<any>('http://localhost:8000/api/chat', {
      messages: this.messages()
    }).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { role: res.role, content: res.content }]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }]);
        this.isLoading.set(false);
      }
    });
  }
}
