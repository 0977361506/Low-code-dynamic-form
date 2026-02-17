
import { Component, Input, Output, EventEmitter, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent as Comp, ComponentType } from '../types.ts';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="min-h-full w-full p-8 pb-40 flex flex-col gap-4"
      (dragover)="$event.preventDefault()"
      (drop)="onMainDrop($event)"
      (click)="onCanvasClick()"
    >
      <!-- Empty State -->
      <div *ngIf="rootComponents.length === 0" class="group border border-dashed border-slate-300 rounded-xl h-64 flex flex-col items-center justify-center text-slate-400 bg-white hover:bg-slate-50 transition-all select-none">
         <span class="text-xs font-medium text-slate-500">Kéo thả phần tử vào đây để bắt đầu</span>
      </div>

      <!-- Rows Loop -->
      <div *ngFor="let row of rootComponents; trackBy: trackById"
           class="relative group/row transition-all duration-200"
           [class.z-10]="selectedId === row.id"
           [style]="getRowStyles(row)"
           (click)="onSelect($event, row.id)"
           (dragover)="onRowDragOver($event, row.id)"
           (dragleave)="onRowDragLeave($event)"
           (drop)="onRowDrop($event, row.id)"
      >
         <!-- Row Active Indicator -->
         <div class="absolute inset-0 border border-transparent rounded-[inherit] pointer-events-none transition-all duration-200"
              [class.ring-1]="selectedId === row.id"
              [class.ring-indigo-500]="selectedId === row.id">
         </div>

         <!-- Row Tools (RIGHT Side) -->
         <div class="absolute -top-3 -right-2 flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-200 z-50 px-2"
              [class.opacity-100]="selectedId === row.id">
             <span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider select-none">Hàng (Row)</span>
            <button (click)="deleteId.emit(row.id)" class="w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded flex items-center justify-center cursor-pointer hover:text-red-500 hover:border-red-500 shadow-sm" title="Xóa Hàng">
                 <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
         </div>

         <!-- Children Grid -->
         <div class="flex flex-wrap w-full relative z-10"
              [style.gap]="row.styles.borderWidth + 'px'">
              
            <ng-container *ngFor="let child of getChildren(row.id); trackBy: trackById">
                
                <!-- 
                    DRAGGABLE WRAPPER 
                    - [draggable]: TẮT KHI ĐANG SỬA (editingId === child.id)
                    - (dblclick): Kích hoạt sửa trực tiếp
                -->
                <div 
                     [draggable]="editingId !== child.id"
                     (dragstart)="onDragStart($event, child)"
                     (dragover)="onChildDragOver($event, child.id)"
                     (dragleave)="onChildDragLeave($event)"
                     (drop)="onChildDrop($event, child.id)"
                     (click)="onSelect($event, child.id)"
                     (dblclick)="onWrapperDblClick($event, child)"
                     class="relative group/child transition-transform duration-200"
                     [class.cursor-grab]="editingId !== child.id"
                     [class.cursor-text]="editingId === child.id"
                     [class.opacity-30]="isDraggingId === child.id"
                     [class.ring-2]="dragTargetId === child.id && isDraggingId !== child.id"
                     [class.ring-orange-400]="dragTargetId === child.id && isDraggingId !== child.id"
                     [class.scale-[0.98]]="dragTargetId === child.id && isDraggingId !== child.id"
                     [style.width]="'calc(' + child.styles.width + '% - ' + (row.styles.borderWidth * (100/child.styles.width - 1) / (100/child.styles.width || 1)) + 'px)'"
                >  
                   <!-- Component Active State (Only show when NOT editing) -->
                   <div *ngIf="editingId !== child.id" 
                        class="absolute inset-0 border border-transparent rounded-[inherit] pointer-events-none z-20 transition-all duration-200" 
                        [class.ring-1]="selectedId === child.id"
                        [class.ring-indigo-500]="selectedId === child.id">
                   </div>

                   <!-- Component Tools (Delete) -->
                   <div *ngIf="editingId !== child.id" class="absolute -top-2 -right-2 z-50 flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-all duration-200" [class.opacity-100]="selectedId === child.id">
                      <button (click)="deleteId.emit(child.id)" class="bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer text-slate-400 shadow-sm">
                         <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                   </div>

                   <!-- COMPONENT RENDERER -->
                   <div class="w-full h-full" [style]="getChildStyles(child)">
                     <ng-container [ngSwitch]="child.type">
                       
                       <img *ngSwitchCase="'image'" [src]="child.content" class="w-full h-auto object-cover block rounded-[inherit] pointer-events-none select-none">
                       
                       <!-- INPUT -->
                       <div *ngSwitchCase="'input'" class="w-full">
                          <!-- Label Editable -->
                          <div *ngIf="child.label" class="mb-1.5">
                              <label 
                                     #editableLabel
                                     [attr.contenteditable]="editingId === child.id && editingField === 'label'"
                                     (blur)="onBlurSave(child.id, 'label', $event)"
                                     (keydown.enter)="onEnter($event)"
                                     class="block text-xs font-semibold text-slate-700 truncate outline-none border border-transparent rounded px-0.5"
                                     [style.text-align]="child.styles.textAlign"
                                     [class.border-indigo-400]="editingId === child.id && editingField === 'label'"
                                     [class.bg-white]="editingId === child.id && editingField === 'label'">
                                     {{child.label}}
                              </label>
                          </div>
                          <!-- Input (Not contenteditable, but specific handling) -->
                          <input type="text" [value]="child.content" readonly 
                                 class="w-full h-9 px-3 rounded-[inherit] border border-slate-200 bg-white text-slate-600 text-sm pointer-events-none select-none">
                       </div>
                       
                       <!-- TEXTAREA -->
                       <div *ngSwitchCase="'textarea'" class="w-full">
                          <div *ngIf="child.label" class="mb-1.5">
                              <label 
                                     #editableLabel
                                     [attr.contenteditable]="editingId === child.id && editingField === 'label'"
                                     (blur)="onBlurSave(child.id, 'label', $event)"
                                     (keydown.enter)="onEnter($event)"
                                     class="block text-xs font-semibold text-slate-700 truncate outline-none border border-transparent rounded px-0.5"
                                     [style.text-align]="child.styles.textAlign"
                                     [class.border-indigo-400]="editingId === child.id && editingField === 'label'"
                                     [class.bg-white]="editingId === child.id && editingField === 'label'">
                                     {{child.label}}
                              </label>
                          </div>
                          <div class="w-full min-h-[80px] p-3 rounded-[inherit] border border-slate-200 bg-white text-slate-600 text-sm whitespace-pre-line pointer-events-none select-none">
                               {{child.content}}
                          </div>
                       </div>
                       
                       <!-- BUTTON -->
                       <div *ngSwitchCase="'button'" class="w-full h-full">
                           <button class="w-full h-9 px-4 flex items-center font-medium text-sm rounded-[inherit] border-0 outline-none overflow-hidden"
                                   [style.justify-content]="getJustify(child.styles.textAlign)"
                                   [class.pointer-events-none]="editingId !== child.id">
                             <!-- Span editable inside button -->
                             <!-- FIX: No w-full, No px-2, Auto width to center perfectly -->
                             <span 
                                #editableContent
                                [attr.contenteditable]="editingId === child.id"
                                (blur)="onBlurSave(child.id, 'content', $event)"
                                (keydown.enter)="onEnter($event)"
                                class="outline-none min-w-[10px] block border border-transparent rounded whitespace-nowrap"
                                [class.cursor-text]="editingId === child.id"
                                [class.bg-black-20]="editingId === child.id"
                                [style.text-align]="child.styles.textAlign">
                                {{child.content}}
                             </span>
                           </button>
                       </div>

                       <!-- TEXT / DEFAULT -->
                       <div *ngSwitchDefault class="w-full h-full">
                           <div 
                                #editableContent
                                [attr.contenteditable]="editingId === child.id"
                                (blur)="onBlurSave(child.id, 'content', $event)"
                                class="w-full h-full flex items-center leading-relaxed outline-none border border-transparent rounded px-1 min-h-[1.5em]"
                                [style.justify-content]="getJustify(child.styles.textAlign)"
                                [style.text-align]="child.styles.textAlign"
                                [class.cursor-text]="editingId === child.id"
                                [class.border-indigo-400]="editingId === child.id"
                                [class.border-dashed]="editingId === child.id"
                                [class.bg-white-50]="editingId === child.id"
                                [class.select-none]="editingId !== child.id">
                             {{child.content}}
                           </div>
                       </div>

                     </ng-container>
                   </div>
                </div>
            </ng-container>

            <!-- Drop Zone for Empty Row -->
            <div *ngIf="getChildren(row.id).length === 0" class="w-full h-10 border border-transparent rounded flex items-center justify-center text-[10px] text-slate-300 uppercase bg-slate-50/50">
               Trống
            </div>
         </div>
      </div>

      <!-- Add New Row Trigger -->
      <div (click)="addComponentAt.emit({ type: 'container' })" class="h-10 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm active:scale-[0.99] select-none">
         <span class="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
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
  @Output() updateLabel = new EventEmitter<{id: string, label: string}>();
  @Output() addComponentAt = new EventEmitter<{type: ComponentType, parentId?: string, index?: number}>();
  @Output() moveComponent = new EventEmitter<{componentId: string, newParentId: string, newIndex: number}>();
  @Output() swapComponents = new EventEmitter<{srcId: string, targetId: string}>();
  @Output() deleteId = new EventEmitter<string>();

  @ViewChildren('editableContent') editableContents!: QueryList<ElementRef>;
  @ViewChildren('editableLabel') editableLabels!: QueryList<ElementRef>;

  dragOverRowId: string | null = null;
  dragTargetId: string | null = null;
  isDraggingId: string | null = null;
  
  editingId: string | null = null;
  editingField: 'content' | 'label' | null = null;

  trackById(index: number, item: Comp) { return item.id; }
  
  get rootComponents() { 
    return this.components.filter(c => c.parentId === null || c.type === 'container'); 
  }

  getChildren(parentId: string) {
    return this.components.filter(c => c.parentId === parentId);
  }

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
    };
  }

  onCanvasClick() {
    this.select.emit(null);
    this.stopEditing();
  }

  onSelect(e: MouseEvent, id: string) {
    e.stopPropagation();
    if (this.editingId !== id) {
       this.select.emit(id);
    }
  }

  // --- EDITING LOGIC ---

  onWrapperDblClick(e: MouseEvent, child: Comp) {
      e.stopPropagation();
      e.preventDefault();
      
      let field: 'content' | 'label' = 'content';
      if (child.type === 'input' || child.type === 'textarea') {
         field = 'label';
      }

      this.editingId = child.id;
      this.editingField = field;
      this.select.emit(child.id);

      // Focus element directly
      setTimeout(() => {
          let el: ElementRef | undefined;
          if (field === 'label') {
               el = this.editableLabels.find((_, i) => this.components.find(c => c.id === child.id)?.type === child.type);
               const nativeEl = (e.target as HTMLElement).querySelector('[contenteditable="true"]') as HTMLElement;
               if(nativeEl) nativeEl.focus();
          } else {
               const nativeEl = (e.target as HTMLElement).querySelector('[contenteditable="true"]') as HTMLElement;
               if(nativeEl) nativeEl.focus();
          }
      }, 0);
  }

  onBlurSave(id: string, field: 'content' | 'label', event: any) {
      const val = event.target.innerText; // Get text from contenteditable
      if (field === 'content') {
          this.updateContent.emit({ id, content: val });
      } else {
          this.updateLabel.emit({ id, label: val });
      }
      this.stopEditing();
  }

  onEnter(event: KeyboardEvent) {
      event.preventDefault(); // Stop new line
      (event.target as HTMLElement).blur(); // Trigger blur to save
  }

  stopEditing() {
      this.editingId = null;
      this.editingField = null;
  }

  // --- DRAG AND DROP ---

  onDragStart(e: DragEvent, child: Comp) {
    if (this.editingId === child.id) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    this.isDraggingId = child.id;
    e.dataTransfer?.setData('componentId', child.id);
    e.dataTransfer?.setData('type', child.type);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  onMainDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer?.getData('type') as ComponentType;
    if (!this.dragOverRowId && !this.dragTargetId && type && !e.dataTransfer?.getData('componentId')) {
       this.addComponentAt.emit({ type });
    }
    this.resetDragState();
  }

  onChildDragOver(e: DragEvent, targetId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (this.isDraggingId && this.isDraggingId !== targetId) {
        this.dragTargetId = targetId;
        this.dragOverRowId = null; 
    }
  }

  onChildDragLeave(e: DragEvent) {
      this.dragTargetId = null;
  }

  onChildDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    e.stopPropagation();
    const srcId = e.dataTransfer?.getData('componentId');
    if (srcId && srcId !== targetId) {
        this.swapComponents.emit({ srcId, targetId });
    }
    this.resetDragState();
  }

  onRowDragOver(e: DragEvent, rowId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dragTargetId) return;
    this.dragOverRowId = rowId;
  }

  onRowDragLeave(e: DragEvent) {
      const rowEl = e.currentTarget as HTMLElement;
      if (!rowEl.contains(e.relatedTarget as Node)) {
        this.dragOverRowId = null;
      }
  }

  onRowDrop(e: DragEvent, rowId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dragTargetId) return;

    const componentId = e.dataTransfer?.getData('componentId');
    const type = e.dataTransfer?.getData('type') as ComponentType;

    if (componentId) {
       this.moveComponent.emit({ componentId, newParentId: rowId, newIndex: 999 });
    } else if (type) {
       if (type === 'container') {
         this.addComponentAt.emit({ type }); 
       } else {
         this.addComponentAt.emit({ type, parentId: rowId, index: 999 });
       }
    }
    this.resetDragState();
  }

  resetDragState() {
      this.dragOverRowId = null;
      this.dragTargetId = null;
      this.isDraggingId = null;
  }
}
