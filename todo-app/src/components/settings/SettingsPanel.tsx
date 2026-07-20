import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { useToast } from '@/components/common/Toast';
import type { ThemeMode, FontSize, ViewMode } from '@/types/settings';
import { exportToJSON, exportToCSV } from '@/services/exportService';
import { taskService } from '@/services/taskService';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '@/utils/logger';

export function SettingsPanel() {
  const isOpen = useUIStore((s) => s.isSettingsOpen);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const activeView = useUIStore((s) => s.activeView);
  const { settings, updateSetting } = useSettingsStore();
  const { addToast } = useToast();

  const handleExportJSON = async () => {
    try {
      await exportToJSON();
      addToast('Exported tasks to JSON', 'success');
    } catch (err) {
      logger.error('JSON export failed:', err);
      addToast('Export failed', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV();
      addToast('Exported tasks to CSV', 'success');
    } catch (err) {
      logger.error('CSV export failed:', err);
      addToast('Export failed', 'error');
    }
  };

  const handleImport = async () => {
    try {
      const selected = await import('@tauri-apps/plugin-dialog').then((m) =>
        m.open({
          multiple: false,
          filters: [{ name: 'JSON', extensions: ['json'] }],
        })
      );
      if (typeof selected === 'string') {
        const text = await import('@tauri-apps/plugin-fs').then((m) =>
          m.readTextFile(selected)
        );
        const data = JSON.parse(text);
        await taskService.importTasks(data);
        addToast('Imported tasks successfully', 'success');
        // Reload tasks into the store.
        const { useTaskStore } = await import('@/store/taskStore');
        await useTaskStore.getState().loadTasks();
      }
    } catch (err) {
      logger.error('Import failed:', err);
      addToast('Import failed', 'error');
    }
  };

  const handleOpacityChange = (value: number) => {
    const opacity = value / 100;
    updateSetting('opacity', opacity);
    void invoke('set_window_alpha', { alpha: opacity }).catch((err) =>
      logger.warn('set_window_alpha failed:', err)
    );
  };

  const handleAlwaysOnTop = async (checked: boolean) => {
    updateSetting('always_on_top', checked);
    try {
      await invoke('toggle_always_on_top');
    } catch (err) {
      logger.warn('toggle_always_on_top failed:', err);
    }
  };

  const handleDesktopMode = async (checked: boolean) => {
    updateSetting('desktop_mode', checked);
    try {
      await invoke('set_desktop_mode', { enabled: checked });
    } catch (err) {
      logger.warn('set_desktop_mode failed:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
          />
          <motion.div
            className="settings-panel"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <GlassPanel className="settings-content" blur={48}>
              <div className="settings-header">
                <h2>Settings</h2>
                <button className="settings-close" onClick={toggleSettings}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="settings-body">
                <div className="settings-section">
                  <h3>View</h3>
                  <div className="settings-options">
                    {(['kanban', 'calendar', 'timeline', 'heatmap'] as ViewMode[]).map((view) => (
                      <button
                        key={view}
                        className={`settings-option ${activeView === view ? 'active' : ''}`}
                        onClick={() => setActiveView(view)}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Theme</h3>
                  <div className="settings-options">
                    {(['light', 'dark', 'system', 'glass'] as ThemeMode[]).map((theme) => (
                      <button
                        key={theme}
                        className={`settings-option ${settings.theme === theme ? 'active' : ''}`}
                        onClick={() => updateSetting('theme', theme)}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="settings-section">
                    <h3>Window</h3>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.always_on_top}
                        onChange={(e) => handleAlwaysOnTop(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                      <span>Always on Top</span>
                    </label>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.desktop_mode}
                        onChange={(e) => handleDesktopMode(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                      <span>Desktop Mode</span>
                    </label>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.auto_launch}
                        onChange={(e) => updateSetting('auto_launch', e.target.checked)}
                      />
                      <span className="toggle-slider" />
                      <span>Auto Launch</span>
                    </label>
                  </div>

                <div className="settings-section">
                  <h3>Appearance</h3>
                  <div className="settings-slider">
                    <label>Opacity: {Math.round(settings.opacity * 100)}%</label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={Math.round(settings.opacity * 100)}
                      onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="settings-slider">
                    <label>Glass Intensity: {Math.round(settings.glass_intensity * 100)}%</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={Math.round(settings.glass_intensity * 100)}
                      onChange={(e) => updateSetting('glass_intensity', parseInt(e.target.value) / 100)}
                    />
                  </div>
                  <div className="settings-field">
                    <label>Accent Color</label>
                    <input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                    />
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications_enabled}
                      onChange={(e) => updateSetting('notifications_enabled', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                    <span>Notifications</span>
                  </label>
                </div>

                <div className="settings-section">
                  <h3>Font Size</h3>
                  <div className="settings-options">
                    {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                      <button
                        key={size}
                        className={`settings-option ${settings.font_size === size ? 'active' : ''}`}
                        onClick={() => updateSetting('font_size', size)}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Data</h3>
                  <div className="settings-options">
                    <button className="settings-option" onClick={handleExportJSON}>
                      Export JSON
                    </button>
                    <button className="settings-option" onClick={handleExportCSV}>
                      Export CSV
                    </button>
                    <button className="settings-option" onClick={handleImport}>
                      Import
                    </button>
                  </div>
                  <p className="settings-hint">
                    Backups are saved locally as JSON. Importing merges tasks by id.
                  </p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
