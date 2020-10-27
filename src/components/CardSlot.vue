<template>
    <div class="card-slot" :class="{ outlined }">
        <img src="@/assets/cards/1B.svg">
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"

@Component({
    name: "CardSlot"
})
export default class CardSlot extends Vue {
    @Prop(Boolean)
    private readonly outlined?: boolean;
}
</script>

<style lang="scss">
.card-slot {
    padding: 5px;
    border: 2px solid yellow;
    border-radius: 10px;
    .img {
        max-height: 100%;
        max-width: 100%;
    }
}
</style>