import { FC, useCallback } from "react"
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Box } from "@/components/Box"
import { Header } from "@/components/Header"
import { Icon } from "@/components/Icon"
import { Row } from "@/components/Row"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { ModelInfo } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { useModels } from "./hooks/useModels"

export const WelcomeScreen: FC<AppStackScreenProps<"Welcome">> = function WelcomeScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { models, isLoading, isRefreshing, sortOrder, toggleSortOrder, refresh } = useModels()

  const handleSelectModel = useCallback(
    (model: ModelInfo) => {
      navigation.navigate("ai", { model })
    },
    [navigation],
  )

  const renderItem: ListRenderItem<ModelInfo> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => handleSelectModel(item)}
        style={themed($modelItem)}
        activeOpacity={0.7}
      >
        <Box style={themed($modelItemContainer)}>
          <Row alignItems="center" justifyContent="space-between" style={themed($modelContentRow)}>
            <Box style={themed($modelInfo)}>
              <Text text={item.name} preset="default" size="md" weight="medium" />
              <Text text={item.size} preset="default" size="xs" style={themed($modelSize)} />
            </Box>
            <Icon size={20} icon="caretRight" color={theme.colors.textDim} />
          </Row>
        </Box>
      </TouchableOpacity>
    ),
    [handleSelectModel, themed, theme.colors.textDim],
  )

  const keyExtractor = useCallback((item: ModelInfo) => item.id, [])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <Header
        title="AI Models"
        rightIcon={sortOrder === "asc" ? "sortUp" : "sortDown"}
        onRightPress={toggleSortOrder}
      />
      {isLoading ? (
        <Box style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </Box>
      ) : (
        <FlatList
          data={models}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={theme.colors.tint}
            />
          }
        />
      )}
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
})

const $modelItem: ThemedStyle<ViewStyle> = () => ({
  marginBottom: spacing.xs,
})

const $modelItemContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
})

const $modelContentRow: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flex: 1,
})

const $modelInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
})

const $modelSize: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})
