
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentType, Page } from '../types.ts';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
      
      <!-- COMPONENT TOOLS HEADER -->
      <div class="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kéo thả thành phần</h3>
      </div>
      
      <!-- TOOLS LIST -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div class="grid grid-cols-1 gap-3">
          <div *ngFor="let item of tools"
            draggable="true"
            (dragstart)="onDragStart($event, item.type)"
            (click)="addComponent.emit(item.type)"
            class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md"
          >
            <div class="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path [attr.d]="item.icon" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{{item.label}}</span>
          </div>
        </div>
      </div>

      <!-- INFO FOOTER -->
      <div class="p-4 border-t border-slate-100 text-center">
        <p class="text-[10px] text-slate-400">Kéo phần tử vào vùng Canvas bên phải</p>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() pages: Page[] = [];
  @Input() activePageId: string = '';
  
  @Output() addComponent = new EventEmitter<ComponentType>();
  @Output() addPage = new EventEmitter<void>();
  @Output() selectPage = new EventEmitter<string>();
  @Output() updatePageName = new EventEmitter<{id: string, name: string}>();
  @Output() deletePage = new EventEmitter<string>();

  tools = [
    { type: 'container', label: 'Khối chứa (Container)', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { type: 'text', label: 'Văn bản', icon: 'M4 6h16M4 12h16M4 18h10' },
    { type: 'button', label: 'Nút bấm', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5' },
    { type: 'image', label: 'Hình ảnh', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { type: 'input', label: 'Ô nhập liệu', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { type: 'textarea', label: 'Vùng nhập liệu', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { type: 'table', label: 'Bảng dữ liệu', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' }
  ];

  onDragStart(e: DragEvent, type: string) {
    e.dataTransfer?.setData('type', type);
  }
}
