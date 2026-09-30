// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LibrarySearch from '../../src/components/LibrarySearch';
import TopNavigation from '../../src/components/TopNavigation';

describe('Aevora layout contracts', () => {
  it('keeps the library search and section navigation in stable layout regions', () => {
    render(
      <div data-aevora-layout="content">
        <LibrarySearch value="" onChange={vi.fn()} />
        <TopNavigation
          activeNav="Store"
          setActiveNav={vi.fn()}
          globalQuery=""
          setGlobalQuery={vi.fn()}
          library={[]}
          favorites={[]}
          theme="aevora"
          profileName="Andreh"
          onCycleTheme={vi.fn()}
          onSelectGame={vi.fn()}
          onOpenSettings={vi.fn()}
          onOpenProfile={vi.fn()}
          onOpenSignOut={vi.fn()}
          closeSignal={null}
        />
      </div>
    );

    expect(screen.getByLabelText('Search library')).toBeTruthy();
    expect(screen.getByLabelText('Global search')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Store' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('aevora-layout-library-search')).toBeTruthy();
    expect(screen.getByTestId('aevora-layout-top-navigation')).toBeTruthy();
  });
});
