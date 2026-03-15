const CUSTOMER_OWNED_TEMPLATE_PATHS = new Set([
  'CUSTOM_AGENT_GUIDANCE.md',
  'CUSTOM_README.md',
  'README.md',
]);

class TemplateProjectOwnershipPolicy {
  isTemplateManagedPath(templatePath) {
    return !CUSTOMER_OWNED_TEMPLATE_PATHS.has(templatePath);
  }

  filterTemplateManifest(templateManifest) {
    const managedTemplateManifest = {};

    for (const [templatePath, templateHash] of Object.entries(templateManifest)) {
      if (!this.isTemplateManagedPath(templatePath)) {
        continue;
      }

      managedTemplateManifest[templatePath] = templateHash;
    }

    return managedTemplateManifest;
  }
}

export { TemplateProjectOwnershipPolicy };
