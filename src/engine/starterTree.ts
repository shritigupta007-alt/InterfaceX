import type { ComponentNode } from './types';
import { createNode } from './componentLibrary';

// A realistic starter interface so the canvas looks like a real site on first open.
export function createStarterTree(): ComponentNode[] {
  const navbar = createNode('navbar');
  navbar.content = 'InterfaceX';
  navbar.props = { links: 'Features, How It Works, Components' };

  const heroHeading = createNode('heading');
  heroHeading.content = 'Design it. Understand it. Build it.';
  heroHeading.styles.fontSize = '40px';

  const heroParagraph = createNode('paragraph');
  heroParagraph.content =
    'Your interactive playground for building frontend interfaces. Experiment with components, explore responsive layouts, and turn visual designs into real HTML and CSS.';

  const primaryBtn = createNode('button');
  primaryBtn.content = 'Get Started';

  const secondaryBtn = createNode('button');
  secondaryBtn.content = 'Learn More';
  secondaryBtn.props = { variant: 'secondary', href: '' };
  secondaryBtn.styles = {
    ...secondaryBtn.styles,
    backgroundColor: '#FFFFFF',
    color: '#7657FF',
    borderWidth: '1px',
    borderColor: '#7657FF',
  };

  const heroSection = createNode('section');
  heroSection.name = 'Hero';
  heroSection.styles = {
    padding: '64px 24px',
    backgroundColor: '#F8F9FC',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'flex-start',
    width: '100%',
  };
  heroSection.children = [heroHeading, heroParagraph, primaryBtn, secondaryBtn];

  const card1 = createNode('card');
  card1.content = 'Visual Builder';
  card1.props = { body: 'Assemble interfaces from reusable elements.' };

  const card2 = createNode('card');
  card2.content = 'Live Preview';
  card2.props = { body: 'See changes update instantly as you customize.' };

  const card3 = createNode('card');
  card3.content = 'Export Code';
  card3.props = { body: 'Copy or download clean HTML and CSS.' };

  const cardsRow = createNode('section');
  cardsRow.name = 'Features';
  cardsRow.styles = {
    padding: '48px 24px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    width: '100%',
    alignItems: 'stretch',
  };
  cardsRow.children = [card1, card2, card3];

  const footer = createNode('footer');
  footer.content = 'InterfaceX';
  footer.props = { subtitle: 'A college project for Web Designing Lab.' };

  return [navbar, heroSection, cardsRow, footer];
}
