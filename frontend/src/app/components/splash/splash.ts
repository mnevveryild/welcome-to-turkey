import { Component, OnInit, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrl: './splash.css',
  standalone: true,
  imports: [NgClass]
})
export class SplashComponent implements OnInit {
  done = output<void>();
  animClass = '';

  ngOnInit() {
    setTimeout(() => {
      this.animClass = 'fade-out';
      setTimeout(() => this.done.emit(), 1000);
    }, 5000);
  }
}
