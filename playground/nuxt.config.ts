export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/apollo'],

  colorMode: {
    preference: 'light',
    storageKey: 'na-color-scheme'
  },

  apollo: {
    proxyCookies: true,
    clients: {
      default: './apollo/default.ts',
      github: {
        httpEndpoint: 'https://api.github.com/graphql',
        tokenStorage: 'localStorage'
      },
      todos: {
        httpEndpoint: 'https://nuxt-gql-server-2gl6xp7kua-ue.a.run.app/query',
        wsEndpoint: 'wss://nuxt-gql-server-2gl6xp7kua-ue.a.run.app/query',
        httpLinkOptions: {
          headers: {
          }
        }
      },
      users: {
        // TODO: this endpoint is project case and not shared one, should be shared one once they provide
        httpEndpoint: 'https://cold-silence-fjaidfhrsyil.vapor-farm-d1.com/graph',
        httpLinkOptions: {
          credentials: 'include' // NOTE: this is required if cookie should be sent for different domain
        },
        // NOTE: `X-CSRF-TOKEN` is default csrfHeader
        csrfHeader: 'X-CSRF-TOKEN'
      },
      junglebet: {
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL}/@`,
        httpLinkOptions: {
          credentials: 'include'
        },
        persistedQueries: false,
        pusher: {
          wsHost: process.env.PUSHER_WS_HOST!,
          cluster: process.env.PUSHER_CLUSTER!,
          channelEndpoint: `${process.env.GRAPHQL_BASE_URL}/broadcasting/auth`,
          pusherAppKey: process.env.PUSHER_APP_KEY!,
          forceTLS: !!process.env.PUSHER_FORCE_TLS!,
          wsPort: process.env.PUSHER_WS_PORT!
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      graphqlBaseUrl: process.env.GRAPHQL_BASE_URL
    }
  }
})
