import { View, ViewProps, ViewStyle } from "react-native"
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet"

export interface BoxProps extends ViewProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle> | undefined
  children?: any
  gradient?: string
  blur?: string
  backgroundColor?: string
  flex?: number
  width?: number | string
  height?: number | string
  minWidth?: number | string
  borderRadius?: number
  gap?: number | string
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
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

const blurStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}
const overFlowStyle: ViewStyle = {
  overflow: "hidden",
}
/**
 * Describe your component here
 */
export function Box(props: BoxProps) {
  const { style: styleOverride, children, gradient, ...rest } = props
  const styleContainer = {
    width: props.width,
    height: props.height,
    flex: props.flex,
    backgroundColor: props.backgroundColor,
    borderRadius: props.borderRadius,
    alignItems: props.alignItems,
    justifyContent: props.justifyContent,
    gap: +(props.gap || 0),
    overflow: props.overflow,
    borderWidth: props.borderWidth,
    borderColor: props.borderColor,
    opacity: props.opacity,
    minWidth: props?.minWidth,
  } as any
  return (
    <View
      style={[styleContainer, styleOverride, gradient && { backgroundColor: gradient }]}
      {...rest}
    >
      {children}
    </View>
  )
}
