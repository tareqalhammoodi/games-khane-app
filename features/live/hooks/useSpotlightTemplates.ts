import { useEffect, useMemo, useState } from 'react';

import {
  getSpotlightTemplates,
  type SpotlightTemplates
} from '@/features/live/services/spotlightTemplateService';

const EMPTY_TEMPLATES: SpotlightTemplates = {
  spicy: [],
  funny: [],
  deep: []
};

export function useSpotlightTemplates() {
  const [templates, setTemplates] = useState<SpotlightTemplates>(EMPTY_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadTemplates = async () => {
      try {
        const data = await getSpotlightTemplates();
        if (!isActive) {
          return;
        }

        setTemplates(data);
        setError(null);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setTemplates(EMPTY_TEMPLATES);
        setError(err instanceof Error ? err.message : 'Unable to load spotlight templates.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    void loadTemplates();

    return () => {
      isActive = false;
    };
  }, []);

  const hasTemplates = useMemo(() => {
    return (
      templates.spicy.length > 0 ||
      templates.funny.length > 0 ||
      templates.deep.length > 0
    );
  }, [templates]);

  return {
    templates,
    hasTemplates,
    isLoading,
    error
  };
}
