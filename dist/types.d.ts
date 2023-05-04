
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['apollo']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['apollo']?: ModuleOptions }
}


export { ErrorResponse } from './module'
