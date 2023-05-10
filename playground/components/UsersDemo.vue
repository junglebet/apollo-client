<template>
  <div flex flex-col gap-4>
    <NCard p-4>
      <div class="n-header-upper">
        Todos Example
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <NButton @click="refresh">
          Load Users
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
// TODO: this is not query for shared api, should be corrected if shared api is provided, which requires csrf token
const gqlUsers = gql`query users {
  users {
    data {
      id
    }
  }
}`

const { data, refresh } = await useAsyncQuery(gqlUsers, 'users')

</script>
