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
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL!}/@`,
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
          wsHost: process.env.PUSHER_HOST!,
          cluster: process.env.PUSHER_CLUSTER!,
          channelEndpoint: `${process.env.GRAPHQL_BASE_URL}/broadcasting/auth`,
          pusherAppKey: process.env.PUSHER_APP_KEY!,
          forceTLS: !!process.env.PUSHER_FORCE_TLS!,
          // @ts-expect-error
          wsPort: process.env.PUSHER_PORT!
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
