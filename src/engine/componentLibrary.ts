import type { ComponentType, Styles, ComponentCategory } from './types';
import {
  Layout, Box, Columns, Heading, Pilcrow, MousePointerClick,
  Image as ImageIcon, Minus, Tag, Menu, CreditCard, TextCursorInput,
  FormInput, Square, TriangleAlert, PanelBottom,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  category: ComponentCategory;
  icon: LucideIcon;
  description: string;
  default: () => {
    name: string;
    content: string;
    props: Record<string, string>;
    styles: Styles;
  };
}

let counter = 0;
export function uid(prefix = 'n'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

const base: Styles = {};

function def(
  type: ComponentType,
  name: string,
  category: ComponentCategory,
  icon: LucideIcon,
  description: string,
  factory: () => { name: string; content: string; props: Record<string, string>; styles: Styles }
): ComponentDefinition {
  return { type, name, category, icon, description, default: factory };
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  def('section', 'Section', 'layout', Layout, 'A full-width page section', () => ({
    name: 'Section',
    content: '',
    props: {},
    styles: { padding: '48px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  })),
  def('container', 'Container', 'layout', Box, 'A centered content container', () => ({
    name: 'Container',
    content: '',
    props: { maxWidth: '1100px' },
    styles: { padding: '24px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  })),
  def('two-column', 'Two-Column Layout', 'layout', Columns, 'Two side-by-side columns', () => ({
    name: 'Two-Column Layout',
    content: '',
    props: {},
    styles: { padding: '24px', gap: '24px', display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'stretch' },
  })),
  def('heading', 'Heading', 'basic', Heading, 'A section heading', () => ({
    name: 'Heading',
    content: 'Build something great',
    props: { level: '1' },
    styles: { fontSize: '36px', fontWeight: '700', color: '#17182B', margin: '0px' },
  })),
  def('paragraph', 'Paragraph', 'basic', Pilcrow, 'A block of body text', () => ({
    name: 'Paragraph',
    content: 'A short description that supports your heading and guides visitors toward action.',
    props: {},
    styles: { fontSize: '16px', fontWeight: '400', color: '#4A4B66', margin: '0px' },
  })),
  def('button', 'Button', 'basic', MousePointerClick, 'A clickable button', () => ({
    name: 'Button',
    content: 'Get Started',
    props: { variant: 'primary', href: '' },
    styles: { padding: '12px 24px', backgroundColor: '#7657FF', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', borderRadius: '10px', borderWidth: '0px', borderColor: 'transparent' },
  })),
  def('image', 'Image', 'basic', ImageIcon, 'An image with alt text', () => ({
    name: 'Image',
    content: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    props: { alt: 'Descriptive alternative text' },
    styles: { width: '100%', height: 'auto', borderRadius: '12px', borderWidth: '0px', borderColor: 'transparent' },
  })),
  def('divider', 'Divider', 'basic', Minus, 'A horizontal divider line', () => ({
    name: 'Divider',
    content: '',
    props: {},
    styles: { height: '1px', backgroundColor: '#E5E7F0', width: '100%', margin: '0px' },
  })),
  def('badge', 'Badge', 'basic', Tag, 'A small status label', () => ({
    name: 'Badge',
    content: 'New',
    props: {},
    styles: { padding: '4px 12px', backgroundColor: '#EEEBFF', color: '#7657FF', fontSize: '12px', fontWeight: '600', borderRadius: '999px', borderWidth: '0px', borderColor: 'transparent' },
  })),
  def('navbar', 'Navbar', 'ui', Menu, 'A site navigation bar', () => ({
    name: 'Navbar',
    content: 'InterfaceX',
    props: { links: 'Features, How It Works, Components' },
    styles: { padding: '16px 24px', backgroundColor: '#FFFFFF', color: '#17182B', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottomWidth: '1px', borderColor: '#E5E7F0' },
  })),
  def('card', 'Card', 'ui', CreditCard, 'A content card', () => ({
    name: 'Card',
    content: 'Card title',
    props: { body: 'Card description text goes here.' },
    styles: { padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px', borderWidth: '1px', borderColor: '#E5E7F0', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
  })),
  def('input', 'Input', 'ui', TextCursorInput, 'A labeled text input', () => ({
    name: 'Input',
    content: '',
    props: { label: 'Email', placeholder: 'you@example.com', inputType: 'text', name: 'email' },
    styles: { width: '100%', padding: '0px' },
  })),
  def('form', 'Form', 'ui', FormInput, 'A simple contact form', () => ({
    name: 'Form',
    content: '',
    props: { title: 'Contact Us', buttonLabel: 'Send Message' },
    styles: { padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '16px', borderWidth: '1px', borderColor: '#E5E7F0', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  })),
  def('modal', 'Modal', 'ui', Square, 'A centered modal dialog', () => ({
    name: 'Modal',
    content: 'Modal Title',
    props: { body: 'Modal description text.' },
    styles: { padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '16px', borderWidth: '1px', borderColor: '#E5E7F0', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxShadow: '0 20px 50px rgba(23,24,43,0.15)', alignItems: 'center' },
  })),
  def('alert', 'Alert', 'ui', TriangleAlert, 'A highlighted alert message', () => ({
    name: 'Alert',
    content: 'This is an alert message.',
    props: { variant: 'info' },
    styles: { padding: '12px 16px', backgroundColor: '#EEEBFF', color: '#4A4B66', borderRadius: '10px', fontSize: '14px', fontWeight: '500', width: '100%', borderWidth: '0px', borderColor: 'transparent' },
  })),
  def('footer', 'Footer', 'ui', PanelBottom, 'A page footer', () => ({
    name: 'Footer',
    content: 'InterfaceX',
    props: { subtitle: 'A college project for Web Designing Lab.' },
    styles: { padding: '32px 24px', backgroundColor: '#17182B', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' },
  })),
];

export function getDefinition(type: ComponentType): ComponentDefinition {
  const d = COMPONENT_LIBRARY.find((c) => c.type === type);
  if (!d) throw new Error(`Unknown component type: ${type}`);
  return d;
}

export function createNode(type: ComponentType): import('./types').ComponentNode {
  const d = getDefinition(type);
  const data = d.default();
  return {
    id: uid(type),
    type,
    name: data.name,
    content: data.content,
    props: data.props,
    styles: data.styles,
    children: [],
  };
}

export const CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: 'layout', label: 'Layout' },
  { id: 'basic', label: 'Basic' },
  { id: 'ui', label: 'UI Components' },
];
