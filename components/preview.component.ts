
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent as Comp, Page } from '../types';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] bg-white flex flex-col h-screen w-screen animate-in fade-in duration-300">
      <!-- Header Fixed -->
      <div class="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-50">
        <div class="flex items-center gap-2">
           <div class="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
           <div class="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
           <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
           <h2 class="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Live Preview</h2>
        </div>
        <button (click)="close.emit()" class="px-4 py-1.5 bg-slate-900 text-white rounded-md font-bold text-[11px] uppercase hover:bg-slate-800 transition-all shadow-md">
          Đóng
        </button>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto bg-slate-100 p-8 custom-scrollbar relative">
        <div class="max-w-4xl mx-auto flex flex-col gap-6">
          
          <!-- Loop Rows (Main Content) -->
          <div *ngFor="let row of rootComponents" 
               class="w-full flex flex-wrap bg-white border border-slate-200 shadow-sm"
               [style.gap]="row.styles.borderWidth + 'px'"
               [style]="getRowStyles(row)">
               
               <div *ngFor="let child of getChildren(row.id, components)" 
                    class="relative"
                    [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width || 1)) + 'px)'"
                    [style]="getChildStyles(child)">
                    <ng-container [ngTemplateOutlet]="componentRenderer" [ngTemplateOutletContext]="{child: child}"></ng-container>
               </div>
          </div>
          <div class="h-20"></div>
        </div>

        <!-- DYNAMIC MODAL / POPUP -->
        <div *ngIf="isPopupOpen" class="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <!-- Popup Header -->
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                 <h3 class="font-bold text-slate-800">{{popupData.title}}</h3>
                 <button (click)="isPopupOpen = false" class="text-slate-400 hover:text-red-500"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              
              <!-- Popup Content (Scrollable) -->
              <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                 <!-- CASE: TEXT -->
                 <div *ngIf="popupData.type === 'text'" class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {{popupData.content}}
                 </div>

                 <!-- CASE: DYNAMIC COMPONENTS (JSON / PAGE) -->
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

              <!-- Popup Footer -->
              <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                 <button (click)="isPopupOpen = false" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-700">Đóng</button>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Reusable Component Renderer Template -->
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
export class PreviewComponent {
  @Input() components: Comp[] = [];
  @Input() pages: Page[] = [];
  @Output() close = new EventEmitter<void>();

  formValues: {[key: string]: string} = {};
  
  isPopupOpen = false;
  popupData = { title: '', content: '', type: 'text' };
  popupComponents: Comp[] = [];

  get rootComponents() { 
    return this.components.filter(c => c.parentId === null || c.type === 'container'); 
  }
  getPopupRootComponents() {
    return this.popupComponents.filter(c => c.parentId === null || c.type === 'container');
  }
  getChildren(parentId: string, source: Comp[]) {
    return source.filter(c => c.parentId === parentId);
  }
  parseTable(content: string) { return content ? content.split('|').map(row => row.split(',')) : []; }
  getJustify(align: string) { return align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'; }
  getRowStyles(comp: Comp) {
    return { backgroundColor: comp.styles.backgroundColor, padding: comp.styles.padding + 'px', borderRadius: comp.styles.borderRadius + 'px' };
  }
  getChildStyles(comp: Comp) {
    return { backgroundColor: comp.styles.backgroundColor, color: comp.styles.color, fontSize: comp.styles.fontSize + 'px', borderRadius: comp.styles.borderRadius + 'px', padding: comp.styles.padding + 'px', textAlign: comp.styles.textAlign };
  }
  updateFormValue(id: string, event: any) {
    this.formValues[id] = event.target.value;
  }

  handleAction(comp: Comp) {
    const action = comp.action;
    if (!action || action.type === 'none') return;

    if (action.type === 'api') {
      const data: any = {};
      const inputs = [...this.components, ...this.popupComponents].filter(c => c.type === 'input' || c.type === 'textarea');
      inputs.forEach(input => {
        const key = input.content && input.content.length < 50 ? input.content : `Field_${input.id.slice(0,5)}`;
        data[key] = this.formValues[input.id] || '';
      });
      if (!action.apiUrl) { alert('Chưa cấu hình API URL!'); return; }
      alert(`[API] ${action.apiMethod} ${action.apiUrl}\n${JSON.stringify(data, null, 2)}`);
    } 
    else if (action.type === 'popup') {
      this.popupData = {
        title: action.popupTitle || 'Thông báo',
        content: '',
        type: action.popupType || 'text'
      };
      this.popupComponents = [];

      if (action.popupType === 'text') {
        this.popupData.content = action.message || 'Không có nội dung';
      } else if (action.popupType === 'json') {
        try { const parsed = JSON.parse(action.popupContentJson || '[]'); if (Array.isArray(parsed)) this.popupComponents = parsed; } catch { alert('Lỗi JSON!'); }
      } else if (action.popupType === 'page') {
        // FIND PAGE IN PROJECT
        if (action.popupTargetId) {
          const targetPage = this.pages.find(p => p.id === action.popupTargetId);
          if (targetPage) {
            this.popupComponents = targetPage.components; // Load toàn bộ component của trang đó
          } else {
            alert('Không tìm thấy Trang đích (Page ID invalid)');
          }
        }
      }
      this.isPopupOpen = true;
    }
    else if (action.type === 'navigate') {
      if (action.targetUrl) window.open(action.targetUrl, action.newTab ? '_blank' : '_self');
    }
    else if (action.type === 'alert') {
      alert(action.message);
    }
    else if (action.type === 'console') {
      console.log(action.message);
    }
  }
}
