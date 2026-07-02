const WIDGET_HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class ApiEaseWidgetSourceFieldMigrationService {
  migrateWidgetSourceFields(widgetDefinition) {
    const widgetName = this.readWidgetName(widgetDefinition);
    const widgetHandle = this.readWidgetHandle(widgetDefinition, widgetName);
    if (!widgetHandle) {
      return this.buildHandleNotInferredResult();
    }

    const validationResult = this.validateWidgetHandle(widgetHandle);
    if (!validationResult.ok) {
      return validationResult;
    }

    return this.buildMigrationSuccessResult({
      widgetDefinition,
      widgetHandle,
      widgetName,
    });
  }

  readWidgetName(widgetDefinition) {
    if (this.hasOwnProperty(widgetDefinition, 'name')) {
      return widgetDefinition.name;
    }

    return widgetDefinition.widgetName;
  }

  readWidgetHandle(widgetDefinition, widgetName) {
    if (this.hasOwnProperty(widgetDefinition, 'handle')) {
      return widgetDefinition.handle;
    }

    if (this.hasOwnProperty(widgetDefinition, 'widgetHandle')) {
      return widgetDefinition.widgetHandle;
    }

    return this.slugifyHandleSource(widgetName);
  }

  validateWidgetHandle(widgetHandle) {
    if (typeof widgetHandle === 'string' && WIDGET_HANDLE_PATTERN.test(widgetHandle)) {
      return {
        ok: true,
        handle: widgetHandle,
      };
    }

    return this.buildInvalidHandleResult();
  }

  buildMigrationSuccessResult({ widgetDefinition, widgetHandle, widgetName }) {
    const migratedWidgetDefinition = {
      ...widgetDefinition,
      handle: widgetHandle,
    };

    if (this.hasDefinedValue(widgetName)) {
      migratedWidgetDefinition.name = widgetName;
    }

    delete migratedWidgetDefinition.id;
    delete migratedWidgetDefinition.widgetId;
    delete migratedWidgetDefinition.widgetHandle;
    delete migratedWidgetDefinition.widgetName;

    return {
      ok: true,
      widgetDefinition: migratedWidgetDefinition,
    };
  }

  slugifyHandleSource(handleSource) {
    if (typeof handleSource !== 'string') {
      return '';
    }

    return handleSource
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  buildHandleNotInferredResult() {
    return {
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
    };
  }

  buildInvalidHandleResult() {
    return {
      ok: false,
      errorCode: 'APIEASE_WIDGET_HANDLE_INVALID',
      message: 'Widget handle must use lowercase letters, numbers, and single hyphens between words.',
      fieldErrors: [
        {
          path: 'handle',
          code: 'INVALID_VALUE',
          message: 'Must match ^[a-z0-9]+(?:-[a-z0-9]+)*$',
        },
      ],
    };
  }

  hasDefinedValue(value) {
    return value !== undefined;
  }

  hasOwnProperty(objectValue, propertyName) {
    return Object.prototype.hasOwnProperty.call(objectValue, propertyName);
  }
}

export { ApiEaseWidgetSourceFieldMigrationService };
