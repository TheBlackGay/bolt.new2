import { useStore } from '@nanostores/react';
import { memo, useState, useEffect } from 'react';
import {
  getProviderList,
  selectedModelStore,
  selectedProviderStore,
  type ModelInfo,
} from '~/lib/stores/model';
import { customEndpointsStore } from '~/lib/stores/openai-compatible';
import { OpenAICompatibleConfig } from './OpenAICompatibleConfig';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { classNames } from '~/utils/classNames';

export const ModelSelector = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProvider = useStore(selectedProviderStore);
  const selectedModel = useStore(selectedModelStore);
  
  // Subscribe to custom endpoints to refresh provider list
  const customEndpoints = useStore(customEndpointsStore);
  const [providerList, setProviderList] = useState(getProviderList());

  // Update provider list when custom endpoints change
  useEffect(() => {
    setProviderList(getProviderList());
  }, [customEndpoints]);

  const currentProvider = providerList.find((p) => p.name === selectedProvider);
  const currentModelInfo = currentProvider?.staticModels.find((m) => m.name === selectedModel);

  const handleProviderChange = (providerName: string) => {
    selectedProviderStore.set(providerName);
    
    // Auto-select first model of the new provider
    const provider = providerList.find((p) => p.name === providerName);
    if (provider && provider.staticModels.length > 0) {
      selectedModelStore.set(provider.staticModels[0].name);
    }
  };

  const handleModelChange = (modelName: string) => {
    selectedModelStore.set(modelName);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor text-bolt-elements-textPrimary transition-colors"
        title="Change AI Model"
      >
        <div className="i-ph:robot text-lg" />
        <span className="text-sm font-medium">{currentModelInfo?.label || 'Select Model'}</span>
        <div className="i-ph:caret-down text-sm" />
      </button>

      <DialogRoot open={isOpen}>
        <Dialog onBackdrop={() => setIsOpen(false)} onClose={() => setIsOpen(false)}>
          <DialogTitle>Select AI Model</DialogTitle>
          <DialogDescription asChild>
            <div className="text-left">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-bolt-elements-textSecondary">
                    Provider
                  </label>
                  {selectedProvider === 'OpenAICompatible' && (
                    <OpenAICompatibleConfig />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {providerList.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => handleProviderChange(provider.name)}
                      className={classNames(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                        {
                          'bg-bolt-elements-item-backgroundAccent border-bolt-elements-item-borderAccent text-bolt-elements-item-contentAccent':
                            selectedProvider === provider.name,
                          'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3':
                            selectedProvider !== provider.name,
                        },
                      )}
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-3">
                  Model
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentProvider?.staticModels.map((model: ModelInfo) => (
                    <button
                      key={model.name}
                      onClick={() => handleModelChange(model.name)}
                      className={classNames(
                        'w-full px-4 py-3 rounded-lg border text-left transition-colors',
                        {
                          'bg-bolt-elements-item-backgroundAccent border-bolt-elements-item-borderAccent':
                            selectedModel === model.name,
                          'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor hover:bg-bolt-elements-background-depth-3':
                            selectedModel !== model.name,
                        },
                      )}
                    >
                      <div className="font-medium text-bolt-elements-textPrimary">{model.label}</div>
                      <div className="text-xs text-bolt-elements-textSecondary mt-1">
                        Max tokens: {model.maxTokenAllowed.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-bolt-elements-textSecondary bg-bolt-elements-background-depth-2 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="i-ph:info text-base flex-shrink-0 mt-0.5" />
                  <div>
                    You'll need to configure the appropriate API keys in your environment variables for the
                    selected provider.
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

ModelSelector.displayName = 'ModelSelector';
