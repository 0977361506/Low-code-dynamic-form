
export type ComponentType = 'text' | 'button' | 'image' | 'container' | 'input' | 'textarea' | 'table';

export interface ComponentStyles {
  width: number;
  height: number;
  top: number;
  left: number;
  backgroundColor: string;
  color: string;
  fontSize: number;
  borderRadius: number;
  padding: number;
  textAlign: 'left' | 'center' | 'right';
  zIndex: number;
  borderWidth: number;
  borderColor: string;
}

export type ActionTriggerType = 'none' | 'api' | 'popup' | 'navigate' | 'alert' | 'console';

export type PopupContentType = 'text' | 'json' | 'page';

export interface ActionConfig {
  type: ActionTriggerType;
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  popupTitle?: string;
  popupType?: PopupContentType; 
  message?: string;             
  popupContentJson?: string;    
  popupTargetId?: string;       
  targetUrl?: string;
  newTab?: boolean;
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  label?: string; // <-- New Property for Inputs
  content: string;
  styles: ComponentStyles;
  parentId?: string | null;
  action?: ActionConfig;
}

export interface Page {
  id: string;
  name: string;
  components: CanvasComponent[];
}

export interface AppSchema {
  pages: Page[];
  activePageId: string;
}
