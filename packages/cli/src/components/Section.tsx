import { Box, type DOMElement, Text, type BoxProps } from 'ink'
import { type PropsWithChildren, forwardRef } from 'react'

export interface SectionProps extends BoxProps {
  title: string
}

export const Section = forwardRef<DOMElement, PropsWithChildren<SectionProps>>(
  ({ title, children, ...props }, ref) => (
    <Box ref={ref} borderStyle='single' flexDirection='column' {...props}>
      <Box marginTop={-1}>
        <Text>{title}</Text>
      </Box>
      {children}
    </Box>
  ),
)
