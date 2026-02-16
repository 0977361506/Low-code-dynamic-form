
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component.ts';
import { SidebarComponent } from './components/sidebar.component.ts';
import { CanvasComponent } from './components/canvas.component.ts';
import { PropertyPanelComponent } from './components/property-panel.component.ts';
import { PreviewComponent } from './components/preview.component.ts';
import { JSONViewerComponent } from './components/json-viewer.component.ts';
import { ViewerPageComponent } from './components/viewer-page.component.ts';
import { CanvasComponent as Comp, ComponentType } from './types.ts';

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
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <app-navbar 
        [activeView]="currentView()"
        (changeView)="currentView.set($event)"
        (preview)="isPreview.set(true)" 
        (export)="showJson.set(true)"
      ></app-navbar>
      
      <ng-container *ngIf="currentView() === 'builder'; else viewerTpl">
        <div class="flex flex-1 overflow-hidden">
          <app-sidebar (addComponent)="addFloatingComponent($event)"></app-sidebar>
          
          <main class="flex-1 relative bg-[#f0f2f5] overflow-auto custom-scrollbar canvas-bg">
            <app-canvas 
              [components]="components()"
              [selectedId]="selectedId()"
              (select)="handleSelect($event)"
              (updateStyles)="handleUpdateStyles($event)"
              (updateContent)="updateContentById($event.id, $event.content)"
              (addComponentAt)="handleDrop($event)"
              (deleteId)="deleteComponentById($event)"
            ></app-canvas>
          </main>
          
          <app-property-panel 
            [component]="selectedComponent()" 
            (updateContent)="updateContent($event)"
            (updateStyles)="updateStyles(selectedId()!, $event)"
            (delete)="deleteComponent()"
          ></app-property-panel>
        </div>
      </ng-container>

      <ng-template #viewerTpl>
        <app-viewer-page 
          [initialData]="components()" 
          (onUpdateData)="handleViewerUpdate($event)"
        ></app-viewer-page>
      </ng-template>

      <app-preview 
        *ngIf="isPreview()" 
        [components]="components()" 
        (close)="isPreview.set(false)"
      ></app-preview>

      <app-json-viewer 
        *ngIf="showJson()" 
        [data]="components()" 
        (close)="showJson.set(false)"
        (load)="loadData($event)"
      ></app-json-viewer>
    </div>
  `
})
export class AppComponent {
  currentView = signal<'builder' | 'viewer'>('builder');
  components = signal<Comp[]>([]);
  selectedId = signal<string | null>(null);
  isPreview = signal(false);
  showJson = signal(false);

  selectedComponent = computed(() => {
    const id = this.selectedId();
    return this.components().find(c => c.id === id) || null;
  });

  handleSelect(id: string | null) {
    this.selectedId.set(id);
  }

  handleViewerUpdate(newData: Comp[]) {
    this.components.set(newData);
  }

  handleDrop(event: { type: ComponentType, parentId?: string }) {
    if (event.parentId) {
      this.addComponent(event.type, event.parentId);
    } else {
      this.createRowWithComponent(event.type);
    }
  }

  addFloatingComponent(type: ComponentType) {
    this.createRowWithComponent(type);
  }

  createRowWithComponent(childType: ComponentType) {
    const rowId = crypto.randomUUID();
    // Row mặc định: Nền trắng, bo góc nhẹ, padding vừa phải
    const row: Comp = {
      id: rowId,
      type: 'container',
      content: '',
      parentId: null,
      styles: {
        width: 100, height: 0, top: 0, left: 0,
        backgroundColor: '#ffffff', color: '#000000',
        fontSize: 16, borderRadius: 8, padding: 16,
        textAlign: 'left', zIndex: 0, borderWidth: 16, borderColor: '#e2e8f0' // borderWidth dùng làm Gap
      }
    };

    const childId = crypto.randomUUID();
    const child = this.createBaseComponent(childId, childType, rowId);

    this.components.update(prev => [...prev, row, child]);
    this.selectedId.set(childId);
  }

  addComponent(type: ComponentType, parentId: string) {
    const id = crypto.randomUUID();
    const newComp = this.createBaseComponent(id, type, parentId);
    this.components.update(prev => [...prev, newComp]);
    this.selectedId.set(id);
  }

  createBaseComponent(id: string, type: ComponentType, parentId: string | null): Comp {
    let content = 'Nội dung';
    let w = 25; // Default 1/4 col
    let bgColor = 'transparent';
    let color = '#334155';
    let padding = 0;
    let borderRadius = 4;
    
    if (type === 'button') { 
      content = 'Gửi thông tin'; 
      bgColor = '#4f46e5'; 
      color = '#ffffff'; 
      padding = 0; 
      borderRadius = 8;
      w = 25; 
    }
    else if (type === 'image') { content = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'; w = 25; borderRadius = 8; }
    else if (type === 'input') { content = 'Họ và tên...'; bgColor = '#ffffff'; w = 50; borderRadius = 6; }
    else if (type === 'textarea') { content = 'Ghi chú thêm...'; bgColor = '#ffffff'; w = 100; borderRadius = 6; }
    else if (type === 'table') { content = 'ID,Sản phẩm,Giá|1,iPhone 15,20tr|2,Samsung S24,18tr'; w = 100; bgColor = '#ffffff'; }
    else if (type === 'text') { content = 'Tiêu đề Form'; w = 100; padding = 0; color = '#0f172a'; }

    return {
      id, type, content, parentId,
      styles: {
        width: w, height: 0, top: 0, left: 0,
        backgroundColor: bgColor, color,
        fontSize: 14, borderRadius, padding, 
        textAlign: 'left', zIndex: 1,
        borderWidth: 0, 
        borderColor: '#cbd5e1'
      }
    };
  }

  handleUpdateStyles(event: {id: string, styles: Partial<Comp['styles']>}) {
    this.updateStyles(event.id, event.styles);
  }

  updateContent(content: string) {
    if (!this.selectedId()) return;
    this.updateContentById(this.selectedId()!, content);
  }

  updateContentById(id: string, content: string) {
    this.components.update(prev => prev.map(c => c.id === id ? { ...c, content } : c));
  }

  updateStyles(id: string, styleUpdates: Partial<Comp['styles']>) {
    this.components.update(prev => prev.map(c => c.id === id ? { ...c, styles: { ...c.styles, ...styleUpdates } } : c));
  }

  deleteComponent() {
    if (!this.selectedId()) return;
    this.deleteComponentById(this.selectedId()!);
  }

  deleteComponentById(id: string) {
    this.components.update(prev => prev.filter(c => c.id !== id && c.parentId !== id));
    this.selectedId.set(null);
  }

  loadData(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) { this.components.set(data); this.selectedId.set(null); this.showJson.set(false); }
    } catch (e) { alert('JSON không hợp lệ!'); }
  }
}
