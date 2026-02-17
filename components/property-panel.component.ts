
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasComponent as Comp, ActionConfig, Page } from '../types';

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
          
          <!-- CONFIG: LABEL (For Input/Textarea) -->
          <div *ngIf="component.type === 'input' || component.type === 'textarea'" class="space-y-3">
             <div class="flex items-center gap-2">
                 <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nhãn (Label)</span>
                 <span class="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">JSON Config</span>
             </div>
             <input type="text" [ngModel]="component.label" (ngModelChange)="updateLabel.emit($event)" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" placeholder="VD: Họ và tên..." />
          </div>

          <!-- Content Input -->
          <div class="space-y-3" *ngIf="component.type !== 'container'">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {{ (component.type === 'input' || component.type === 'textarea') ? 'Placeholder' : 'Nội dung / Text' }}
            </label>
            <textarea 
              [ngModel]="component.content"
              (ngModelChange)="updateContent.emit($event)"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none h-20 transition-all resize-none"
              [placeholder]="(component.type === 'input' || component.type === 'textarea') ? 'Nhập placeholder...' : 'Nhập nội dung...'"
            ></textarea>
          </div>

          <!-- EVENT & ACTION CONFIGURATION -->
          <div *ngIf="component.type === 'button'" class="p-4 bg-orange-50 border border-orange-100 rounded-2xl space-y-4">
             <div class="flex items-center gap-2 mb-1 border-b border-orange-100 pb-2">
                <svg class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <label class="text-[10px] font-black text-orange-600 uppercase tracking-widest">Cấu hình Sự kiện (Event)</label>
             </div>
             
             <!-- Select Action Type -->
             <div class="space-y-1">
                <span class="text-[9px] font-bold text-slate-500">Hành động khi Click</span>
                <select 
                  [ngModel]="localAction.type" 
                  (ngModelChange)="onActionTypeChange($event)"
                  class="w-full p-2 bg-white border border-orange-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-200 outline-none"
                >
                  <option value="none">Không có (None)</option>
                  <option value="api">Gọi API (Call API)</option>
                  <option value="popup">Mở Popup Động</option>
                  <option value="navigate">Chuyển trang (Redirect)</option>
                  <option value="alert">Hiện thông báo (Alert)</option>
                  <option value="console">Log Console</option>
                </select>
             </div>
             
             <!-- ... API/Popup Configs ... -->
             <div *ngIf="localAction.type === 'api'" class="space-y-3 animate-in fade-in">
                <input type="text" [(ngModel)]="localAction.apiUrl" (blur)="emitAction()" placeholder="API URL..." class="w-full p-2 bg-white border border-orange-200 rounded-lg text-xs outline-none" />
                <select [(ngModel)]="localAction.apiMethod" (change)="emitAction()" class="w-full p-2 bg-white border border-orange-200 rounded-lg text-xs outline-none">
                      <option value="POST">POST</option><option value="GET">GET</option>
                </select>
             </div>
             
             <div *ngIf="localAction.type === 'alert'" class="space-y-1 animate-in fade-in">
                <input type="text" [(ngModel)]="localAction.message" (blur)="emitAction()" placeholder="Tin nhắn..." class="w-full p-2 bg-white border border-orange-200 rounded-lg text-xs outline-none" />
             </div>
          </div>

          <!-- GRID SYSTEM CONTROL -->
          <div *ngIf="component.type !== 'container'" class="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Độ rộng cột</label>
              <span class="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">{{component.styles.width}}%</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button (click)="updateStyles.emit({width: 25})" [class]="getBtnClass(25)">1/4</button>
              <button (click)="updateStyles.emit({width: 33.33})" [class]="getBtnClass(33.33)">1/3</button>
              <button (click)="updateStyles.emit({width: 50})" [class]="getBtnClass(50)">1/2</button>
              <button (click)="updateStyles.emit({width: 100})" [class]="getBtnClass(100)">Full</button>
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
          </div>

          <!-- Styles Config -->
          <div class="space-y-6">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Căn lề</label>
              <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button *ngFor="let align of ['left', 'center', 'right']" (click)="updateStyles.emit({textAlign: align})" class="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all" [class.bg-white]="component.styles.textAlign === align" [class.shadow-sm]="component.styles.textAlign === align">{{align}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class PropertyPanelComponent implements OnChanges {
  @Input() component: Comp | null = null;
  @Input() pages: Page[] = [];
  @Output() updateContent = new EventEmitter<string>();
  @Output() updateLabel = new EventEmitter<string>(); // <-- New Output
  @Output() updateStyles = new EventEmitter<Partial<Comp['styles']>>();
  @Output() updateAction = new EventEmitter<ActionConfig>();
  @Output() delete = new EventEmitter<void>();

  localAction: ActionConfig = { type: 'none' };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['component'] && this.component) {
      this.localAction = this.component.action ? { 
        ...this.component.action,
        popupType: this.component.action.popupType || 'text',
      } : { type: 'none', popupType: 'text' };
    }
  }

  onActionTypeChange(type: any) {
    this.localAction = { 
      type, 
      apiUrl: '', apiMethod: 'POST', message: '', targetUrl: '', 
      popupTitle: 'Thông báo', popupType: 'text', popupContentJson: '', popupTargetId: ''
    };
    this.emitAction();
  }

  emitAction() {
    this.updateAction.emit(this.localAction);
  }

  getBtnClass(width: number) {
    const isActive = Math.abs((this.component?.styles.width || 0) - width) < 1;
    return `flex items-center justify-center py-2 rounded-xl text-[10px] font-bold border transition-all ${
      isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50'
    }`;
  }
}
