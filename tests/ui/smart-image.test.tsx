// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getImageCandidates } from '../../src/components/imageSources';
import { SmartImage } from '../../src/components/SmartImage';

describe('SmartImage', () => {
  it('returns unique non-empty sources in priority order', () => {
    expect(getImageCandidates('primary.jpg', 'fallback.jpg', 'primary.jpg')).toEqual(['primary.jpg', 'fallback.jpg']);
    expect(getImageCandidates('', 'fallback.jpg', '')).toEqual(['fallback.jpg']);
  });

  it('advances through fallbacks and ends on a stable placeholder', () => {
    render(<SmartImage src="primary.jpg" fallback="fallback.jpg" fallback2="last.jpg" alt="Borderlands 2" />);

    let image = screen.getByAltText('Borderlands 2') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('primary.jpg');

    fireEvent.error(image);
    image = screen.getByAltText('Borderlands 2') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('fallback.jpg');

    fireEvent.error(image);
    image = screen.getByAltText('Borderlands 2') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('last.jpg');

    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Borderlands 2' }).tagName).toBe('DIV');
  });
});
