import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import {
  getProviderList,
  selectedModelStore,
  selectedProviderStore,
  type ModelInfo,
} from '~/lib/stores/model';
import { customEndpointsStore } from '~/lib/stores/openai-compatible';
import { classNames } from '~/utils/classNames';

/**
 * Inline Model Selector for Initial Chat Screen
 * Compact version that appears before chat starts
 */
export const ModelSelectorInline = memo(() => {
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

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const providerName = event.target.value;
    selectedProviderStore.set(providerName);
    
    // Auto-select first model of the new provider
    const provider = providerList.find((p) => p.name === providerName);
    if (provider && provider.staticModels.length > 0) {
      selectedModelStore.set(provider.staticModels[0].name);
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selectedModelStore.set(event.target.value);
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <span className="text-sm text-bolt-elements-textSecondary">Chat with:</span>
      
      {/* Provider Selector */}
      <div className="relative">
        <select
          value={selectedProvider}
          onChange={handleProviderChange}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-md bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive transition-colors cursor-pointer hover:bg-bolt-elements-background-depth-3"
        >
          {providerList.map((provider) => (
            <option key={provider.name} value={provider.name}>
              {provider.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <div className="i-ph:caret-down text-bolt-elements-textSecondary text-sm" />
        </div>
      </div>

      {/* Model Selector */}
      <div className="relative">
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-md bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColorActive transition-colors cursor-pointer hover:bg-bolt-elements-background-depth-3"
        >
          {currentProvider?.staticModels.map((model: ModelInfo) => (
            <option key={model.name} value={model.name}>
              {model.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <div className="i-ph:caret-down text-bolt-elements-textSecondary text-sm" />
        </div>
      </div>

      {/* Info Icon with Token Limit */}
      {currentModelInfo && (
        <div 
          className="text-xs text-bolt-elements-textTertiary flex items-center gap-1"
          title={`Max tokens: ${currentModelInfo.maxTokenAllowed.toLocaleString()}`}
        >
          <div className="i-ph:info text-sm" />
          <span>{currentModelInfo.maxTokenAllowed.toLocaleString()} tokens</span>
        </div>
      )}
    </div>
  );
});

ModelSelectorInline.displayName = 'ModelSelectorInline';
