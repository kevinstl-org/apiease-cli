import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TopLevelCliCommandRouter } from '../../../src/cli/TopLevelCliCommandRouter.js';

describe('TopLevelCliCommandRouter', () => {
  describe('resolveCommand', () => {
    it('should resolve a crud command for every supported resource argument', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();
      const createRequestCommand = { name: 'create' };
      const readRequestCommand = { name: 'read' };
      const updateRequestCommand = { name: 'update' };
      const deleteRequestCommand = { name: 'delete' };

      // Act
      const results = [
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['create', 'request', '--file', '/tmp/request.json'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['read', 'widget', '--widget-id', 'widget-1'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['update', 'variable', '--variable-name', 'sale_banner', '--file', '/tmp/variable.json'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['delete', 'request', '--request-id', 'request-1'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
      ];

      // Assert
      assert.deepEqual(results, [
        {
          ok: true,
          command: createRequestCommand,
        },
        {
          ok: true,
          command: readRequestCommand,
        },
        {
          ok: true,
          command: updateRequestCommand,
        },
        {
          ok: true,
          command: deleteRequestCommand,
        },
      ]);
    });

    it('should resolve create read update and delete for function resources', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();
      const createRequestCommand = { name: 'create' };
      const readRequestCommand = { name: 'read' };
      const updateRequestCommand = { name: 'update' };
      const deleteRequestCommand = { name: 'delete' };

      // Act
      const results = [
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['create', 'function', '--file', '/tmp/function.json'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['read', 'function', '--function-id', 'function-1'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['update', 'function', '--function-id', 'function-1', '--file', '/tmp/function.json'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
        topLevelCliCommandRouter.resolveCommand({
          commandArguments: ['delete', 'function', '--function-id', 'function-1'],
          createRequestCommand,
          readRequestCommand,
          updateRequestCommand,
          deleteRequestCommand,
          initProjectCommand: { name: 'init' },
          upgradeProjectCommand: { name: 'upgrade' },
        }),
      ];

      // Assert
      assert.deepEqual(results, [
        {
          ok: true,
          command: createRequestCommand,
        },
        {
          ok: true,
          command: readRequestCommand,
        },
        {
          ok: true,
          command: updateRequestCommand,
        },
        {
          ok: true,
          command: deleteRequestCommand,
        },
      ]);
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

    it('should return a usage failure when a legacy bare crud shape provides an option flag instead of a resource argument', () => {
      // Arrange
      const topLevelCliCommandRouter = new TopLevelCliCommandRouter();

      // Act
      const result = topLevelCliCommandRouter.resolveCommand({
        commandArguments: ['read', '--request-id', 'request-1'],
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
        message: 'Missing required resource argument for read.',
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
        'Usage: apiease <command> [options]',
        '',
        'Commands:',
        '  create <request|widget|variable|function>   Create a resource from a definition file.',
        '  read <request|widget|variable|function>     Read a resource by identifier.',
        '  update <request|widget|variable|function>   Update a resource by identifier from a definition file.',
        '  delete <request|widget|variable|function>   Delete a resource by identifier.',
        '  init                              Initialize a new APIEase project.',
        '  upgrade                           Upgrade an existing APIEase project.',
      ].join('\n'));
      assert.doesNotMatch(usageText, /apiease-cli/);
    });
  });
});
