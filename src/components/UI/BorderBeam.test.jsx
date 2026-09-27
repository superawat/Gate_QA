/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BorderBeam } from './BorderBeam';

describe('BorderBeam component', () => {
  it('renders without crashing with default props', () => {
    const { container } = render(<BorderBeam />);
    const outerEl = container.firstElementChild;
    expect(outerEl).toBeTruthy();
    expect(outerEl.getAttribute('aria-hidden')).toBe('true');
    expect(outerEl.classList.contains('pointer-events-none')).toBe(true);
    expect(outerEl.classList.contains('absolute')).toBe(true);
    expect(outerEl.classList.contains('inset-0')).toBe(true);
  });

  it('applies custom border radius and custom class names', () => {
    const { container } = render(
      <BorderBeam borderRadius={20} className="custom-beam-class" />
    );
    const outerEl = container.firstElementChild;
    expect(outerEl.classList.contains('custom-beam-class')).toBe(true);
    expect(outerEl.style.borderRadius).toBe('20px');
  });

  it('renders child motion div with gradient and offsetPath', () => {
    const { container } = render(
      <BorderBeam size={100} colorFrom="#ff0000" colorTo="#0000ff" borderRadius={16} />
    );
    const outerEl = container.firstElementChild;
    const motionDiv = outerEl?.firstElementChild;
    expect(motionDiv).toBeTruthy();
    expect(motionDiv.style.width).toBe('100px');
    expect(motionDiv.style.background).toContain('linear-gradient');
  });
});
