
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasComponent as Comp, Page, AppSchema } from '../types';

@Component({
  selector: 'app-viewer-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 flex flex-col bg-slate-100 overflow-hidden h-full relative">
      
      <!-- 1. Màn hình nhập JSON -->
      <div *ngIf="!isRendered" class="flex-1 flex items-center justify-center p-8 overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div class="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl p-8 border border-slate-200 flex flex-col gap-6">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">App Source (JSON)</h2>
            <p class="text-slate-500 text-sm">Hệ thống Multi-Page Application</p>
          </div>
          <div class="relative group">
            <textarea 
              [(ngModel)]="rawJson"
              placeholder="Dán JSON AppSchema tại đây..."
              class="w-full h-80 bg-slate-900 text-indigo-300 font-mono text-xs p-8 rounded-2xl outline-none resize-none custom-scrollbar"
            ></textarea>
          </div>
          <div class="flex gap-4">
             <button (click)="syncFromBuilder()" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Reset to Current Design</button>
             <button (click)="render()" class="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all uppercase tracking-widest">Render App</button>
          </div>
        </div>
      </div>

      <!-- 2. Màn hình Kết quả -->
      <div *ngIf="isRendered" class="flex-1 overflow-y-auto bg-slate-100 p-8 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        <div class="max-w-4xl mx-auto relative flex flex-col gap-6 pb-20">
          
          <div class="flex justify-between items-center mb-2">
             <h2 class="text-lg font-bold text-slate-700">Page: {{getCurrentPageName()}}</h2>
             <button (click)="isRendered = false" class="bg-slate-900 text-white shadow-lg px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">Sửa Source</button>
          </div>

          <!-- Loop Rows of ACTIVE PAGE -->
          <div *ngFor="let row of rootComponents" 
               class="w-full flex flex-wrap bg-white rounded-xl shadow-sm border border-slate-200"
               [style.gap]="row.styles.borderWidth + 'px'"
               [style]="getRowStyles(row)">
               
               <div *ngFor="let child of getChildren(row.id, currentComponents)" 
                    class="relative"
                    [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width)) + 'px)'"
                    [style]="getChildStyles(child)">
                    
                    <ng-container [ngTemplateOutlet]="componentRenderer" [ngTemplateOutletContext]="{child: child}"></ng-container>
               </div>
          </div>
        </div>

        <!-- DYNAMIC POPUP IN VIEWER -->
        <div *ngIf="isPopupOpen" class="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                 <h3 class="font-bold text-slate-800">{{popupData.title}}</h3>
                 <button (click)="isPopupOpen = false" class="text-slate-400 hover:text-red-500"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              
              <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                 <div *ngIf="popupData.type === 'text'" class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{{popupData.content}}</div>

                 <div *ngIf="popupData.type === 'json' || popupData.type === 'page'" class="flex flex-col gap-4">
                    <div *ngFor="let row of getPopupRootComponents()" 
                         class="w-full flex flex-wrap bg-white border border-slate-100 shadow-sm rounded-lg"
                         [style.gap]="row.styles.borderWidth + 'px'"
                         [style]="getRowStyles(row)">
                         
                         <div *ngFor="let child of getChildren(row.id, popupComponents)" 
                              class="relative"
                              [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width || 1)) + 'px)'"
                              [style]="getChildStyles(child)">
                              
                              <ng-container [ngTemplateOutlet]="componentRenderer" [ngTemplateOutletContext]="{child: child}"></ng-container>
                         </div>
                    </div>
                 </div>
              </div>

              <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                 <button (click)="isPopupOpen = false" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-700">Đóng</button>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Reusable Component Renderer -->
    <ng-template #componentRenderer let-child="child">
      <ng-container [ngSwitch]="child.type">
          <img *ngSwitchCase="'image'" [src]="child.content" class="w-full h-auto max-h-64 object-cover block rounded-[inherit]">
          
          <input *ngSwitchCase="'input'" type="text" 
                 [placeholder]="child.content" 
                 (input)="updateFormValue(child.id, $event)"
                 class="w-full h-[38px] bg-white border border-slate-300 rounded-[inherit] px-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm shadow-sm placeholder:text-slate-400">
          
          <textarea *ngSwitchCase="'textarea'" 
                    [placeholder]="child.content" 
                    (input)="updateFormValue(child.id, $event)"
                    class="w-full min-h-[80px] bg-white border border-slate-300 rounded-[inherit] p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-sm shadow-sm placeholder:text-slate-400"></textarea>
          
          <div *ngSwitchCase="'table'" class="w-full overflow-hidden border border-slate-200 rounded-[inherit] bg-white shadow-sm">
            <table class="w-full text-xs text-left">
               <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                 <tr><th *ngFor="let h of parseTable(child.content)[0]" class="p-2.5">{{h}}</th></tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                 <tr *ngFor="let r of parseTable(child.content).slice(1)">
                   <td *ngFor="let c of r" class="p-2.5 text-slate-600">{{c}}</td>
                   </tr>
               </tbody>
            </table>
          </div>
          
          <button *ngSwitchCase="'button'" 
                  (click)="handleAction(child)"
                  class="w-full h-[38px] flex items-center justify-center font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity shadow-sm active:translate-y-0.5 cursor-pointer select-none">
            {{child.content}}
          </button>
          
          <div *ngSwitchDefault class="w-full flex items-center leading-normal"
               [style.justify-content]="getJustify(child.styles.textAlign)">
            {{child.content}}
          </div>
      </ng-container>
    </ng-template>
  `
})
export class ViewerPageComponent implements OnChanges {
  @Input() pages: Page[] = [];
  @Input() initialPageId: string = '';

  rawJson: string = '[]';
  isRendered: boolean = false;
  
  // App State in Viewer
  viewerPages: Page[] = [];
  activePageId: string = '';

  formValues: {[key: string]: string} = {};
  isPopupOpen = false;
  popupData = { title: '', content: '', type: 'text' };
  popupComponents: Comp[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // Tự động cập nhật JSON khi input pages thay đổi
    if (changes['pages'] || changes['initialPageId']) {
      this.syncFromBuilder();
    }
  }

  get currentComponents() {
    return this.viewerPages.find(p => p.id === this.activePageId)?.components || [];
  }

  get rootComponents() { 
    return this.currentComponents.filter(c => c.parentId === null || c.type === 'container'); 
  }

  getPopupRootComponents() {
    return this.popupComponents.filter(c => c.parentId === null || c.type === 'container');
  }

  getChildren(parentId: string, source: Comp[]) {
    return source.filter(c => c.parentId === parentId);
  }

  getCurrentPageName() {
    return this.viewerPages.find(p => p.id === this.activePageId)?.name || 'Unknown';
  }

  syncFromBuilder() {
    const schema: AppSchema = { pages: this.pages, activePageId: this.initialPageId };
    this.rawJson = JSON.stringify(schema, null, 2);
  }

  parseTable(content: string) { return content ? content.split('|').map(row => row.split(',')) : []; }
  getJustify(align: string) { return align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'; }
  getRowStyles(comp: Comp) { return { backgroundColor: comp.styles.backgroundColor, padding: comp.styles.padding + 'px', borderRadius: comp.styles.borderRadius + 'px' }; }
  getChildStyles(comp: Comp) { return { backgroundColor: comp.styles.backgroundColor, color: comp.styles.color, fontSize: comp.styles.fontSize + 'px', borderRadius: comp.styles.borderRadius + 'px', padding: comp.styles.padding + 'px', textAlign: comp.styles.textAlign }; }
  
  updateFormValue(id: string, event: any) {
    this.formValues[id] = event.target.value;
  }
  
  render() {
    try {
      const data = JSON.parse(this.rawJson);
      if (data.pages && Array.isArray(data.pages)) {
        this.viewerPages = data.pages;
        this.activePageId = data.activePageId || this.viewerPages[0]?.id;
        this.isRendered = true;
      } else {
        alert('JSON phải đúng format AppSchema { pages: [], activePageId: "" }');
      }
    } catch (e) { alert('JSON Error: ' + e); }
  }

  handleAction(comp: Comp) {
    const action = comp.action;
    if (!action || action.type === 'none') return;

    if (action.type === 'api') {
       alert('[API] Simulate Submit');
    }
    else if (action.type === 'popup') {
      this.popupData = { title: action.popupTitle || 'Thông báo', content: '', type: action.popupType || 'text' };
      this.popupComponents = [];
      
      if (action.popupType === 'page' && action.popupTargetId) {
        const target = this.viewerPages.find(p => p.id === action.popupTargetId);
        if (target) this.popupComponents = target.components;
      } else if (action.popupType === 'json') {
        try { this.popupComponents = JSON.parse(action.popupContentJson || '[]'); } catch {}
      } else {
        this.popupData.content = action.message || '';
      }
      this.isPopupOpen = true;
    }
    else if (action.type === 'navigate') {
       // Logic redirect
    }
  }
}
