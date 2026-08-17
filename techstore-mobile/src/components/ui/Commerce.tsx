import CheckCircle2 from 'lucide-react-native/icons/circle-check-big';
import Circle from 'lucide-react-native/icons/circle';
import Radio from 'lucide-react-native/icons/radio';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Badge } from './Display';
import { IconButton } from './Button';

type QuantitySelectorProps = {
  value: number;
  minimum?: number;
  maximum?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  minimum = 1,
  maximum = 99,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const { theme } = useAppTheme();
  const decrementDisabled = disabled || value <= minimum;
  const incrementDisabled = disabled || value >= maximum;
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel="Cantidad"
      accessibilityValue={{ min: minimum, max: maximum, now: value }}
      style={[
        styles.quantity,
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.sm,
        },
      ]}>
      <IconButton
        icon="remove"
        accessibilityLabel="Disminuir cantidad"
        disabled={decrementDisabled}
        onPress={() => onChange(Math.max(minimum, value - 1))}
        style={styles.compactButton}
      />
      <AppText variant="bodyStrong" style={styles.quantityValue}>
        {value}
      </AppText>
      <IconButton
        icon="add"
        accessibilityLabel="Aumentar cantidad"
        disabled={incrementDisabled}
        onPress={() => onChange(Math.min(maximum, value + 1))}
        style={styles.compactButton}
      />
    </View>
  );
}

type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'PAGADO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'DEVUELTO' | 'CANCELADO';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    PENDIENTE: { label: 'Pendiente', tone: 'warning' },
    CONFIRMADO: { label: 'Confirmado', tone: 'info' },
    PAGADO: { label: 'Pagado', tone: 'success' },
    PREPARANDO: { label: 'Preparando', tone: 'info' },
    EN_CAMINO: { label: 'En camino', tone: 'gold' },
    ENTREGADO: { label: 'Entregado', tone: 'success' },
    DEVUELTO: { label: 'Devuelto', tone: 'warning' },
    CANCELADO: { label: 'Cancelado', tone: 'error' },
  }[status] as { label: string; tone: 'warning' | 'info' | 'success' | 'gold' | 'error' };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export type ShippingTimelineItem = {
  label: string;
  timestamp?: string;
  completed?: boolean;
  current?: boolean;
};

export function ShippingTimeline({ items }: { items: ShippingTimelineItem[] }) {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLabel="Seguimiento del envío" style={{ gap: theme.spacing.lg }}>
      {items.map((item, index) => {
        const color = item.completed || item.current ? theme.colors.primary : theme.colors.textMuted;
        return (
          <View key={`${item.label}-${index}`} style={[styles.timelineRow, { gap: theme.spacing.md }]}>
            <View style={styles.timelineRail}>
              {item.completed ? <CheckCircle2
                size={theme.iconSizes.md}
                color={color}
              /> : item.current ? <Radio size={theme.iconSizes.md} color={color} /> : <Circle size={theme.iconSizes.md} color={color} />}
              {index < items.length - 1 ? (
                <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingBottom: theme.spacing.md }}>
              <AppText variant="bodyStrong" style={{ color }}>
                {item.label}
              </AppText>
              {item.timestamp ? (
                <AppText variant="caption" tone="secondary">
                  {item.timestamp}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

type ChatBubbleProps = {
  message: string;
  timestamp: string;
  outgoing?: boolean;
  status?: 'enviando' | 'enviado' | 'leido' | 'error';
};

export function ChatBubble({ message, timestamp, outgoing = false, status }: ChatBubbleProps) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.bubbleRow, outgoing && styles.outgoingRow]}>
      <View
        style={[
          styles.bubble,
          {
            borderRadius: theme.radius.lg,
            backgroundColor: outgoing ? theme.colors.surfaceElevated : theme.colors.surface,
            borderColor: outgoing ? theme.colors.borderStrong : theme.colors.border,
            padding: theme.spacing.md,
            gap: theme.spacing.xs,
          },
        ]}>
        <AppText>{message}</AppText>
        <View style={[styles.bubbleMeta, { gap: theme.spacing.xs }]}>
          <AppText variant="caption" tone="muted">
            {timestamp}
          </AppText>
          {outgoing && status ? (
            <AppText variant="caption" tone={status === 'error' ? 'error' : 'secondary'}>
              {status}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quantity: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  compactButton: {
    width: 40,
    height: 40,
  },
  quantityValue: {
    minWidth: 28,
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  outgoingRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderWidth: 1,
  },
  bubbleMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
