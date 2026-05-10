import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Slide {
  photo: string;
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
    { photo: 'images/istanbulda-gezilecek-yerler.webp', alt: 'İstanbul' },
    { photo: 'images/Peri-Bacalari.jpg', alt: 'Kapadokya' },
    { photo: 'images/pamukkale-traverterleri.webp', alt: 'Pamukkale' },
    { photo: 'images/halfeti.jpg', alt: 'Halfeti' },
    { photo: 'images/nemrut-dagi-1024x576.jpg', alt: 'Nemrut Dağı' },
    { photo: 'images/20260107151607028_0052 SANLIURFA Gobeklitepe Murat OCAL JPG kopya.jpg', alt: 'Göbeklitepe' },
    { photo: 'images/Likya-Yolu.jpg', alt: 'Likya Yolu' },
    { photo: 'images/bodrum-3.jpg', alt: 'Bodrum' },
    { photo: 'images/Cesme_600x600.webp', alt: 'Çeşme' },
    { photo: 'images/ankara-anitkabir-2496.webp', alt: 'Anıtkabir' },
    { photo: 'images/gelibolu-34009.webp', alt: 'Gelibolu' },
    { photo: 'images/ancient-city-of-the-trojan.jpg', alt: 'Troya' },
    { photo: 'images/antik.jpg', alt: 'Antik Kent' },
    { photo: 'images/mersin-tarihi-yerler.jpg', alt: 'Mersin' },
    { photo: 'images/sumela-manastiri_original.webp', alt: 'Sümela Manastırı' },
    { photo: 'images/3.1-768x512-1.webp', alt: 'Türkiye' },
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
