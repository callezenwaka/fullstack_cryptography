import React from 'react';
import { useEncryption } from '@/hooks/useEncryption';
import { ShieldCheckIcon, ShieldExclamationIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const EncryptionStatus: React.FC = () => {
  const { isLoaded, isLoading, error, keyFingerprints, reload } = useEncryption();

  return (
    <div className={clsx(
      'p-4 rounded-lg border-2 transition-all duration-200',
      {
        'bg-green-50 border-green-200': isLoaded && !error,
        'bg-yellow-50 border-yellow-200': isLoading,
        'bg-red-50 border-red-200': error,
        'bg-gray-50 border-gray-200': !isLoaded && !isLoading && !error
      }
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <ArrowPathIcon className="w-6 h-6 text-yellow-600 animate-spin" />
          ) : isLoaded && !error ? (
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
          ) : (
            <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
          )}
          
          <div>
            <h3 className={clsx(
              'font-semibold text-sm',
              {
                'text-green-800': isLoaded && !error,
                'text-yellow-800': isLoading,
                'text-red-800': error,
                'text-gray-800': !isLoaded && !isLoading && !error
              }
            )}>
              Encryption Status
            </h3>
            <p className={clsx(
              'text-xs mt-1',
              {
                'text-green-600': isLoaded && !error,
                'text-yellow-600': isLoading,
                'text-red-600': error,
                'text-gray-600': !isLoaded && !isLoading && !error
              }
            )}>
              {isLoading && 'Loading encryption keys...'}
              {isLoaded && !error && 'Encryption keys loaded successfully'}
              {error && `Error: ${error}`}
              {!isLoaded && !isLoading && !error && 'Encryption not initialized'}
            </p>
          </div>
        </div>

        {error && (
          <button
            onClick={reload}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        )}
      </div>

      {keyFingerprints && (
        <div className="mt-3 p-3 bg-white rounded border">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Key Fingerprints</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Client:</span>
              <code className="bg-gray-100 px-1 rounded">{keyFingerprints.clientPublic}</code>
            </div>
            <div className="flex justify-between">
              <span>Server:</span>
              <code className="bg-gray-100 px-1 rounded">{keyFingerprints.serverPublic}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionStatus;