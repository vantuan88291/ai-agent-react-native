import { forwardRef } from "react"
import { ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

import { BottomSheetClose } from "@/components/BottomSheetClose"
import { Box } from "@/components/Box"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface StatsSheetProps {
  totalModels: number
  downloadedCount: number
  totalSize: string
  downloadedSize: string
}

export const StatsSheet = forwardRef<BottomSheetModal, StatsSheetProps>(
  ({ totalModels, downloadedCount, totalSize, downloadedSize }, ref) => {
    const { themed } = useAppTheme()

    return (
      <BottomSheetClose ref={ref} disableExpand title="Statistics">
        <Box style={themed($contentContainer)}>
          <Box style={themed($infoSection)}>
            <Text text="Total Models" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={totalModels.toString()} preset="default" size="md" weight="medium" />
          </Box>

          <Box style={themed($infoSection)}>
            <Text text="Downloaded Models" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={downloadedCount.toString()} preset="default" size="md" weight="medium" />
          </Box>

          <Box style={themed($infoSection)}>
            <Text text="Total Size" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={totalSize} preset="default" size="md" />
          </Box>

          <Box style={themed($infoSection)}>
            <Text text="Downloaded Size" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={downloadedSize} preset="default" size="md" />
          </Box>
        </Box>
      </BottomSheetClose>
    )
  },
)

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $infoSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $label: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})
