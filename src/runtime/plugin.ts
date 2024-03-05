import destr from 'destr'
import { onError } from '@apollo/client/link/error'
import { getMainDefinition } from '@apollo/client/utilities'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import {
  ApolloClient,
  ApolloLink,
  type DefaultContext,
  InMemoryCache,
  type RequestHandler,
  split
} from '@apollo/client/core'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries'
import { sha256 } from 'crypto-hash'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { setContext } from '@apollo/client/link/context'
import Pusher from 'pusher-js'
import createRestartableClient from './ws'
import { useApollo } from './composables'
import PusherLink from './pusher'
// @ts-ignore
import { defineNuxtPlugin, ref, useCookie, useRequestHeaders } from '#imports'
// @ts-ignore
import NuxtApollo from '#apollo'
import type { ClientConfig } from "../types";

// @ts-ignore
export default defineNuxtPlugin((nuxtApp) => {
  const requestCookies = (process.server && NuxtApollo.proxyCookies && useRequestHeaders(['cookie'])) || undefined

  const clients: { [key: string]: ApolloClient<any> } = {}

  for (const [key, clientConfig] of Object.entries(NuxtApollo.clients)) {
    // @ts-ignore
    const typedClientConfig: ClientConfig = clientConfig;
    const getAuth = async () => {
      const token = ref<string | null>()

      await nuxtApp.callHook('apollo:auth', {token, client: key})

      if (!token.value) {
        if (typedClientConfig.tokenStorage === 'cookie') {
          if (process.client) {
            token.value = useCookie(typedClientConfig.tokenName!).value
          } else if (requestCookies?.cookie) {
            token.value = requestCookies.cookie.split(';').find(
              (c: string) => c.trim().startsWith(`${typedClientConfig.tokenName}=`)
            )?.split('=')?.[1]
          }
        } else if (process.client && typedClientConfig.tokenStorage === 'localStorage') {
          token.value = localStorage.getItem(typedClientConfig.tokenName!)
        }

        if (!token.value) {
          return
        }
      }

      const authScheme = !!token.value?.match(/^[a-zA-Z]+\s/)?.[0]

      if (authScheme || typedClientConfig.authType === null) {
        return token.value
      }

      return `${typedClientConfig.authType} ${token.value}`
    }

    const authLink = setContext(async (_, {headers}) => {
      const auth = await getAuth()

      if (!auth) {
        return
      }

      return {
        headers: {
          ...headers,
          ...(requestCookies && requestCookies),
          [typedClientConfig.authHeader!]: auth
        }
      }
    })

    const getCsrfToken = async () => {
      const token = ref<string | null>()
      await nuxtApp.callHook('apollo:csrf', {token, client: key})

      return token.value
    }

    const csrfLink = setContext(async (_, {headers}) => {
      const token = await getCsrfToken()

      if (!token) {
        return
      }

      return {
        headers: {
          ...headers,
          ...(requestCookies && requestCookies),
          [typedClientConfig.csrfHeader!]: token
        }
      }
    })

    const contextLink = setContext(async (_, prevContext: DefaultContext) => {
      const context = ref<null | DefaultContext>(null)
      await nuxtApp.callHook('apollo:link', {prevContext, context, client: key})

      if (!context.value) {
        return
      }

      return context.value
    })

    let baseLink = csrfLink.concat(authLink).concat(contextLink)

    // add persistedQueryLink if enabled
    let persistedLink: ApolloLink | RequestHandler | null = null;
    if (typedClientConfig.persistedQueries) {
      persistedLink = createPersistedQueryLink({sha256, useGETForHashedQueries: true})
    }

    const httpEndLink = createUploadLink({
      ...typedClientConfig.httpLinkOptions && typedClientConfig.httpLinkOptions,
      uri: process.client && typedClientConfig.browserHttpEndpoint || typedClientConfig.httpEndpoint,
      headers: {...typedClientConfig.httpLinkOptions?.headers || {}}
    });

    const httpLink = baseLink.concat(httpEndLink)
    let wsLink: GraphQLWsLink | null = null

    if (process.client && typedClientConfig.wsEndpoint) {
      const wsClient = createRestartableClient({
        ...typedClientConfig.wsLinkOptions,
        url: typedClientConfig.wsEndpoint,
        connectionParams: async () => {
          const auth = await getAuth()
          const csrf = await getCsrfToken()

          if (!auth && !csrf) {
            return
          }

          return {
            ...(auth ? {[typedClientConfig.authHeader!]: auth} : {}),
            ...(csrf ? {[typedClientConfig.csrfHeader!]: csrf} : {})
          }
        }
      })

      wsLink = new GraphQLWsLink(wsClient)

      nuxtApp._apolloWsClients = nuxtApp._apolloWsClients || {}
      nuxtApp._apolloWsClients[key] = wsClient
    }

    let pusherLink: PusherLink | null = null
    if (process.client && typedClientConfig.pusher) {
      pusherLink = new PusherLink({
        pusher: new Pusher(typedClientConfig.pusher.pusherAppKey, {
          wsHost: typedClientConfig.pusher.wsHost,
          wsPort: typedClientConfig.pusher.wsPort,
          forceTLS: typedClientConfig.pusher.forceTLS,
          disableStats: true,
          enabledTransports: ['ws', 'wss'],
          cluster: typedClientConfig.pusher.cluster,
          // @ts-ignore
          channelAuthorization: {
            endpoint: typedClientConfig.pusher.channelEndpoint,
            headersProvider() {
              const {token: csrfToken} = nuxtApp.$csrfToken()
              const {token: authToken} = nuxtApp.$authToken()
              return {
                'X-CSRF-Token': csrfToken.value,
                authorization: `Bearer ${authToken.value}`
              }
            }
          }
        })
      })
    }

    const errorLink = onError((err) => {
      nuxtApp.callHook('apollo:error', err)
    })

    const link = pusherLink
      ? ApolloLink.from([
        errorLink,
        baseLink,
        pusherLink,
        ...(
          typedClientConfig.persistedQueries && persistedLink ? [
            split(
              ({query}) => {
                const definition = getMainDefinition(query);
                return definition.kind === "OperationDefinition" && definition.operation === "query";
              },
              ApolloLink.from([persistedLink, httpEndLink]),
              httpEndLink
            )
          ] : [httpEndLink]
        )
      ])
      : ApolloLink.from([
        errorLink,
        ...(!(wsLink)
          ? [httpLink]
          : [
            ...(typedClientConfig.websocketsOnly
              ? [wsLink]
              : [
                split(
                  ({query}) => {
                    const definition = getMainDefinition(query)
                    return (definition.kind === 'OperationDefinition' && definition.operation === 'subscription')
                  },
                  wsLink,
                  httpLink
                )
              ])
          ])
      ])

    const cache = new InMemoryCache(typedClientConfig.inMemoryCacheOptions)

    clients[key] = new ApolloClient({
      link,
      cache,
      ...(NuxtApollo.clientAwareness && {name: key}),
      ...(process.server ? {ssrMode: true} : {ssrForceFetchDelay: 100}),
      connectToDevTools: typedClientConfig.connectToDevTools || false,
      defaultOptions: typedClientConfig.defaultOptions
    })

    if (!clients?.default && !NuxtApollo?.clients?.default && key === Object.keys(NuxtApollo.clients)[0]) {
      clients.default = clients[key]
    }

    const cacheKey = `_apollo:${key}`

    nuxtApp.hook('app:rendered', () => {
      nuxtApp.payload.data[cacheKey] = cache.extract()
    })

    if (process.client && nuxtApp.payload.data[cacheKey]) {
      cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
    }
  }

  provideApolloClients(clients)
  nuxtApp.vueApp.provide(ApolloClients, clients)
  nuxtApp._apolloClients = clients

  const defaultClient = clients?.default

  return {
    provide: {
      apolloHelpers: useApollo(),
      apollo: {clients, defaultClient}
    }
  }
})
