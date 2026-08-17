import { Screen } from './Screen';
import { EmptyState } from '@/components/ui';

type FeaturePlaceholderProps = {
  title: string;
  message: string;
};

export function FeaturePlaceholder({ title, message }: FeaturePlaceholderProps) {
  return (
    <Screen title={title}>
      <EmptyState title="Próximamente" message={message} />
    </Screen>
  );
}
