import { forwardRef, useState, useMemo } from "react"
import { FlatList, ListRenderItem, TouchableOpacity, ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

import { BottomSheetClose } from "@/components/BottomSheetClose"
import { Box } from "@/components/Box"
import { Icon } from "@/components/Icon"
import { Row } from "@/components/Row"
import { Text } from "@/components/Text"
import { ModelInfo } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

interface ModelListSheetProps {
  selectedModelId: string | null
  sortedModels: ModelInfo[]
  onSelectModel: (model: ModelInfo) => void
  onRemoveModel: (modelId: string) => void
}

export const ModelListSheet = forwardRef<BottomSheetModal, ModelListSheetProps>(
  ({ selectedModelId, sortedModels, onSelectModel, onRemoveModel }, ref) => {
    const { theme, themed } = useAppTheme()
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    // Apply sort order to sortedModels (which already has selected model at top)
    const displayModels = useMemo(() => {
      // Separate selected model from others
      const selectedModel = selectedModelId
        ? sortedModels.find((m) => m.id === selectedModelId)
        : null
      const otherModels = selectedModelId
        ? sortedModels.filter((m) => m.id !== selectedModelId)
        : [...sortedModels]

      // Reverse order if desc (but keep selected model at top)
      const sortedOtherModels = sortOrder === "desc" ? [...otherModels].reverse() : otherModels

      // Always put selected model at the top if it exists
      return selectedModel ? [selectedModel, ...sortedOtherModels] : sortedOtherModels
    }, [sortedModels, selectedModelId, sortOrder])

    const toggleSortOrder = () => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    const renderItem: ListRenderItem<ModelInfo> = ({ item }) => {
      const isSelected = item.id === selectedModelId
      return (
        <TouchableOpacity
          onPress={() => onSelectModel(item)}
          style={themed($modelItem)}
          activeOpacity={0.7}
        >
          <Box style={[themed($modelItemContainer), isSelected && themed($selectedItemContainer)]}>
            <Row
              alignItems="center"
              justifyContent="space-between"
              style={themed($modelContentRow)}
            >
              <Box style={themed($modelInfo)}>
                <Row alignItems="center" gap={spacing.xs}>
                  <Text text={item.name} preset="default" size="md" weight="medium" />
                </Row>
                <Text text={item.size} preset="default" size="xs" style={themed($modelSize)} />
              </Box>
              {isSelected && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    onRemoveModel(item.id)
                  }}
                  style={themed($deleteButton)}
                  activeOpacity={0.7}
                >
                  <Icon size={18} icon="x" color={theme.colors.palette.neutral100} />
                </TouchableOpacity>
              )}
            </Row>
          </Box>
        </TouchableOpacity>
      )
    }

    return (
      <BottomSheetClose
        ref={ref}
        disableExpand
        title="Select AI Model"
        subTitle={
          <Row alignItems="center" style={themed($subTitleRow)}>
            <Text
              text="Please select a model to use"
              style={$styles.flex1}
              preset="default"
              size="xs"
            />
            <TouchableOpacity
              onPress={toggleSortOrder}
              style={themed($sortButton)}
              activeOpacity={0.7}
            >
              <Row alignItems="center" gap={spacing.xxs}>
                <Text
                  text={sortOrder === "asc" ? "Ascending" : "Descending"}
                  preset="default"
                  size="xs"
                  weight="medium"
                />
              </Row>
            </TouchableOpacity>
          </Row>
        }
      >
        <Box style={themed($modelListContainer)}>
          <FlatList data={displayModels} renderItem={renderItem} keyExtractor={(item) => item.id} />
        </Box>
      </BottomSheetClose>
    )
  },
)

const $subTitleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  paddingHorizontal: spacing.md,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginRight: spacing.xl,
})

const $modelListContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: 0,
  paddingVertical: spacing.xs,
  maxHeight: 500,
})

const $modelItem: ThemedStyle<ViewStyle> = () => ({
  marginHorizontal: spacing.md,
})

const $modelItemContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  minHeight: 72,
})

const $selectedItemContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary100,
  borderRadius: 8,
  marginBottom: spacing.xs,
})

const $modelContentRow: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flex: 1,
})

const $modelInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
})

const $modelSize: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xxs,
  color: colors.textDim,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.error,
  borderRadius: 18,
  marginLeft: spacing.sm,
})
