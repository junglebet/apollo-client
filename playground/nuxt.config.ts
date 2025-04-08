export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/apollo'],

  colorMode: {
    preference: 'dark',
    storageKey: 'na-color-scheme'
  },

  apollo: {
    proxyCookies: true,
    clients: {
      default: './apollo/default.ts',
      github: {
        httpEndpoint: 'https://api.github.com/graphql',
        tokenStorage: 'cookie'
      },
      todos: {
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL!}/query`,
        wsEndpoint: 'wss://wss.junglebet.com/query',
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network'
          }
        },
        httpLinkOptions: {
          headers: {
            'X-CUSTOM-HEADER': '123'
          }
        }
      },
      users: {
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL!}/@`,
        httpLinkOptions: {
          credentials: 'include'
        },
        csrfHeader: 'X-CSRF-TOKEN'
      },
      junglebet: {
        httpEndpoint: `${process.env.GRAPHQL_BASE_URL!}/@`,
        httpLinkOptions: {
          credentials: 'include'
        },
        persistedQueries: false,
        requestMaxTimeout: 7000,
        pusher: {
          wsHost: process.env.PUSHER_HOST!,
          cluster: process.env.PUSHER_CLUSTER!,
          channelEndpoint: `${process.env.GRAPHQL_BASE_URL!}/broadcasting/auth`,
          pusherAppKey: process.env.PUSHER_APP_KEY!,
          forceTLS: !!process.env.PUSHER_FORCE_TLS!,
          activityTimeout: 6000,
          wsPort: Number(process.env.PUSHER_PORT)!
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      graphqlBaseUrl: process.env.GRAPHQL_BASE_URL
    }
  },
  compatibilityDate: '2025-04-08'
})
