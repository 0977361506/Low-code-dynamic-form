
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

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  content: string;
  styles: ComponentStyles;
  parentId?: string | null;
}
