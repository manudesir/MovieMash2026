import { useEffect, useMemo, useState } from 'react';
import './BranchPreviewSelector.css';

type PreviewDeployment = {
  id: string;
  name: string;
  branch: string;
  kind: 'main' | 'pull_request';
  prNumber?: number;
  url: string;
  updatedAt: string;
  sha: string;
};

type PreviewManifest = {
  deployments: PreviewDeployment[];
};

function getPreviewContext() {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  const previewsSegmentIndex = baseUrl.pathname.indexOf('/previews/');

  if (previewsSegmentIndex === -1) {
    return undefined;
  }

  const repositoryBasePath = baseUrl.pathname.slice(0, previewsSegmentIndex);
  return {
    currentBasePath: baseUrl.pathname,
    manifestUrl: `${window.location.origin}${repositoryBasePath}/previews/manifest.json`,
  };
}

export function BranchPreviewSelector() {
  const previewContext = useMemo(getPreviewContext, []);
  const [deployments, setDeployments] = useState<PreviewDeployment[]>([]);

  useEffect(() => {
    if (!previewContext) {
      return;
    }

    let mounted = true;

    void fetch(previewContext.manifestUrl, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((manifest: PreviewManifest | undefined) => {
        if (mounted) {
          setDeployments(manifest?.deployments ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setDeployments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [previewContext]);

  if (!previewContext || deployments.length <= 1) {
    return null;
  }

  const currentDeployment = deployments.find((deployment) => {
    const deploymentUrl = new URL(deployment.url);
    return previewContext.currentBasePath.startsWith(deploymentUrl.pathname);
  });

  function handleChange(nextDeploymentId: string) {
    const nextDeployment = deployments.find((deployment) => deployment.id === nextDeploymentId);

    if (!nextDeployment) {
      return;
    }

    window.location.href = `${nextDeployment.url}${window.location.hash}`;
  }

  return (
    <aside className="branch-preview-selector" aria-label="GitHub Pages preview selector">
      <label htmlFor="branch-preview-selector">Preview</label>
      <select
        id="branch-preview-selector"
        value={currentDeployment?.id ?? ''}
        onChange={(event) => handleChange(event.target.value)}
      >
        {deployments.map((deployment) => (
          <option key={deployment.id} value={deployment.id}>
            {deployment.name}
          </option>
        ))}
      </select>
    </aside>
  );
}
