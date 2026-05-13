import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  
  standalone: true
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  private chatService = inject(ChatService);

  messages = signal<Message[]>([
    { role: 'assistant', content: 'Merhaba! Türkiye hakkında sana nasıl yardımcı olabilirim? Hangi şehri keşfetmek istersin?' }
  ]);
  userInput = signal('');
  isLoading = signal(false);

  ngAfterViewChecked() {
    try {
      this.chatScrollContainer.nativeElement.scrollTop =
        this.chatScrollContainer.nativeElement.scrollHeight;
    } catch {}
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);
    this.userInput.set('');
    this.isLoading.set(true);

    this.chatService.send(this.messages()).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { role: res.role, content: res.content }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
        }]);
        this.isLoading.set(false);
      }
    });
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
}
