import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TopLevelCliCommandRouter } from '../../../src/cli/TopLevelCliCommandRouter.js';

describe('TopLevelCliCommandRouter', () => {
  describe('resolveCommand', () => {
    it('should resolve a crud command when the resource argument is supported', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();
      const createRequestCommand = { name: 'create' };

      // Act
      const result = topLevelCliCommandRouter.resolveCommand({
        commandArguments: ['create', 'widget', '--file', '/tmp/widget.json'],
        createRequestCommand,
        readRequestCommand: { name: 'read' },
        updateRequestCommand: { name: 'update' },
        deleteRequestCommand: { name: 'delete' },
        initProjectCommand: { name: 'init' },
        upgradeProjectCommand: { name: 'upgrade' },
      });

      // Assert
      assert.deepEqual(result, {
        ok: true,
        command: createRequestCommand,
      });
    });

    it('should return a usage failure when a crud command is missing the resource argument', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();

      // Act
      const result = topLevelCliCommandRouter.resolveCommand({
        commandArguments: ['delete'],
        createRequestCommand: { name: 'create' },
        readRequestCommand: { name: 'read' },
        updateRequestCommand: { name: 'update' },
        deleteRequestCommand: { name: 'delete' },
        initProjectCommand: { name: 'init' },
        upgradeProjectCommand: { name: 'upgrade' },
      });

      // Assert
      assert.deepEqual(result, {
        ok: false,
        message: 'Missing required resource argument for delete.',
      });
    });

    it('should return a usage failure when a crud command resource is unsupported', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();

      // Act
      const result = topLevelCliCommandRouter.resolveCommand({
        commandArguments: ['update', 'gadget'],
        createRequestCommand: { name: 'create' },
        readRequestCommand: { name: 'read' },
        updateRequestCommand: { name: 'update' },
        deleteRequestCommand: { name: 'delete' },
        initProjectCommand: { name: 'init' },
        upgradeProjectCommand: { name: 'upgrade' },
      });

      // Assert
      assert.deepEqual(result, {
        ok: false,
        message: 'Unsupported resource for update: gadget.',
      });
    });

    it('should resolve init without requiring a resource argument', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();
      const initProjectCommand = { name: 'init' };

      // Act
      const result = topLevelCliCommandRouter.resolveCommand({
        commandArguments: ['init', 'my-project'],
        createRequestCommand: { name: 'create' },
        readRequestCommand: { name: 'read' },
        updateRequestCommand: { name: 'update' },
        deleteRequestCommand: { name: 'delete' },
        initProjectCommand,
        upgradeProjectCommand: { name: 'upgrade' },
      });

      // Assert
      assert.deepEqual(result, {
        ok: true,
        command: initProjectCommand,
      });
    });
  });

  describe('buildUsageText', () => {
    it('should describe the supported verb plus resource command shape for crud operations', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();

      // Act
      const usageText = topLevelCliCommandRouter.buildUsageText();

      // Assert
      assert.equal(usageText, [
        'Usage: apiease-cli <command> [options]',
        '',
        'Commands:',
        '  create <request|widget|variable>   Create a resource from a definition file.',
        '  read <request|widget|variable>     Read a resource by identifier.',
        '  update <request|widget|variable>   Update a resource by identifier from a definition file.',
        '  delete <request|widget|variable>   Delete a resource by identifier.',
        '  init                              Initialize a new APIEase project.',
        '  upgrade                           Upgrade an existing APIEase project.',
      ].join('\n'));
    });
  });
});
