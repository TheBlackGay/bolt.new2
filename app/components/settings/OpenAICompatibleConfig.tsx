import { useStore } from '@nanostores/react';
import { memo, useState } from 'react';
import {
  customEndpointsStore,
  selectedEndpointIdStore,
  addCustomEndpoint,
  updateCustomEndpoint,
  deleteCustomEndpoint,
  type CustomEndpoint,
  type CustomModel,
} from '~/lib/stores/openai-compatible';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { classNames } from '~/utils/classNames';

export const OpenAICompatibleConfig = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<CustomEndpoint | null>(null);
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  
  const endpoints = useStore(customEndpointsStore);
  const selectedEndpointId = useStore(selectedEndpointIdStore);

  // Form state for new/editing endpoint
  const [formData, setFormData] = useState({
    name: '',
    baseURL: '',
    apiKey: '',
  });

  // Form state for new model
  const [modelFormData, setModelFormData] = useState({
    id: '',
    name: '',
    maxTokens: 8192,
  });

  const selectedEndpoint = endpoints.find((e) => e.id === selectedEndpointId);

  const handleOpenConfig = () => {
    setIsOpen(true);
    setIsAddingEndpoint(false);
    setEditingEndpoint(null);
  };

  const handleAddEndpoint = () => {
    setIsAddingEndpoint(true);
    setFormData({ name: '', baseURL: '', apiKey: '' });
  };

  const handleEditEndpoint = (endpoint: CustomEndpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      baseURL: endpoint.baseURL,
      apiKey: endpoint.apiKey || '',
    });
  };

  const handleSaveEndpoint = () => {
    if (!formData.name || !formData.baseURL) {
      return;
    }

    if (editingEndpoint) {
      // Update existing
      updateCustomEndpoint(editingEndpoint.id, {
        name: formData.name,
        baseURL: formData.baseURL,
        apiKey: formData.apiKey || undefined,
      });
      setEditingEndpoint(null);
    } else {
      // Add new
      const newEndpoint: CustomEndpoint = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        baseURL: formData.baseURL,
        apiKey: formData.apiKey || undefined,
        models: [],
      };
      addCustomEndpoint(newEndpoint);
      selectedEndpointIdStore.set(newEndpoint.id);
      setIsAddingEndpoint(false);
    }

    setFormData({ name: '', baseURL: '', apiKey: '' });
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('Are you sure you want to delete this endpoint?')) {
      deleteCustomEndpoint(id);
    }
  };

  const handleAddModel = () => {
    if (!selectedEndpoint || !modelFormData.id || !modelFormData.name) {
      return;
    }

    const newModel: CustomModel = {
      id: modelFormData.id,
      name: modelFormData.name,
      maxTokens: modelFormData.maxTokens,
    };

    updateCustomEndpoint(selectedEndpoint.id, {
      models: [...selectedEndpoint.models, newModel],
    });

    setModelFormData({ id: '', name: '', maxTokens: 8192 });
    setIsAddingModel(false);
  };

  const handleDeleteModel = (modelId: string) => {
    if (!selectedEndpoint) return;

    updateCustomEndpoint(selectedEndpoint.id, {
      models: selectedEndpoint.models.filter((m) => m.id !== modelId),
    });
  };

  const handleTestConnection = async (endpoint: CustomEndpoint) => {
    try {
      const response = await fetch(`${endpoint.baseURL}/models`, {
        headers: endpoint.apiKey ? { Authorization: `Bearer ${endpoint.apiKey}` } : {},
      });

      if (response.ok) {
        const data: any = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          const modelCount = data.data.length;
          
          // Ask user if they want to import discovered models
          const shouldImport = confirm(
            `✅ Connection successful!\n\n` +
            `Found ${modelCount} model${modelCount !== 1 ? 's' : ''} on this endpoint.\n\n` +
            `Would you like to import these models automatically?`
          );
          
          if (shouldImport) {
            handleImportModels(endpoint, data.data);
          }
        } else {
          alert('✅ Connection successful!');
        }
      } else {
        alert(`❌ Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportModels = (endpoint: CustomEndpoint, discoveredModels: Array<any>) => {
    const importedModels: CustomModel[] = [];
    const existingModelIds = new Set(endpoint.models.map(m => m.id));
    
    for (const model of discoveredModels) {
      const modelId = model.id;
      
      // Skip if model already exists
      if (existingModelIds.has(modelId)) {
        continue;
      }
      
      // Create friendly name from ID
      const friendlyName = modelId
        .split(/[-_/]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\b\d+b\b/gi, (match: string) => match.toUpperCase());
      
      // Estimate max tokens based on model info or use default
      let maxTokens = 8192; // Default
      
      if (model.context_length) {
        maxTokens = model.context_length;
      } else if (modelId.includes('32k') || modelId.includes('32768')) {
        maxTokens = 32768;
      } else if (modelId.includes('16k') || modelId.includes('16384')) {
        maxTokens = 16384;
      } else if (modelId.includes('8k') || modelId.includes('8192')) {
        maxTokens = 8192;
      } else if (modelId.includes('4k') || modelId.includes('4096')) {
        maxTokens = 4096;
      }
      
      importedModels.push({
        id: modelId,
        name: friendlyName,
        maxTokens: maxTokens,
      });
    }
    
    if (importedModels.length > 0) {
      updateCustomEndpoint(endpoint.id, {
        models: [...endpoint.models, ...importedModels],
      });
      
      alert(
        `✅ Successfully imported ${importedModels.length} model${importedModels.length !== 1 ? 's' : ''}!\n\n` +
        `Models added:\n${importedModels.map(m => `• ${m.name}`).join('\n')}`
      );
    } else {
      alert('ℹ️ All discovered models are already configured.');
    }
  };

  return (
    <>
      <button
        onClick={handleOpenConfig}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor text-bolt-elements-textPrimary transition-colors"
        title="Configure OpenAI Compatible Endpoints"
      >
        <div className="i-ph:gear text-lg" />
        <span className="text-sm font-medium">Configure Custom Models</span>
      </button>

      <DialogRoot open={isOpen}>
        <Dialog onBackdrop={() => setIsOpen(false)} onClose={() => setIsOpen(false)}>
          <DialogTitle>OpenAI Compatible Configuration</DialogTitle>
          <DialogDescription asChild>
            <div className="text-left max-h-[70vh] overflow-y-auto">
              {/* Endpoint List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-bolt-elements-textSecondary">
                    Custom Endpoints
                  </label>
                  <button
                    onClick={handleAddEndpoint}
                    className="text-xs px-2 py-1 rounded bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover"
                  >
                    + Add Endpoint
                  </button>
                </div>

                {/* Add/Edit Endpoint Form */}
                {(isAddingEndpoint || editingEndpoint) && (
                  <div className="mb-4 p-4 rounded-lg bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor">
                    <h3 className="text-sm font-medium mb-3">
                      {editingEndpoint ? 'Edit Endpoint' : 'New Endpoint'}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="My Custom Endpoint"
                          className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                          Base URL
                        </label>
                        <input
                          type="text"
                          value={formData.baseURL}
                          onChange={(e) => setFormData({ ...formData, baseURL: e.target.value })}
                          placeholder="http://localhost:1234/v1"
                          className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                          API Key (optional)
                        </label>
                        <input
                          type="password"
                          value={formData.apiKey}
                          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                          placeholder="Optional for local endpoints"
                          className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEndpoint}
                          disabled={!formData.name || !formData.baseURL}
                          className="px-3 py-1.5 rounded bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingEndpoint(false);
                            setEditingEndpoint(null);
                            setFormData({ name: '', baseURL: '', apiKey: '' });
                          }}
                          className="px-3 py-1.5 rounded bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Endpoint List */}
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className={classNames(
                        'p-3 rounded-lg border cursor-pointer transition-colors',
                        {
                          'bg-bolt-elements-item-backgroundAccent border-bolt-elements-item-borderAccent':
                            selectedEndpointId === endpoint.id,
                          'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor hover:bg-bolt-elements-background-depth-3':
                            selectedEndpointId !== endpoint.id,
                        },
                      )}
                      onClick={() => selectedEndpointIdStore.set(endpoint.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-bolt-elements-textPrimary text-sm">
                            {endpoint.name}
                          </div>
                          <div className="text-xs text-bolt-elements-textSecondary mt-1">
                            {endpoint.baseURL}
                          </div>
                          <div className="text-xs text-bolt-elements-textTertiary mt-1">
                            {endpoint.models.length} model{endpoint.models.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestConnection(endpoint);
                            }}
                            className="p-1.5 rounded hover:bg-bolt-elements-background-depth-3"
                            title="Test Connection & Discover Models"
                          >
                            <div className="i-ph:plug text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEndpoint(endpoint);
                            }}
                            className="p-1.5 rounded hover:bg-bolt-elements-background-depth-3"
                            title="Edit"
                          >
                            <div className="i-ph:pencil text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEndpoint(endpoint.id);
                            }}
                            className="p-1.5 rounded hover:bg-bolt-elements-background-depth-3 text-red-500"
                            title="Delete"
                          >
                            <div className="i-ph:trash text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Models for Selected Endpoint */}
              {selectedEndpoint && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-bolt-elements-textSecondary">
                      Models for {selectedEndpoint.name}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestConnection(selectedEndpoint)}
                        className="text-xs px-2 py-1 rounded bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor flex items-center gap-1"
                        title="Discover models from endpoint"
                      >
                        <div className="i-ph:magnifying-glass text-sm" />
                        Discover Models
                      </button>
                      <button
                        onClick={() => setIsAddingModel(true)}
                        className="text-xs px-2 py-1 rounded bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover"
                      >
                        + Add Manually
                      </button>
                    </div>
                  </div>

                  {/* Add Model Form */}
                  {isAddingModel && (
                    <div className="mb-4 p-4 rounded-lg bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor">
                      <h3 className="text-sm font-medium mb-3">New Model</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                            Model ID
                          </label>
                          <input
                            type="text"
                            value={modelFormData.id}
                            onChange={(e) =>
                              setModelFormData({ ...modelFormData, id: e.target.value })
                            }
                            placeholder="llama-3.1-70b"
                            className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={modelFormData.name}
                            onChange={(e) =>
                              setModelFormData({ ...modelFormData, name: e.target.value })
                            }
                            placeholder="Llama 3.1 70B"
                            className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-bolt-elements-textSecondary mb-1">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            value={modelFormData.maxTokens}
                            onChange={(e) =>
                              setModelFormData({
                                ...modelFormData,
                                maxTokens: parseInt(e.target.value) || 8192,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddModel}
                            disabled={!modelFormData.id || !modelFormData.name}
                            className="px-3 py-1.5 rounded bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50 text-sm"
                          >
                            Add Model
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingModel(false);
                              setModelFormData({ id: '', name: '', maxTokens: 8192 });
                            }}
                            className="px-3 py-1.5 rounded bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Model List */}
                  <div className="space-y-2">
                    {selectedEndpoint.models.length === 0 ? (
                      <div className="text-center text-sm text-bolt-elements-textTertiary py-4">
                        No models configured. Add a model to get started.
                      </div>
                    ) : (
                      selectedEndpoint.models.map((model) => (
                        <div
                          key={model.id}
                          className="p-3 rounded-lg bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-bolt-elements-textPrimary text-sm">
                                {model.name}
                              </div>
                              <div className="text-xs text-bolt-elements-textSecondary mt-1">
                                ID: {model.id}
                              </div>
                              <div className="text-xs text-bolt-elements-textTertiary mt-1">
                                Max tokens: {model.maxTokens.toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              className="p-1.5 rounded hover:bg-bolt-elements-background-depth-3 text-red-500"
                              title="Delete Model"
                            >
                              <div className="i-ph:trash text-sm" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-xs text-bolt-elements-textSecondary bg-bolt-elements-background-depth-2 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="i-ph:lightbulb text-base flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Quick Start:</strong>
                    <ol className="mt-1 ml-4 list-decimal space-y-1">
                      <li>Add an endpoint (e.g., LM Studio at <code className="px-1 py-0.5 rounded bg-bolt-elements-background-depth-3">http://localhost:1234/v1</code>)</li>
                      <li>Test the connection using the 🔌 button</li>
                      <li>Click "Discover Models" to automatically import available models</li>
                      <li>Or manually add models if auto-discovery doesn't work</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
          <div className="flex gap-2 justify-end mt-6">
            <DialogButton type="secondary" onClick={() => setIsOpen(false)}>
              Close
            </DialogButton>
          </div>
        </Dialog>
      </DialogRoot>
    </>
  );
});

OpenAICompatibleConfig.displayName = 'OpenAICompatibleConfig';
