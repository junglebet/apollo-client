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
        httpEndpoint: 'https://aged-farm-ih4lzf6w0nlc.vapor-farm-f1.com/@',
        httpLinkOptions: {
          credentials: 'include' // NOTE: this is required if cookie should be sent for different domain
        },
        // NOTE: `X-CSRF-TOKEN` is default csrfHeader
        csrfHeader: 'X-CSRF-TOKEN'
      },
      gamba: {
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL}/@`,
        httpLinkOptions: {
          credentials: 'include'
        },
        persistedQueries: false,
        pusher: {
          cluster: process.env.PUSHER_CLUSTER!,
          channelEndpoint: '/broadcasting/auth',
          pusherAppKey: process.env.PUSHER_APP_KEY!
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
