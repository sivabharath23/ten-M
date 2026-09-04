declare module 'swagger-ui-react' {
  import { Component, ComponentType } from 'react'

  export interface SwaggerUIProps {
    url?: string
    spec?: object
    docExpansion?: 'list' | 'full' | 'none'
    defaultModelExpandDepth?: number
    defaultModelsExpandDepth?: number
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>
  export default SwaggerUI
}
