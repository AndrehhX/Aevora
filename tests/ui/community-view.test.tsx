// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommunityView from '../../src/views/CommunityView';

describe('CommunityView', () => {
  it('labels each public announcement with the game it came from', () => {
    render(
      <CommunityView
        news={[{
          id: '1',
          appId: 570,
          gameTitle: 'Dota 2',
          title: 'Patch notes',
          url: 'https://steam.test/1',
          contents: 'Details',
          publishedAt: '2023-11-14T22:13:20.000Z',
          stale: false,
        }]}
        onPreview={vi.fn()}
      />
    );

    expect(screen.getByText(/Dota 2/)).toBeTruthy();
    expect(screen.getByText('Patch notes')).toBeTruthy();
  });
});
