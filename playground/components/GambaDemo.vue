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
        <NButton :disabled="subscribe" @click="stopLiveBetSubscribe">
          UnSubscribe
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
const gqlLiveBet = gql`subscription liveBet {
  liveBet {
    action_id
    amount
    display_name
  }
}`

const walletUpdated = gql`
subscription walletUpdated {
  walletUpdated {
    id
    free_amount
    __typename
  }
}
`

const { result: data, refetch: refresh } = useQuery(gqlGames, { first: 5 }, { clientId: 'gamba' })
const { onResult, onError, result, stop, start } = useSubscription(walletUpdated, null, { clientId: 'gamba' })

const subscribe = ref(false)

onResult((r) => {
  console.log('new result received', result.value)
  data.value = result.value
})

onError((e) => {
  console.log(e)
})

function liveBetSubscribe () {
  subscribe.value = true
}
const stopLiveBetSubscribe = () => {
  stop()
}
function loadGames () {
  refresh()
}
</script>
