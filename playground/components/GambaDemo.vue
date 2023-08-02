<template>
  <div flex flex-col gap-4>
    <NCard p-4>
      <div class="n-header-upper">
        Games / Subscribe Example
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <NButton @click="loadGames">
          Load games
        </NButton>

        <NButton :disabled="subscribe" @click="liveBetSubscribe">
          Subscribe
        </NButton>
      </div>
    </NCard>

    <NCard p-4>
      <div class="n-header-upper">
        Raw Output
      </div>

      <pre v-if="data">{{ data }}</pre>
    </NCard>
  </div>
</template>

<script lang="ts" setup>
const gameFields = gql`
  fragment gameFields on Game {
    id
    title
    image
  }
`
const gqlGames = gql`
  query games($first: Int!, $page: Int) {
    games(first: $first, page: $page) {
      data {
        ...gameFields
      }
    }
  }
  ${gameFields}
`
const gqlLiveBet = gql`subscription liveBet { liveBet { channel } }`

const { result: data, refetch: refresh } = useQuery(gqlGames, { first: 5 }, { clientId: 'gamba' })

const subscribe = ref(false)

function liveBetSubscribe () {
  subscribe.value = true

  const { onResult, onError } = useSubscription(gqlLiveBet, null, { clientId: 'gamba' })

  onResult((r) => {
    data.value = r.data as any
  })

  onError((e) => {
    console.log(e)
  })
}
function loadGames () {
  refresh()
}
</script>
