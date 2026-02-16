
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasComponent as Comp } from '../types.ts';

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="w-80 bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col h-full shadow-2xl z-30">
      <div *ngIf="!component" class="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40 select-none">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
           <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
        </div>
        <p class="text-xs font-black uppercase tracking-widest text-slate-400">Chọn phần tử để chỉnh sửa</p>
      </div>

      <div *ngIf="component" class="flex flex-col animate-in fade-in slide-in-from-right duration-200">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg *ngIf="component.type === 'container'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <svg *ngIf="component.type !== 'container'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </span>
            <div>
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-wide">{{component.type === 'container' ? 'Hàng (Row)' : 'Phần tử (Item)'}}</h3>
              <p class="text-[9px] text-slate-400 font-mono">ID: ...{{component.id.slice(-6)}}</p>
            </div>
          </div>
          <button (click)="delete.emit()" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <div class="p-5 space-y-8">
          
          <!-- GRID SYSTEM CONTROL (Quan trọng) -->
          <div *ngIf="component.type !== 'container'" class="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Độ rộng cột</label>
              <span class="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">{{component.styles.width}}%</span>
            </div>
            
            <div class="grid grid-cols-4 gap-2">
              <button (click)="updateStyles.emit({width: 25})" [class]="getBtnClass(25)">
                <div class="flex gap-0.5 w-full h-2 justify-center"><div class="w-1 bg-current rounded-sm"></div></div>
                <span class="mt-1">1/4</span>
              </button>
              <button (click)="updateStyles.emit({width: 33.33})" [class]="getBtnClass(33.33)">
                <div class="flex gap-0.5 w-full h-2 justify-center"><div class="w-1.5 bg-current rounded-sm"></div></div>
                <span class="mt-1">1/3</span>
              </button>
              <button (click)="updateStyles.emit({width: 50})" [class]="getBtnClass(50)">
                <div class="flex gap-0.5 w-full h-2 justify-center"><div class="w-2 bg-current rounded-sm"></div></div>
                <span class="mt-1">1/2</span>
              </button>
              <button (click)="updateStyles.emit({width: 100})" [class]="getBtnClass(100)">
                <div class="flex gap-0.5 w-full h-2 justify-center"><div class="w-4 bg-current rounded-sm"></div></div>
                <span class="mt-1">Full</span>
              </button>
            </div>
            <input type="range" min="5" max="100" step="5" [ngModel]="component.styles.width" (ngModelChange)="updateStyles.emit({width: $event})" class="w-full accent-indigo-600 mt-2" />
          </div>

          <!-- GAP Control for Container -->
          <div *ngIf="component.type === 'container'" class="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
             <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Khoảng cách con (Gap)</label>
             <div class="flex items-center gap-3">
               <input type="range" min="0" max="48" step="4" [ngModel]="component.styles.borderWidth" (ngModelChange)="updateStyles.emit({borderWidth: $event})" class="flex-1 accent-indigo-600" />
               <span class="text-xs font-bold w-8 text-right">{{component.styles.borderWidth}}px</span>
             </div>
             <p class="text-[9px] text-slate-400 italic">* Sử dụng border-width làm tham số Gap</p>
          </div>

          <!-- Content Input -->
          <div class="space-y-3" *ngIf="component.type !== 'container'">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</label>
            <textarea 
              [ngModel]="component.content"
              (ngModelChange)="updateContent.emit($event)"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none h-20 transition-all resize-none"
              placeholder="Nhập nội dung..."
            ></textarea>
          </div>

          <!-- Typography / Styles -->
          <div class="space-y-6">
            <!-- Align -->
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Căn lề</label>
              <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button *ngFor="let align of ['left', 'center', 'right']"
                        (click)="updateStyles.emit({textAlign: align})"
                        class="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center"
                        [class.bg-white]="component.styles.textAlign === align"
                        [class.shadow-sm]="component.styles.textAlign === align"
                        [class.text-indigo-600]="component.styles.textAlign === align"
                        [class.text-slate-400]="component.styles.textAlign !== align"
                >
                  <svg *ngIf="align==='left'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M4 12h10M4 18h7" /></svg>
                  <svg *ngIf="align==='center'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M7 12h10M9 18h6" /></svg>
                  <svg *ngIf="align==='right'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M10 12h10M13 18h7" /></svg>
                </button>
              </div>
            </div>

            <!-- Spacing & Radius -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Padding</label>
                 <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2">
                    <input type="number" [ngModel]="component.styles.padding" (ngModelChange)="updateStyles.emit({padding: $event})" class="w-full bg-transparent p-2 text-xs font-bold outline-none" />
                    <span class="text-[9px] text-slate-400">px</span>
                 </div>
              </div>
              <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bo góc</label>
                 <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2">
                    <input type="number" [ngModel]="component.styles.borderRadius" (ngModelChange)="updateStyles.emit({borderRadius: $event})" class="w-full bg-transparent p-2 text-xs font-bold outline-none" />
                    <span class="text-[9px] text-slate-400">px</span>
                 </div>
              </div>
            </div>

            <!-- Colors -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Màu sắc</label>
              <div class="grid grid-cols-2 gap-3">
                 <div class="space-y-1">
                   <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer relative group">
                     <input type="color" [ngModel]="component.styles.backgroundColor" (ngModelChange)="updateStyles.emit({backgroundColor: $event})" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <div class="w-6 h-6 rounded-lg border border-slate-100 shadow-sm" [style.background-color]="component.styles.backgroundColor"></div>
                     <span class="text-[10px] font-mono text-slate-600 uppercase flex-1 text-right">{{component.styles.backgroundColor}}</span>
                   </div>
                   <span class="text-[9px] text-slate-400 font-medium px-1">Background</span>
                 </div>
                 <div class="space-y-1">
                   <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer relative group">
                     <input type="color" [ngModel]="component.styles.color" (ngModelChange)="updateStyles.emit({color: $event})" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <div class="w-6 h-6 rounded-lg border border-slate-100 shadow-sm" [style.background-color]="component.styles.color"></div>
                     <span class="text-[10px] font-mono text-slate-600 uppercase flex-1 text-right">{{component.styles.color}}</span>
                   </div>
                   <span class="text-[9px] text-slate-400 font-medium px-1">Text Color</span>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </aside>
  `
})
export class PropertyPanelComponent {
  @Input() component: Comp | null = null;
  @Output() updateContent = new EventEmitter<string>();
  @Output() updateStyles = new EventEmitter<Partial<Comp['styles']>>();
  @Output() delete = new EventEmitter<void>();

  getBtnClass(width: number) {
    // Check approximate match for floating point comparison
    const isActive = Math.abs((this.component?.styles.width || 0) - width) < 1;
    return `flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-bold border transition-all ${
      isActive 
      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
    }`;
  }
}
