// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StoreView from '../../src/views/StoreView';
import type { SteamStoreCategories } from '../../src/integrations/steam/steamStore';

const offers: SteamStoreCategories = {
  featured: [{ appId: 570, name: 'Dota 2', capsuleImage: 'https://cdn.test/dota.jpg', storeUrl: 'https://store.steampowered.com/app/570/', price: 'Free', category: 'featured' }],
  topSellers: [{ appId: 730, name: 'Counter-Strike 2', capsuleImage: 'https://cdn.test/cs2.jpg', storeUrl: 'https://store.steampowered.com/app/730/', price: '$0.00', category: 'top-sellers' }],
  specials: [{ appId: 440, name: 'Team Fortress 2', capsuleImage: 'https://cdn.test/tf2.jpg', storeUrl: 'https://store.steampowered.com/app/440/', price: '$1.99', originalPrice: '$7.99', discountPercent: 75, category: 'specials' }],
  stale: false,
};

describe('StoreView', () => {
  it('renders real offer rows and sends the Steam store URL on selection', () => {
    const onOpenStore = vi.fn();
    render(<StoreView offers={offers} selectedAppId={730} loading={false} onOpenStore={onOpenStore} />);

    expect(screen.getByText('Dota 2')).toBeTruthy();
    expect(screen.getByText('75% off')).toBeTruthy();
    expect(screen.getByText('$1.99')).toBeTruthy();
    screen.getByRole('button', { name: /Team Fortress 2/i }).click();
    expect(onOpenStore).toHaveBeenCalledWith(offers.specials[0]);
  });

  it('explains an empty live store instead of showing fake cards', () => {
    render(<StoreView offers={{ featured: [], topSellers: [], specials: [], stale: false }} selectedAppId={null} loading={false} onOpenStore={() => undefined} />);
    expect(screen.getByText(/Steam no devolvió ofertas/i)).toBeTruthy();
  });
});
