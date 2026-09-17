import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/colors";
import { READING_MODES } from "./reading-modes";
import { ReadingModeKey } from "./reading-modes/types";

interface Props {
  visible: boolean;
  currentMode: ReadingModeKey;
  onSelect: (mode: ReadingModeKey) => void;
  onClose: () => void;
}

/**
 * A plain RN <Modal> rather than Alert.alert: Alert's multi-button list
 * renders inconsistently on react-native-web (it falls back to a bare
 * window.confirm for two buttons and just warns for more), so a real
 * component is what makes this work the same on phones, tablets and web.
 */
export function ReadingModeSheet({ visible, currentMode, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Reading mode</Text>
          {Object.values(READING_MODES).map((def) => {
            const active = def.key === currentMode;
            return (
              <Pressable
                key={def.key}
                onPress={() => {
                  onSelect(def.key);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {def.label}
                </Text>
                <Text style={styles.optionDescription}>{def.description}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    // Web has no bottom safe-area inset to account for; a flat max-width
    // keeps the sheet from stretching edge-to-edge on wide browser windows.
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  optionActive: {
    backgroundColor: colors.accentMuted,
  },
  optionPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  optionLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  optionLabelActive: {
    color: colors.accent,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
