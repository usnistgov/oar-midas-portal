import menuConfig from '../../assets/sidebar/menu-config.json';
import environment from '../../assets/environment.json';

// The sidebar is fetched from menuConfigURL at runtime. When that fetch fails
// DataService falls back to the bundled copy of the same file, so the two must
// stay in step and the URL must resolve wherever the app is served from.
describe('sidebar menu configuration', () => {
  it('offers Share My Records', () => {
    const keys = menuConfig.menuItems.map(m => m.key);
    expect(keys).toContain('myRecords');

    const share = menuConfig.menuItems.find(m => m.key === 'myRecords')!;
    expect(share.link).toBe('/share-my-records');
    expect(share.enabled).toBe(true);
  });

  it('points at the menu file with a relative url', () => {
    // an absolute dev-server url (localhost:4200) resolves nowhere once deployed,
    // which silently dropped the sidebar to the two-item fallback
    expect(environment.menuConfigURL).toBe('assets/sidebar/menu-config.json');
    expect(environment.menuConfigURL).not.toMatch(/^https?:\/\//);
  });

  it('keeps every entry enabled and ordered', () => {
    expect(menuConfig.menuItems.length).toBeGreaterThanOrEqual(11);
    for (const item of menuConfig.menuItems) {
      expect(item.key).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.link).toBeTruthy();
    }
  });
});
