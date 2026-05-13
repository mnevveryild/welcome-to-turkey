import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  photo: string;
  alt: string;
}

@Component({
  selector: 'app-photo-slider',
  imports: [CommonModule],
  templateUrl: './photo-slider.html',
  styleUrl: './photo-slider.css',
  standalone: true
})
export class PhotoSliderComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  slideVisible = signal(true);

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

  ngOnInit() {
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
}
