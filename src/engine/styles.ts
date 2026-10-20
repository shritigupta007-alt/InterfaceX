import type { Styles, ComponentType } from './types';

const STYLE_KEYS: (keyof Styles)[] = [
  'width', 'height', 'padding', 'margin', 'backgroundColor', 'color',
  'fontSize', 'fontWeight', 'borderRadius', 'borderWidth', 'borderColor',
  'textAlign', 'display', 'flexDirection', 'justifyContent', 'alignItems',
  'gap', 'boxShadow',
];

export function stylesToCss(style: Styles): Record<string, string> {
  const css: Record<string, string> = {};
  if (style.width) css.width = style.width;
  if (style.height) css.height = style.height;
  if (style.padding) css.padding = style.padding;
  if (style.margin) css.margin = style.margin;
  if (style.backgroundColor) css['background-color'] = style.backgroundColor;
  if (style.color) css.color = style.color;
  if (style.fontSize) css['font-size'] = style.fontSize;
  if (style.fontWeight) css['font-weight'] = style.fontWeight;
  if (style.borderRadius) css['border-radius'] = style.borderRadius;
  if (style.borderWidth) css['border-width'] = style.borderWidth;
  if (style.borderColor) css['border-color'] = style.borderColor;
  if (style.textAlign) css['text-align'] = style.textAlign;
  if (style.display) css.display = style.display;
  if (style.flexDirection) css['flex-direction'] = style.flexDirection;
  if (style.justifyContent) css['justify-content'] = style.justifyContent;
  if (style.alignItems) css['align-items'] = style.alignItems;
  if (style.gap) css.gap = style.gap;
  if (style.boxShadow) css['box-shadow'] = style.boxShadow;
  return css;
}

export function styleKeys(): (keyof Styles)[] {
  return [...STYLE_KEYS];
}

export function normalizeBorder(style: Styles): void {
  if (style.borderWidth && style.borderWidth !== '0px' && (!style.borderColor || style.borderColor === 'transparent')) {
    style.borderColor = '#E5E7F0';
  }
}

export const TAG_NAMES: Record<ComponentType, string> = {
  'section': 'section',
  'container': 'div',
  'two-column': 'div',
  'heading': 'h1',
  'paragraph': 'p',
  'button': 'button',
  'image': 'img',
  'divider': 'hr',
  'badge': 'span',
  'navbar': 'nav',
  'card': 'div',
  'input': 'div',
  'form': 'form',
  'modal': 'div',
  'alert': 'div',
  'footer': 'footer',
};

export function getHeadingTag(props: Record<string, string>): string {
  const level = props.level;
  if (level && level >= '1' && level <= '6') return `h${level}`;
  return 'h1';
}
