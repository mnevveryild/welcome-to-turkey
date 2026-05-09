import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type StampType = 'mosque' | 'balloon' | 'beach' | 'village';

interface Slide {
  photo: string;
  stamp: StampType;
  alt: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App implements OnInit, OnDestroy, AfterViewChecked {
  showIntro = signal(true);
  introAnimClass = signal('');
  currentSlide = signal(0);
  slideVisible = signal(true);

  messages = signal<Message[]>([
    { role: 'assistant', content: 'Merhaba! Türkiye hakkında sana nasıl yardımcı olabilirim? Hangi şehri keşfetmek istersin?' }
  ]);

  userInput = signal('');
  isLoading = signal(false);

  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  slides: Slide[] = [
    {
      photo: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1400',
      stamp: 'mosque',
      alt: 'İstanbul'
    },
    {
      photo: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&q=80&w=1400',
      stamp: 'balloon',
      alt: 'Kapadokya'
    },
    {
      photo: 'https://images.unsplash.com/photo-1581430872221-d1fbefb26616?auto=format&fit=crop&q=80&w=1400',
      stamp: 'beach',
      alt: 'Antalya'
    },
    {
      photo: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&q=80&w=1400',
      stamp: 'village',
      alt: 'Karadeniz'
    },
  ];

  private slideInterval?: ReturnType<typeof setInterval>;
  private http = inject(HttpClient);

  ngOnInit() {
    setTimeout(() => {
      this.introAnimClass.set('fade-out');
      setTimeout(() => {
        this.showIntro.set(false);
        this.startSlideshow();
      }, 1000);
    }, 5000);
  }

  startSlideshow() {
    this.slideInterval = setInterval(() => {
      this.slideVisible.set(false);
      setTimeout(() => {
        this.currentSlide.update(i => (i + 1) % this.slides.length);
        this.slideVisible.set(true);
      }, 700);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.slideInterval) clearInterval(this.slideInterval);
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

  formatMessage(text: string): string {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (const raw of lines) {
      const line = raw.trim();

      if (/^[-*]\s+/.test(line)) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${this.inlineFmt(line.replace(/^[-*]\s+/, ''))}</li>`;
        continue;
      }

      if (inList) { html += '</ul>'; inList = false; }

      if (line === '') continue;

      if (/^#{1,3}\s+/.test(line)) {
        html += `<h4>${this.inlineFmt(line.replace(/^#{1,3}\s+/, ''))}</h4>`;
        continue;
      }

      html += `<p>${this.inlineFmt(line)}</p>`;
    }

    if (inList) html += '</ul>';
    return html;
  }

  private inlineFmt(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
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
