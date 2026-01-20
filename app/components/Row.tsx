import { View, ViewProps, ViewStyle } from "react-native"
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet"

const $container: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

export interface RowProps extends ViewProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle> | undefined
  children?: React.ReactNode
  backgroundColor?: string
  flex?: number
  width?: number
  height?: number
  borderRadius?: number
  gap?: number
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline" | null
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
  overflow?: "visible" | "hidden"
  borderWidth?: number
  borderColor?: string
  opacity?: number
}

/**
 * Describe your component here
 */
export function Row(props: RowProps) {
  const { style: styleOverride, ...rest } = props
  const styleContainer: any = {
    width: props.width,
    height: props.height,
    flex: props.flex,
    backgroundColor: props.backgroundColor,
    borderRadius: props.borderRadius,
    alignItems: props?.alignItems,
    justifyContent: props.justifyContent,
    gap: props.gap,
    overflow: props.overflow,
    borderWidth: props.borderWidth,
    borderColor: props.borderColor,
    opacity: props.opacity,
  }
  return <View style={[$container, styleContainer, styleOverride]} {...rest} />
}
