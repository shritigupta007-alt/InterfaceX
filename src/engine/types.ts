// Core data model for InterfaceX editor state.

export type ComponentCategory = 'layout' | 'basic' | 'ui';

export type ComponentType =
  | 'section'
  | 'container'
  | 'two-column'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'divider'
  | 'badge'
  | 'navbar'
  | 'card'
  | 'input'
  | 'form'
  | 'modal'
  | 'alert'
  | 'footer';

export interface Styles {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  display?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  boxShadow?: string;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  name: string;
  content: string;
  props: Record<string, string>;
  styles: Styles;
  children: ComponentNode[];
}

export interface Project {
  id: string;
  name: string;
  tree: ComponentNode[];
  createdAt: number;
  updatedAt: number;
}

export interface AnalyzerFinding {
  severity: 'error' | 'warning' | 'suggestion';
  element: string;
  message: string;
  why: string;
  fix?: string;
  fixAction?: { kind: 'set-attr'; nodeId: string; attr: string; value: string };
}

export interface AnalyzerResult {
  score: number;
  findings: AnalyzerFinding[];
}

export const FONT_WEIGHTS = [
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
] as const;
