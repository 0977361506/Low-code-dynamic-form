
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component.ts';
import { SidebarComponent } from './components/sidebar.component.ts';
import { CanvasComponent } from './components/canvas.component.ts';
import { PropertyPanelComponent } from './components/property-panel.component.ts';
import { PreviewComponent } from './components/preview.component.ts';
import { JSONViewerComponent } from './components/json-viewer.component.ts';
import { ViewerPageComponent } from './components/viewer-page.component.ts';
import { CanvasComponent as Comp, ComponentType, ActionConfig, Page, AppSchema } from './types.ts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    SidebarComponent, 
    CanvasComponent, 
    PropertyPanelComponent, 
    PreviewComponent, 
    JSONViewerComponent,
    ViewerPageComponent
  ],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans text-sm">
      <app-navbar 
        [activeView]="currentView()"
        (changeView)="currentView.set($event)"
        (preview)="isPreview.set(true)" 
        (export)="openExport()"
      ></app-navbar>
      
      <ng-container *ngIf="currentView() === 'builder'; else viewerTpl">
        <div class="flex flex-1 overflow-hidden">
          <app-sidebar 
            (addComponent)="addFloatingComponent($event)"
          ></app-sidebar>
          
          <main class="flex-1 relative bg-[#f8fafc] overflow-auto custom-scrollbar canvas-bg">
            <app-canvas 
              [components]="components()"
              [selectedId]="selectedId()"
              (select)="handleSelect($event)"
              (updateStyles)="handleUpdateStyles($event)"
              (updateContent)="updateContentById($event.id, $event.content)"
              (updateLabel)="updateLabelById($event.id, $event.label)"
              (addComponentAt)="handleDrop($event)"
              (moveComponent)="handleMoveComponent($event)"
              (swapComponents)="handleSwapComponents($event)"
              (deleteId)="deleteComponentById($event)"
            ></app-canvas>
          </main>
          
          <app-property-panel 
            [component]="selectedComponent()" 
            [pages]="pages()"
            (updateContent)="updateContent($event)"
            (updateLabel)="updateLabel($event)"
            (updateStyles)="updateStyles(selectedId()!, $event)"
            (updateAction)="updateAction(selectedId()!, $event)"
            (delete)="deleteComponent()"
          ></app-property-panel>
        </div>
      </ng-container>

      <ng-template #viewerTpl>
        <app-viewer-page 
          [pages]="pages()"
          [initialPageId]="activePageId()"
        ></app-viewer-page>
      </ng-template>

      <app-preview 
        *ngIf="isPreview()" 
        [components]="components()" 
        [pages]="pages()"
        (close)="isPreview.set(false)"
      ></app-preview>

      <app-json-viewer 
        *ngIf="showJson()" 
        [data]="exportData" 
        (close)="showJson.set(false)"
        (load)="loadData($event)"
      ></app-json-viewer>
    </div>
  `
})
export class AppComponent {
  currentView = signal<'builder' | 'viewer'>('builder');
  
  pages = signal<Page[]>([
    { 
      id: 'page_main', 
      name: 'Main Page', 
      components: [] 
    },
    { 
      id: 'page_sample_login', 
      name: 'Sample: Login Form', 
      components: [
        {
          id: 'login_container', type: 'container', content: '', parentId: null,
          styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: '#ffffff', color: '#000', fontSize: 14, borderRadius: 24, padding: 32, textAlign: 'left', zIndex: 0, borderWidth: 16, borderColor: '#f1f5f9' },
          action: { type: 'none' }
        },
        {
          id: 'login_title', type: 'text', content: 'Chào mừng trở lại', parentId: 'login_container',
          styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: 'transparent', color: '#1e293b', fontSize: 24, borderRadius: 0, padding: 8, textAlign: 'center', zIndex: 1, borderWidth: 0, borderColor: '' },
          action: { type: 'none' }
        },
        {
          id: 'login_user', type: 'input', label: 'Địa chỉ Email', content: 'name@example.com', parentId: 'login_container',
          styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: '#ffffff', color: '#334155', fontSize: 14, borderRadius: 8, padding: 10, textAlign: 'left', zIndex: 1, borderWidth: 0, borderColor: '' },
          action: { type: 'none' }
        },
        {
          id: 'login_pass', type: 'input', label: 'Mật khẩu', content: '••••••••', parentId: 'login_container',
          styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: '#ffffff', color: '#334155', fontSize: 14, borderRadius: 8, padding: 10, textAlign: 'left', zIndex: 1, borderWidth: 0, borderColor: '' },
          action: { type: 'none' }
        },
        {
          id: 'login_btn', type: 'button', content: 'Đăng nhập', parentId: 'login_container',
          styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: '#4f46e5', color: '#fff', fontSize: 14, borderRadius: 8, padding: 0, textAlign: 'center', zIndex: 1, borderWidth: 0, borderColor: '' },
          action: { type: 'alert', message: 'Success!' }
        }
      ] 
    }
  ]);
  
  activePageId = signal<string>('page_main');

  components = computed(() => {
    return this.pages().find(p => p.id === this.activePageId())?.components || [];
  });

  selectedId = signal<string | null>(null);
  isPreview = signal(false);
  showJson = signal(false);
  exportData: any = {};

  selectedComponent = computed(() => {
    const id = this.selectedId();
    return this.components().find(c => c.id === id) || null;
  });

  updateCurrentPageComponents(newComponents: Comp[]) {
    this.pages.update(pages => pages.map(p => 
      p.id === this.activePageId() ? { ...p, components: newComponents } : p
    ));
  }

  handleSelect(id: string | null) {
    this.selectedId.set(id);
  }

  handleDrop(event: { type: ComponentType, parentId?: string, index?: number }) {
    if (event.parentId) {
      this.addComponent(event.type, event.parentId, event.index);
    } else {
      this.createRowWithComponent(event.type);
    }
  }

  handleMoveComponent(event: { componentId: string, newParentId: string, newIndex: number }) {
    const { componentId, newParentId, newIndex } = event;
    const allComponents = [...this.components()];
    
    const moveIdx = allComponents.findIndex(c => c.id === componentId);
    if (moveIdx === -1) return;
    const movingComp = { ...allComponents[moveIdx], parentId: newParentId };
    
    allComponents.splice(moveIdx, 1);
    
    const siblings = allComponents.filter(c => c.parentId === newParentId);
    
    if (newIndex >= siblings.length) {
       if (siblings.length > 0) {
           const lastSibling = siblings[siblings.length - 1];
           const lastIdx = allComponents.findIndex(c => c.id === lastSibling.id);
           allComponents.splice(lastIdx + 1, 0, movingComp);
       } else {
           allComponents.push(movingComp);
       }
    } else {
       const targetSibling = siblings[newIndex];
       const targetIdx = allComponents.findIndex(c => c.id === targetSibling.id);
       allComponents.splice(targetIdx, 0, movingComp);
    }
    
    this.updateCurrentPageComponents(allComponents);
    this.selectedId.set(componentId);
  }

  handleSwapComponents(event: { srcId: string, targetId: string }) {
    const { srcId, targetId } = event;
    const allComponents = [...this.components()];
    
    const idx1 = allComponents.findIndex(c => c.id === srcId);
    const idx2 = allComponents.findIndex(c => c.id === targetId);
    
    if (idx1 === -1 || idx2 === -1) return;
    
    // Swap positions in the array to change order
    // We also need to swap their parentIds to actually swap their logical location if they are in different containers
    // But typically drag-swap implies they might change parents too.
    
    const comp1 = allComponents[idx1];
    const comp2 = allComponents[idx2];
    
    // Swap Parent IDs to maintain hierarchy correctness if swapping across containers
    const tempParent = comp1.parentId;
    comp1.parentId = comp2.parentId;
    comp2.parentId = tempParent;

    // Swap position in array
    allComponents[idx1] = comp2;
    allComponents[idx2] = comp1;
    
    this.updateCurrentPageComponents(allComponents);
    this.selectedId.set(srcId);
  }

  addFloatingComponent(type: ComponentType) {
    this.createRowWithComponent(type);
  }

  createRowWithComponent(childType: ComponentType) {
    const rowId = crypto.randomUUID();
    const row: Comp = {
      id: rowId, type: 'container', content: '', parentId: null,
      styles: { width: 100, height: 0, top: 0, left: 0, backgroundColor: '#ffffff', color: '#000000', fontSize: 14, borderRadius: 12, padding: 16, textAlign: 'left', zIndex: 0, borderWidth: 8, borderColor: '#e2e8f0' },
      action: { type: 'none' }
    };

    if (childType === 'container') {
       this.updateCurrentPageComponents([...this.components(), row]);
       this.selectedId.set(rowId);
       return;
    }

    const childId = crypto.randomUUID();
    const child = this.createBaseComponent(childId, childType, rowId);
    
    this.updateCurrentPageComponents([...this.components(), row, child]);
    this.selectedId.set(childId);
  }

  addComponent(type: ComponentType, parentId: string, index?: number) {
    const id = crypto.randomUUID();
    const newComp = this.createBaseComponent(id, type, parentId);
    
    const currentComps = [...this.components()];
    
    if (typeof index === 'number') {
        const siblings = currentComps.filter(c => c.parentId === parentId);
        
        if (index >= siblings.length) {
            if (siblings.length > 0) {
                 const lastSibling = siblings[siblings.length - 1];
                 const lastSiblingIndex = currentComps.findIndex(c => c.id === lastSibling.id);
                 currentComps.splice(lastSiblingIndex + 1, 0, newComp);
            } else {
                 currentComps.push(newComp);
            }
        } else {
            const targetSibling = siblings[index];
            const targetIndex = currentComps.findIndex(c => c.id === targetSibling.id);
            currentComps.splice(targetIndex, 0, newComp);
        }
    } else {
        currentComps.push(newComp);
    }

    this.updateCurrentPageComponents(currentComps);
    this.selectedId.set(id);
  }

  createBaseComponent(id: string, type: ComponentType, parentId: string | null): Comp {
    let content = 'Text Content';
    let label = ''; // Default Label
    let w = 25; 
    let bgColor = 'transparent';
    let color = '#334155';
    let padding = 0;
    let borderRadius = 6;
    let fontSize = 14;
    let textAlign: 'left' | 'center' | 'right' = 'left'; // Default Alignment
    let action: ActionConfig = { type: 'none' };
    
    if (type === 'button') { 
      content = 'Button'; 
      bgColor = '#6366f1'; 
      color = '#ffffff'; 
      w = 20; 
      borderRadius = 6;
      textAlign = 'center'; // Button Default Center
    }
    else if (type === 'image') { 
      content = 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&auto=format&fit=crop'; 
      w = 25; 
      borderRadius = 8; 
    }
    else if (type === 'input') { 
      content = 'Placeholder...';
      label = 'Label Name'; 
      bgColor = '#ffffff'; 
      w = 50; 
      borderRadius = 6;
    }
    else if (type === 'textarea') { 
      content = 'Type here...'; 
      label = 'Description';
      bgColor = '#ffffff'; 
      w = 100; 
      borderRadius = 6;
    }
    else if (type === 'table') { 
      content = 'ID,Name,Status|1,Item A,Active|2,Item B,Inactive'; 
      w = 100; 
      bgColor = '#ffffff'; 
      borderRadius = 8;
    }
    else if (type === 'text') { 
      content = 'Headline Text'; 
      w = 100; 
      fontSize = 20; 
      color = '#0f172a'; 
      padding = 0;
    }

    return {
      id, type, content, label, parentId,
      styles: { width: w, height: 0, top: 0, left: 0, backgroundColor: bgColor, color, fontSize, borderRadius, padding, textAlign: textAlign, zIndex: 1, borderWidth: 0, borderColor: '#cbd5e1' },
      action
    };
  }

  handleUpdateStyles(event: {id: string, styles: Partial<Comp['styles']>}) {
    this.updateStyles(event.id, event.styles);
  }

  updateContent(content: string) {
    if (!this.selectedId()) return;
    this.updateContentById(this.selectedId()!, content);
  }
  
  updateLabel(label: string) {
    if (!this.selectedId()) return;
    this.updateLabelById(this.selectedId()!, label);
  }

  updateContentById(id: string, content: string) {
    const updated = this.components().map(c => c.id === id ? { ...c, content } : c);
    this.updateCurrentPageComponents(updated);
  }
  
  updateLabelById(id: string, label: string) {
    const updated = this.components().map(c => c.id === id ? { ...c, label } : c);
    this.updateCurrentPageComponents(updated);
  }

  updateStyles(id: string, styleUpdates: Partial<Comp['styles']>) {
    const updated = this.components().map(c => c.id === id ? { ...c, styles: { ...c.styles, ...styleUpdates } } : c);
    this.updateCurrentPageComponents(updated);
  }

  updateAction(id: string, actionUpdate: ActionConfig) {
    const updated = this.components().map(c => c.id === id ? { ...c, action: actionUpdate } : c);
    this.updateCurrentPageComponents(updated);
  }

  deleteComponent() {
    if (!this.selectedId()) return;
    this.deleteComponentById(this.selectedId()!);
  }

  deleteComponentById(id: string) {
    const updated = this.components().filter(c => c.id !== id && c.parentId !== id);
    this.updateCurrentPageComponents(updated);
    this.selectedId.set(null);
  }

  openExport() {
    this.exportData = {
      pages: this.pages(),
      activePageId: this.activePageId()
    } as AppSchema;
    this.showJson.set(true);
  }

  loadData(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) {
        this.pages.set([{ id: 'root', name: 'Home', components: data }]);
        this.activePageId.set('root');
      } else if (data.pages && Array.isArray(data.pages)) {
        this.pages.set(data.pages);
        this.activePageId.set(data.activePageId || data.pages[0]?.id || '');
      } else {
        throw new Error('JSON format invalid');
      }
      this.selectedId.set(null);
      this.showJson.set(false);
    } catch (e) { alert('Invalid JSON: ' + (e as Error).message); }
  }
}
