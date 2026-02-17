
import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent).catch(err => {
  console.error('Bootstrap Error:', err);
  const root = document.querySelector('app-root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red;">Lỗi khởi tạo: ${err.message}</div>`;
  }
});
