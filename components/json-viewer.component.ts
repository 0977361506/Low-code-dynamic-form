
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
      <div class="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tighter uppercase">Cấu trúc dữ liệu (JSON)</h2>
            <p class="text-xs text-slate-400 font-medium">Sao chép hoặc dán JSON để tải lại giao diện</p>
          </div>
          <button (click)="close.emit()" class="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
             <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex-1 p-8 overflow-hidden flex flex-col">
          <textarea 
            [(ngModel)]="jsonText"
            class="flex-1 bg-slate-900 text-indigo-300 font-mono text-[11px] p-6 rounded-2xl outline-none resize-none custom-scrollbar shadow-inner leading-relaxed border-none"
          ></textarea>
        </div>

        <div class="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button (click)="copy()" class="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
             Copy JSON
          </button>
          <button (click)="load.emit(jsonText)" class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
             Import & Re-render
          </button>
        </div>
      </div>
    </div>
  `
})
export class JSONViewerComponent implements OnInit {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  @Output() load = new EventEmitter<string>();

  jsonText: string = '';

  ngOnInit() {
    this.jsonText = JSON.stringify(this.data, null, 2);
  }

  copy() {
    navigator.clipboard.writeText(this.jsonText);
    alert('Đã sao chép!');
  }
}
