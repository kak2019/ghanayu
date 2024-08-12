<template>
    <div class="nav">
        <router-link class="tab" to="/home" replace>ホームページ</router-link>
        <router-link class="tab" to="/stockreport" replace>在庫管理表(支給品)</router-link>
        <router-link class="tab" to="/goodsInventory" replace>在庫管理表(工程別)</router-link>
        <router-link class="tab" to="/shippingrecord" replace>出荷実績入力</router-link>
        <router-link class="tab" to="/processcompletion" replace>内製工程完了実績入力</router-link>
        <router-link class="tab" to="/partsmaster" replace>部品マスター</router-link>
        <router-link class="tab" to="/goodsreceive" replace>支給品検収実績入力</router-link>
        <router-link class="tab" to="/billofmaterials" replace>部品表</router-link>
    </div>
    <router-view></router-view>
</template>
<script>
export default {

}
</script>
<style>
.nav {
    display: flex;
    justify-content: space-around;
    background-color: #f0f0f0;
    padding: 10px;
    white-space: nowrap;
}

.tab {
    color: black;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
}

.tab:hover {
    background-color: #e0e0e0;
}

.tab.router-link-exact-active {
    background-color: black;
    color: white !important;
}

.tab:visited {
    color: black;
}
</style>