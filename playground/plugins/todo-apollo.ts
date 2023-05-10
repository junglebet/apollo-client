export default defineNuxtPlugin((nuxtApp) => {
  // NOTE: please be careful if it's stable to call api in defineNuxtPlugin body
  // TODO: https://aged-farm-ih4lzf6w0nlc.vapor-farm-f1.com/auth/csrf-token is project case api, not shared endpoint
  const fetchCsrf = fetch('https://aged-farm-ih4lzf6w0nlc.vapor-farm-f1.com/auth/csrf-token', {
    credentials: 'include'
  })
  nuxtApp.hook('apollo:csrf', async ({ client, token }) => {
    if (client !== 'users') { return }

    const existingToken = nuxtApp.$csrfToken

    if (existingToken) {
      token.value = existingToken
      return
    }

    const res = await fetchCsrf
    const json = await res.json()
    nuxtApp.provide('csrfToken', json['x-csrf-token'])
    token.value = json['x-csrf-token']
  })
})
