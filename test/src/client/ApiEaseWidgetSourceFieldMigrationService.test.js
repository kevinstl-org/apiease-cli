import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const serviceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseWidgetSourceFieldMigrationService.js'),
).href;

describe('ApiEaseWidgetSourceFieldMigrationService', () => {
  describe('migrateWidgetSourceFields', () => {
    it('should migrate legacy widget source fields to canonical source fields', async () => {
      // Arrange
      const { ApiEaseWidgetSourceFieldMigrationService } = await import(serviceModuleUrl);
      const apiEaseWidgetSourceFieldMigrationService = new ApiEaseWidgetSourceFieldMigrationService();
      const widgetDefinition = {
        id: 'server-owned-id',
        widgetId: 'legacy-server-owned-id',
        widgetHandle: 'promo-banner',
        widgetName: 'Promo Banner',
        liquid: '<section>Promo</section>',
        javascript: 'console.log("promo");',
      };

      // Act
      const result = apiEaseWidgetSourceFieldMigrationService.migrateWidgetSourceFields(widgetDefinition);

      // Assert
      assert.deepEqual(result, {
        ok: true,
        widgetDefinition: {
          handle: 'promo-banner',
          name: 'Promo Banner',
          liquid: '<section>Promo</section>',
          javascript: 'console.log("promo");',
        },
      });
    });

    it('should infer a missing handle from the widget display name', async () => {
      // Arrange
      const { ApiEaseWidgetSourceFieldMigrationService } = await import(serviceModuleUrl);
      const apiEaseWidgetSourceFieldMigrationService = new ApiEaseWidgetSourceFieldMigrationService();
      const widgetDefinition = {
        widgetName: 'Promo Banner',
        liquid: '<section>Promo</section>',
      };

      // Act
      const result = apiEaseWidgetSourceFieldMigrationService.migrateWidgetSourceFields(widgetDefinition);

      // Assert
      assert.equal(result.ok, true);
      assert.equal(result.widgetDefinition.handle, 'promo-banner');
      assert.equal(result.widgetDefinition.name, 'Promo Banner');
    });

    it('should fail when a widget handle cannot be inferred', async () => {
      // Arrange
      const { ApiEaseWidgetSourceFieldMigrationService } = await import(serviceModuleUrl);
      const apiEaseWidgetSourceFieldMigrationService = new ApiEaseWidgetSourceFieldMigrationService();
      const widgetDefinition = {
        widgetName: '!!!',
        liquid: '<section>Promo</section>',
      };

      // Act
      const result = apiEaseWidgetSourceFieldMigrationService.migrateWidgetSourceFields(widgetDefinition);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_WIDGET_HANDLE_NOT_INFERRED',
        message: 'Widget handle cannot be inferred from handle, widgetHandle, name, or widgetName.',
        fieldErrors: [
          {
            path: 'handle',
            code: 'REQUIRED',
            message: 'Add handle or provide a name that can be converted to a handle.',
          },
        ],
      });
    });
  });
});
