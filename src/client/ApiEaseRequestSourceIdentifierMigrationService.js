const REQUEST_HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_IDENTIFIER_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ApiEaseRequestSourceIdentifierMigrationService {
  validateRequestHandle(handle) {
    if (typeof handle === 'string' && REQUEST_HANDLE_PATTERN.test(handle)) {
      return {
        ok: true,
        handle,
      };
    }

    return this.buildInvalidHandleResult();
  }

  migrateRequestSourceIdentifier(requestDefinition) {
    if (this.hasOwnProperty(requestDefinition, 'handle')) {
      return this.migrateExistingHandle(requestDefinition);
    }

    return this.migrateInferredHandle(requestDefinition);
  }

  migrateExistingHandle(requestDefinition) {
    const validationResult = this.validateRequestHandle(requestDefinition.handle);
    if (!validationResult.ok) {
      return validationResult;
    }

    return this.buildMigrationSuccessResult(requestDefinition, requestDefinition.handle);
  }

  migrateInferredHandle(requestDefinition) {
    const handleSource = this.readHandleSource(requestDefinition);
    const handle = this.slugifyHandleSource(handleSource);
    if (!handle) {
      return this.buildHandleNotInferredResult();
    }

    return this.buildMigrationSuccessResult(requestDefinition, handle);
  }

  readHandleSource(requestDefinition) {
    if (!this.hasOwnProperty(requestDefinition, 'id')) {
      return requestDefinition.name;
    }

    if (this.isUuidShapedIdentifier(requestDefinition.id)) {
      return requestDefinition.name;
    }

    return requestDefinition.id;
  }

  buildMigrationSuccessResult(requestDefinition, handle) {
    const migratedRequestDefinition = {
      ...requestDefinition,
      handle,
    };
    delete migratedRequestDefinition.id;

    return {
      ok: true,
      requestDefinition: migratedRequestDefinition,
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

  isUuidShapedIdentifier(identifier) {
    return typeof identifier === 'string' && UUID_SHAPED_IDENTIFIER_PATTERN.test(identifier);
  }

  buildInvalidHandleResult() {
    return {
      ok: false,
      errorCode: 'APIEASE_REQUEST_HANDLE_INVALID',
      message: 'Request handle must use lowercase letters, numbers, and single hyphens between words.',
      fieldErrors: [
        {
          path: 'handle',
          code: 'INVALID_VALUE',
          message: 'Must match ^[a-z0-9]+(?:-[a-z0-9]+)*$',
        },
      ],
    };
  }

  buildHandleNotInferredResult() {
    return {
      ok: false,
      errorCode: 'APIEASE_REQUEST_HANDLE_NOT_INFERRED',
      message: 'Request handle cannot be inferred from id or name.',
      fieldErrors: [
        {
          path: 'handle',
          code: 'REQUIRED',
          message: 'Add handle or provide a name that can be converted to a handle.',
        },
      ],
    };
  }

  hasOwnProperty(objectValue, propertyName) {
    return Object.prototype.hasOwnProperty.call(objectValue, propertyName);
  }
}

export { ApiEaseRequestSourceIdentifierMigrationService };
