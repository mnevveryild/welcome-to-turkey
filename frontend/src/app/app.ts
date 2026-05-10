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
    { photo: 'images/HD-wallpaper-istanbul-galatakulesi-manzara-turkey.jpg', alt: 'Galata Kulesi · İstanbul' },
    { photo: 'images/fd89223056e350ae524f6c6120198677-Bluemosqueistanbul.avif', alt: 'Sultan Ahmet Camii · İstanbul' },
    { photo: 'images/istanbul_da-manzara-izlemek-icin-en-iyi-10-yer.webp', alt: 'İstanbul Manzarası' },
    { photo: 'images/peri bacaları.jpg', alt: 'Peri Bacaları · Kapadokya' },
    { photo: 'images/pamukkale-traverterleri.webp', alt: 'Travertenler · Pamukkale' },
    { photo: 'images/halfeti-1024x683.webp', alt: 'Halfeti · Şanlıurfa' },
    { photo: 'images/nemrut-dagi-1024x576.jpg', alt: 'Nemrut Dağı · Adıyaman' },
    { photo: 'images/20260107151607028_0052 SANLIURFA Gobeklitepe Murat OCAL JPG kopya.jpg', alt: 'Göbeklitepe · Şanlıurfa' },
    { photo: 'images/Likya-Yolu.jpg', alt: 'Likya Yolu · Muğla' },
    { photo: 'images/ceceva_koyu_1638279590_4548.webp', alt: 'Cece Koyu · Fethiye' },
    { photo: 'images/bodrum-3.jpg', alt: 'Bodrum · Muğla' },
    { photo: 'images/Cesme_600x600.webp', alt: 'Çeşme · İzmir' },
    { photo: 'images/Bergama-Antik-Kenti.jpg', alt: 'Bergama Antik Kenti · İzmir' },
    { photo: 'images/anitkabir-gezisi-ankara-gezi-rehberi.jpeg', alt: 'Anıtkabir · Ankara' },
    { photo: 'images/sehitler-aniti-56808.webp', alt: 'Şehitler Anıtı · Gelibolu' },
    { photo: 'images/truva-ati.jpg', alt: 'Truva Atı · Çanakkale' },
    { photo: 'images/mersin-tarihi-yerler.jpg', alt: 'Tarihi Yerler · Mersin' },
    { photo: 'images/sumela-manastiri_original.webp', alt: 'Sümela Manastırı · Trabzon' },
    { photo: 'images/pokut-yaylasi-gezilesiyer.jpg', alt: 'Pokut Yaylası · Rize' },
    { photo: 'images/uzungol2asa-700x386.jpg.webp', alt: 'Uzungöl · Trabzon' },
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
