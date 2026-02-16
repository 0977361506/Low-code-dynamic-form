
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent as Comp } from '../types.ts';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] bg-white flex flex-col animate-in fade-in duration-300">
      <div class="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
        <div class="flex items-center gap-2">
           <div class="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
           <div class="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
           <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
           <h2 class="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</h2>
        </div>
        <button (click)="close.emit()" class="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase hover:bg-slate-800 transition-all shadow-lg">
          Thoát Preview
        </button>
      </div>
      <div class="flex-1 overflow-auto bg-slate-100 p-8 custom-scrollbar flex justify-center">
        <div class="w-full max-w-5xl bg-white min-h-[50vh] shadow-xl rounded-2xl border border-slate-200 overflow-hidden p-8 flex flex-col gap-6">
          
          <!-- Loop Rows -->
          <div *ngFor="let row of rootComponents" 
               class="w-full flex flex-wrap" 
               [style.gap]="row.styles.borderWidth + 'px'"
               [style]="getRowStyles(row)">
               
               <!-- Loop Children -->
               <div *ngFor="let child of getChildren(row.id)" 
                    class="overflow-hidden relative"
                    [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width || 1)) + 'px)'"
                    [style]="getChildStyles(child)">
                    
                    <ng-container [ngSwitch]="child.type">
                      <img *ngSwitchCase="'image'" [src]="child.content" class="w-full h-full object-cover block rounded-[inherit]">
                      
                      <input *ngSwitchCase="'input'" type="text" [placeholder]="child.content" class="w-full h-full bg-white border border-slate-300 rounded-[inherit] px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm shadow-sm" readonly>
                      
                      <textarea *ngSwitchCase="'textarea'" [placeholder]="child.content" class="w-full h-full bg-white border border-slate-300 rounded-[inherit] p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-sm shadow-sm" readonly></textarea>
                      
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
                      
                      <button *ngSwitchCase="'button'" class="w-full h-full flex items-center justify-center font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity">
                        {{child.content}}
                      </button>
                      
                      <div *ngSwitchDefault class="w-full h-full flex items-center leading-snug"
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
export class PreviewComponent {
  @Input() components: Comp[] = [];
  @Output() close = new EventEmitter<void>();

  get rootComponents() { 
    return this.components.filter(c => c.parentId === null || c.type === 'container'); 
  }

  getChildren(parentId: string) {
    return this.components.filter(c => c.parentId === parentId);
  }

  parseTable(content: string) { return content ? content.split('|').map(row => row.split(',')) : []; }

  getJustify(align: string) {
    if (align === 'center') return 'center';
    if (align === 'right') return 'flex-end';
    return 'flex-start';
  }

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
      height: comp.styles.height > 0 ? comp.styles.height + 'px' : 'auto',
      minHeight: comp.type === 'input' || comp.type === 'button' ? '42px' : 'auto'
    };
  }
}
