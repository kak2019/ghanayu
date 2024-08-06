<template>
    <div class="nav">
        <router-link class="tab" to="/home" replace>Home</router-link>
        <router-link class="tab" to="/about" replace>About</router-link>
        <router-link class="tab" to="/shippingrecord" replace>Shipping Record</router-link>
    </div>
    <router-view></router-view>
</template>
<script>
export default {

}
</script>
<style>
.nav {
    margin: 20px 20px;
}

.tab {
    border: 1px solid #ccc;
    box-shadow: 8px 5px 5px -5px #ccc;
    margin-right: 8px;
    padding: 2px 20px;
    text-decoration: none;

}

.tab:hover {
    border-bottom: 3px solid #ccc;
}

.router-link-active {

    border-bottom: 3px solid #00809d !important;
}
</style>