
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasComponent as Comp } from '../types.ts';

@Component({
  selector: 'app-viewer-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      <!-- Màn hình Nhập JSON -->
      <div *ngIf="!isRendered" class="flex-1 flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
        <div class="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-10 border border-slate-200 flex flex-col gap-6">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Cấu trúc giao diện JSON</h2>
            <p class="text-slate-500 text-sm">Dán mã JSON hoặc sử dụng dữ liệu từ trình thiết kế</p>
          </div>
          <div class="relative group">
            <textarea 
              [(ngModel)]="rawJson"
              placeholder="Dán mã JSON tại đây..."
              class="w-full h-80 bg-slate-900 text-indigo-300 font-mono text-xs p-8 rounded-3xl outline-none resize-none custom-scrollbar"
            ></textarea>
          </div>
          <div class="flex gap-4">
             <button (click)="syncFromBuilder()" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">Lấy Data từ Thiết kế</button>
             <button (click)="render()" class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all uppercase tracking-widest">Xem Giao Diện</button>
          </div>
        </div>
      </div>

      <!-- Màn hình Kết quả (Flex Render) -->
      <div *ngIf="isRendered" class="flex-1 overflow-auto p-12 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-200/50">
        <div class="max-w-7xl mx-auto bg-white min-h-[85vh] shadow-2xl rounded-[32px] border border-slate-300 relative overflow-hidden ring-8 ring-white/50 p-10 flex flex-col gap-8">
          
          <div class="absolute top-4 right-4 z-[100]">
             <button (click)="isRendered = false" class="bg-slate-900 text-white shadow-lg px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">Sửa JSON</button>
          </div>

          <!-- Loop Rows -->
          <div *ngFor="let row of rootComponents" 
               class="w-full flex flex-wrap"
               [style.gap]="row.styles.borderWidth + 'px'"
               [style]="getRowStyles(row)">
               
               <!-- Loop Children -->
               <div *ngFor="let child of getChildren(row.id)" 
                    class="overflow-hidden"
                    [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width)) + 'px)'"
                    [style]="getChildStyles(child)">
                    
                    <ng-container [ngSwitch]="child.type">
                      <img *ngSwitchCase="'image'" [src]="child.content" class="w-full h-full object-cover block rounded-[inherit]">
                      <input *ngSwitchCase="'input'" type="text" [placeholder]="child.content" class="w-full h-full bg-transparent outline-none px-3 border border-slate-200 rounded-[inherit]" readonly>
                      <textarea *ngSwitchCase="'textarea'" [placeholder]="child.content" class="w-full h-full bg-transparent outline-none p-3 border border-slate-200 resize-none rounded-[inherit]" readonly></textarea>
                      <div *ngSwitchCase="'table'" class="w-full h-full overflow-auto">
                         <table class="w-full border-collapse">
                            <tr *ngFor="let row of parseTable(child.content); let i = index" [class.bg-slate-50]="i === 0">
                              <td *ngFor="let cell of row" class="border border-slate-100 p-2 text-[11px]">{{cell}}</td>
                            </tr>
                         </table>
                      </div>
                      <button *ngSwitchCase="'button'" class="w-full h-full flex items-center justify-center font-bold">
                        {{child.content}}
                      </button>
                      <div *ngSwitchDefault class="w-full h-full flex items-center"
                           [style.justify-content]="getJustify(child.styles.textAlign)">
                        {{child.content}}
                      </div>
                    </ng-container>
               </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewerPageComponent {
  private _builderData: Comp[] = [];
  
  @Input() set initialData(value: Comp[]) {
    this._builderData = value;
    if (!this.rawJson || this.rawJson === '[]') {
      this.rawJson = JSON.stringify(value, null, 2);
    }
  }

  @Output() onUpdateData = new EventEmitter<Comp[]>();

  rawJson: string = '[]';
  isRendered: boolean = false;
  components: Comp[] = [];

  get rootComponents() { 
    return this.components.filter(c => c.parentId === null || c.type === 'container'); 
  }

  getChildren(parentId: string) {
    return this.components.filter(c => c.parentId === parentId);
  }

  syncFromBuilder() {
    this.rawJson = JSON.stringify(this._builderData, null, 2);
  }

  parseTable(content: string) { return content ? content.split('|').map(row => row.split(',')) : []; }
  
  render() {
    try {
      const data = JSON.parse(this.rawJson);
      if (Array.isArray(data)) { this.components = data; this.isRendered = true; this.onUpdateData.emit(data); }
      else { alert('Lỗi: JSON phải là mảng.'); }
    } catch (e) { alert('Lỗi JSON: ' + (e as Error).message); }
  }

  getJustify(align: string) { return align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'; }

  getRowStyles(comp: Comp) {
    return {
      backgroundColor: comp.styles.backgroundColor,
      padding: comp.styles.padding + 'px',
      borderRadius: comp.styles.borderRadius + 'px',
    };
  }

  getChildStyles(comp: Comp) {
    return {
      backgroundColor: comp.styles.backgroundColor,
      color: comp.styles.color,
      fontSize: comp.styles.fontSize + 'px',
      borderRadius: comp.styles.borderRadius + 'px',
      padding: comp.styles.padding + 'px',
      textAlign: comp.styles.textAlign,
    };
  }
}
