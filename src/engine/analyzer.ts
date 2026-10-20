import type { ComponentNode, AnalyzerResult, AnalyzerFinding } from './types';

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return [r, g, b];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const a = hexToRgb(fg);
  const b = hexToRgb(bg);
  if (!a || !b) return null;
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function pxValue(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/^([\d.]+)px$/);
  return m ? parseFloat(m[1]) : null;
}

export function analyze(tree: ComponentNode[]): AnalyzerResult {
  const findings: AnalyzerFinding[] = [];

  function walk(node: ComponentNode) {
    const label = `${node.name} (${node.type})`;

    // Empty headings or buttons
    if ((node.type === 'heading' || node.type === 'button' || node.type === 'badge') && !node.content.trim()) {
      findings.push({
        severity: 'error',
        element: label,
        message: `Empty ${node.type} has no text content.`,
        why: 'Screen readers and users cannot determine the purpose of an empty element.',
        fix: 'Add meaningful text content.',
        fixAction: { kind: 'set-attr', nodeId: node.id, attr: 'content', value: node.type === 'button' ? 'Click me' : 'Heading' },
      });
    }

    // Missing alt text on images
    if (node.type === 'image' && (!node.props.alt || !node.props.alt.trim())) {
      findings.push({
        severity: 'error',
        element: label,
        message: 'Image is missing alternative text.',
        why: 'Alt text is essential for screen readers and when images fail to load.',
        fix: 'Add a short description of the image.',
        fixAction: { kind: 'set-attr', nodeId: node.id, attr: 'props.alt', value: 'Descriptive alternative text' },
      });
    }

    // Inputs without accessible labels
    if (node.type === 'input' && (!node.props.label || !node.props.label.trim())) {
      findings.push({
        severity: 'warning',
        element: label,
        message: 'Input field has no visible label.',
        why: 'Inputs without labels are hard to understand for assistive technology users.',
        fix: 'Provide a label for the input field.',
        fixAction: { kind: 'set-attr', nodeId: node.id, attr: 'props.label', value: 'Label' },
      });
    }

    // Low contrast between text and background
    if (node.styles.color && node.styles.backgroundColor && node.type !== 'image' && node.type !== 'divider') {
      const ratio = contrastRatio(node.styles.color, node.styles.backgroundColor);
      if (ratio !== null && ratio < 4.5) {
        findings.push({
          severity: ratio < 3 ? 'error' : 'warning',
          element: label,
          message: `Low colour contrast (${ratio.toFixed(1)}:1).`,
          why: 'WCAG AA requires at least 4.5:1 contrast for normal text so content is readable for everyone.',
          fix: 'Darken the text colour or lighten the background to reach at least 4.5:1 contrast.',
        });
      }
    }

    // Very small text
    const fs = pxValue(node.styles.fontSize);
    if (fs !== null && fs < 12 && (node.type === 'heading' || node.type === 'paragraph' || node.type === 'button' || node.type === 'badge' || node.type === 'alert')) {
      findings.push({
        severity: 'warning',
        element: label,
        message: `Font size is very small (${fs}px).`,
        why: 'Text below 12px is difficult to read, especially on small screens.',
        fix: 'Increase the font size to at least 14px.',
      });
    }

    // Fixed width causing potential mobile overflow
    const w = node.styles.width || '';
    const fixedPx = pxValue(node.styles.width);
    if (fixedPx !== null && fixedPx > 375) {
      findings.push({
        severity: 'warning',
        element: label,
        message: `Fixed width of ${fixedPx}px may overflow on mobile (375px).`,
        why: 'Content wider than the viewport forces horizontal scrolling on small devices.',
        fix: 'Use a percentage or max-width instead of a fixed pixel width.',
      });
    }

    void w;
    node.children.forEach(walk);
  }

  tree.forEach(walk);

  if (tree.length === 0) {
    findings.push({
      severity: 'suggestion',
      element: 'Canvas',
      message: 'The canvas is empty.',
      why: 'Add components to begin building your interface.',
    });
  }

  // Score: start at 100, deduct by severity, clamp to 0.
  let score = 100;
  for (const f of findings) {
    if (f.severity === 'error') score -= 20;
    else if (f.severity === 'warning') score -= 8;
    else score -= 3;
  }
  score = Math.max(0, Math.min(100, score));

  return { score, findings };
}
