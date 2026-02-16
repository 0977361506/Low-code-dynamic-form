
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent as Comp, ComponentType } from '../types.ts';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="min-h-full w-full p-8 pb-32 flex flex-col gap-6"
      (dragover)="$event.preventDefault()"
      (drop)="onMainDrop($event)"
    >
      <!-- Hướng dẫn (Chỉ hiện khi chưa có gì) -->
      <div *ngIf="rootComponents.length === 0" class="border-2 border-dashed border-slate-300 rounded-[20px] h-64 flex flex-col items-center justify-center text-slate-400 bg-white/50 hover:bg-white/80 transition-all">
         <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
         </div>
         <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Kéo thả phần tử vào đây</span>
      </div>

      <!-- Danh sách các Rows (Container) -->
      <div *ngFor="let row of rootComponents; trackBy: trackById"
           class="relative group/row transition-all"
           [style]="getRowStyles(row)"
           (click)="onSelect($event, row.id)"
           (dragover)="$event.preventDefault()"
           (drop)="onRowDrop($event, row.id)"
      >
         <!-- Row Tools (Chỉ hiện khi Hover vào Row) -->
         <div class="absolute -top-3 -left-3 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity flex gap-2">
            <div class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm cursor-grab">ROW</div>
            <button (click)="deleteId.emit(row.id)" class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 p-1 rounded shadow-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
         </div>

         <!-- Viền focus cho Row -->
         <div class="absolute inset-0 border-2 border-indigo-500 rounded-[inherit] pointer-events-none opacity-0 transition-opacity" [class.opacity-100]="selectedId === row.id"></div>
         <div class="absolute inset-0 border border-dashed border-slate-300 rounded-[inherit] pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity" [class.hidden]="selectedId === row.id"></div>

         <!-- Danh sách Children trong Row (Grid/Flex Layout) -->
         <div class="flex flex-wrap w-full"
              [style.gap]="row.styles.borderWidth + 'px'">
              
            <div *ngFor="let child of getChildren(row.id); trackBy: trackById"
                 (click)="onSelect($event, child.id)"
                 class="relative group/child"
                 [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width || 1)) + 'px)'"
            >
               <!-- Child Tools (Chỉ hiện khi Hover/Select) -->
               <div *ngIf="selectedId === child.id" class="absolute -top-2.5 -right-2.5 z-30 flex gap-1">
                  <button (click)="deleteId.emit(child.id)" class="bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-110"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
               </div>
               
               <!-- Border xanh khi Select -->
               <div class="absolute inset-0 border-2 border-indigo-500 rounded-[inherit] pointer-events-none z-10 opacity-0 transition-opacity" [class.opacity-100]="selectedId === child.id"></div>
               <!-- Border nét đứt khi Hover -->
               <div class="absolute inset-0 border border-dashed border-indigo-300/50 bg-indigo-50/10 rounded-[inherit] pointer-events-none z-10 opacity-0 group-hover/child:opacity-100 transition-opacity" [class.hidden]="selectedId === child.id"></div>

               <!-- Render Component (Mô phỏng Form thật) -->
               <div class="w-full h-full overflow-hidden" [style]="getChildStyles(child)">
                 <ng-container [ngSwitch]="child.type">
                   
                   <!-- IMAGE -->
                   <img *ngSwitchCase="'image'" [src]="child.content" class="w-full h-full object-cover block rounded-[inherit]">
                   
                   <!-- INPUT: Render giống thật -->
                   <div *ngSwitchCase="'input'" class="w-full h-full relative">
                      <input type="text" [value]="child.content" (input)="onInlineInput($event, child.id)" 
                             class="w-full h-full bg-white border border-slate-300 text-slate-700 text-sm rounded-[inherit] px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
                             placeholder="Nhập giá trị...">
                   </div>
                   
                   <!-- TEXTAREA -->
                   <div *ngSwitchCase="'textarea'" class="w-full h-full relative">
                      <textarea [value]="child.content" (input)="onInlineInput($event, child.id)" 
                                class="w-full h-full bg-white border border-slate-300 text-slate-700 text-sm rounded-[inherit] p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-400"></textarea>
                   </div>
                   
                   <!-- TABLE -->
                   <div *ngSwitchCase="'table'" class="w-full h-full overflow-hidden border border-slate-200 rounded-[inherit] bg-white shadow-sm">
                      <table class="w-full text-xs text-left">
                         <thead class="bg-slate-50 text-slate-500 font-bold uppercase">
                           <tr><th *ngFor="let h of parseTable(child.content)[0]" class="p-3 border-b border-slate-100">{{h}}</th></tr>
                         </thead>
                         <tbody class="divide-y divide-slate-100">
                           <tr *ngFor="let r of parseTable(child.content).slice(1)">
                             <td *ngFor="let c of r" class="p-3 text-slate-600">{{c}}</td>
                           </tr>
                         </tbody>
                      </table>
                   </div>

                   <!-- BUTTON -->
                   <button *ngSwitchCase="'button'" class="w-full h-full flex items-center justify-center font-bold shadow-sm hover:shadow active:translate-y-0.5 transition-all text-sm uppercase tracking-wide">
                     {{child.content}}
                   </button>

                   <!-- TEXT / LABEL -->
                   <div *ngSwitchDefault class="w-full h-full flex items-center leading-snug"
                        [attr.contenteditable]="selectedId === child.id"
                        (input)="onInlineInput($event, child.id)"
                        (keydown.enter)="$event.preventDefault()"
                        [style.justify-content]="getJustify(child.styles.textAlign)">
                     {{child.content}}
                   </div>
                 </ng-container>
               </div>
            </div>
            
            <!-- Drop Hint inside Row (Ẩn đi cho giống thật, chỉ hiện vùng nhỏ) -->
            <div *ngIf="getChildren(row.id).length === 0" class="w-full h-12 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wide bg-slate-50">
               + Thả thành phần vào đây
            </div>
         </div>
      </div>

      <!-- Main Drop Zone Bottom (Nút thêm dòng mới) -->
      <div class="py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer group">
         <span class="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Thêm hàng mới
         </span>
      </div>
    </div>
  `
})
export class CanvasComponent {
  @Input() components: Comp[] = [];
  @Input() selectedId: string | null = null;
  @Output() select = new EventEmitter<string | null>();
  @Output() updateStyles = new EventEmitter<{id: string, styles: Partial<Comp['styles']>}>();
  @Output() updateContent = new EventEmitter<{id: string, content: string}>();
  @Output() addComponentAt = new EventEmitter<{type: ComponentType, parentId?: string}>();
  @Output() deleteId = new EventEmitter<string>();

  trackById(index: number, item: Comp) { return item.id; }
  
  get rootComponents() { 
    return this.components.filter(c => c.parentId === null || c.type === 'container'); 
  }

  getChildren(parentId: string) {
    return this.components.filter(c => c.parentId === parentId);
  }

  parseTable(content: string) { return content ? content.split('|').map(row => row.split(',')) : []; }
  getJustify(align: string) { return align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'; }

  getRowStyles(comp: Comp) {
    return {
      backgroundColor: comp.styles.backgroundColor,
      padding: comp.styles.padding + 'px',
      borderRadius: comp.styles.borderRadius + 'px',
      minHeight: 'auto',
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
      height: comp.styles.height > 0 ? comp.styles.height + 'px' : 'auto',
      minHeight: comp.type === 'input' || comp.type === 'button' ? '42px' : 'auto'
    };
  }

  onSelect(e: MouseEvent, id: string) {
    e.stopPropagation();
    this.select.emit(id);
  }

  onInlineInput(e: any, id: string) {
    const content = e.target.value !== undefined ? e.target.value : e.target.innerText;
    this.updateContent.emit({ id, content });
  }

  onMainDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer?.getData('type') as ComponentType;
    if (type) {
      this.addComponentAt.emit({ type });
    }
  }

  onRowDrop(e: DragEvent, rowId: string) {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer?.getData('type') as ComponentType;
    if (type) {
      if (type === 'container') {
        this.addComponentAt.emit({ type });
      } else {
        this.addComponentAt.emit({ type, parentId: rowId });
      }
    }
  }
}
