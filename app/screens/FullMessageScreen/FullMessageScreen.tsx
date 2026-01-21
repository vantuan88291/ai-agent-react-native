import { FC } from "react"
import { ScrollView, ViewStyle } from "react-native"
import { Markdown } from "@docren/react-native-markdown"

import { Box } from "@/components/Box"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const FullMessageScreen: FC<AppStackScreenProps<"FullMessage">> = ({
  navigation,
  route,
}) => {
  const { themed, theme } = useAppTheme()
  const { message } = route.params

  return (
    <Screen preset="fixed">
      <Header title={"Full Message"} leftIcon="back" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={themed($scrollContent)}>
        <Box style={themed($container)}>
          <Markdown
            markdown={message}
            styles={{
              // Root and body
              root: { flex: 1 },
              body: { color: theme.colors.text, fontSize: 14 },

              // Headings
              heading: { fontWeight: "bold" },
              heading1: {
                color: theme.colors.text,
                fontSize: 20,
                fontWeight: "bold",
              },
              heading2: {
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "bold",
              },
              heading3: {
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "bold",
              },
              heading4: {
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: "bold",
              },
              heading5: {
                color: theme.colors.text,
                fontSize: 14,
                fontWeight: "bold",
              },
              heading6: {
                color: theme.colors.text,
                fontSize: 13,
                fontWeight: "bold",
              },
              paragraph: {
                lineHeight: 24,
              },

              // Text formatting
              text: { color: theme.colors.text },
              strong: { fontWeight: "bold", color: theme.colors.text },
              emphasis: { fontStyle: "italic", color: theme.colors.text },

              // Code
              code: {
                backgroundColor: theme.colors.palette.neutral300,
                borderRadius: 8,
                fontFamily: "monospace",
                marginVertical: 6,
              },
              inlineCode: {
                backgroundColor: theme.colors.palette.primary200,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                fontFamily: "monospace",
                fontSize: 14,
              },

              // Links
              link: {
                color: theme.colors.tint,
                textDecorationLine: "underline",
              },
              linkReference: {
                color: theme.colors.tint,
                textDecorationLine: "underline",
              },

              // Lists
              list: {
                marginVertical: 2,
              },
              listItem: {
                marginVertical: 4,
                flexDirection: "row",
              },

              // Blockquote
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.tint,
                paddingLeft: 12,
                marginLeft: 8,
                backgroundColor: theme.colors.palette.neutral100,
                paddingVertical: 8,
                borderRadius: 4,
              },

              // Images
              image: {
                marginVertical: 12,
                borderRadius: 8,
              },
              imageReference: {
                marginVertical: 12,
                borderRadius: 8,
              },

              // Thematic break (horizontal rule)
              thematicBreak: {
                height: 1,
                backgroundColor: theme.colors.separator,
              },

              // Line break
              break: {
                height: 8,
              },

              // Definition
              definition: {
                marginVertical: 4,
              },
            }}
          />
        </Box>
      </ScrollView>
    </Screen>
  )
}

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  flexGrow: 1,
})

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingBottom: spacing.xl,
})
