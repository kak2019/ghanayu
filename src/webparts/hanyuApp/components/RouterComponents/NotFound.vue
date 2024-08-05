<template>
    <div>
        <h3>Page Not Found 404</h3>
        <h4>{{ this.$route.params.patchMatch }}</h4>
    </div>
</template>
<script>
import { useRoute } from "vue-router";
export default {
    created() {
        console.log(this.$route.params);
    },
    setup() {
        const route = useRoute();

    }
}
</script>