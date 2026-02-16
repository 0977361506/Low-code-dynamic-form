
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-50 shrink-0 shadow-sm relative">
      <div class="flex items-center gap-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-800 leading-none">LowCode Pro</h1>
            <span class="text-[9px] text-indigo-500 font-extrabold uppercase tracking-tighter">Angular 19 Edition</span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200 h-11 items-center">
          <button 
            (click)="changeView.emit('builder')"
            class="px-5 h-full rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            [class.bg-white]="activeView === 'builder'"
            [class.shadow-sm]="activeView === 'builder'"
            [class.text-indigo-600]="activeView === 'builder'"
            [class.text-slate-500]="activeView !== 'builder'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Thiết kế
          </button>
          <button 
            (click)="changeView.emit('viewer')"
            class="px-5 h-full rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            [class.bg-white]="activeView === 'viewer'"
            [class.shadow-sm]="activeView === 'viewer'"
            [class.text-indigo-600]="activeView === 'viewer'"
            [class.text-slate-500]="activeView !== 'viewer'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Xem sản phẩm
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button (click)="preview.emit()" class="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2">
           <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           Quick Preview
        </button>
        <button (click)="export.emit()" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
           <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
           Save JSON
        </button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Input() activeView: 'builder' | 'viewer' = 'builder';
  @Output() changeView = new EventEmitter<'builder' | 'viewer'>();
  @Output() preview = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
}
