<template>
<div class="hanyuapp" v-loading="loading">
    <div class="nav">
        <router-link class="tab" to="/" replace>フロントページ</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/goodsreceive" replace>支給品検収実績入力</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/processcompletion" replace>内製工程完了実績入力</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/shippingrecord" replace>出荷実績入力</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/goodsInventory" replace>在庫管理表(支給品)</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/stockreport" replace>在庫管理表(工程別)</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/stockresultmodification" replace>在庫&実績修正</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/billofmaterials" replace>部品表</router-link>
        <el-divider direction="vertical" />
        <router-link class="tab" to="/partsmaster" replace>部品マスター</router-link>
    </div>
    <router-view></router-view>
</div>
</template>

<script>
module.exports = require('./app');
</script>

<style>
.hanyuapp {
    height: 80vh;
    min-height: 400px;
}

div[data-automation-id="contentScrollRegion"] {
    overflow: hidden;
}

.nav {
    display: flex;
    justify-content: space-between;
    background-color: #EBEBEB;
    white-space: nowrap;
    border-top-left-radius: 6px; /* 左上角圆角 */
    border-top-right-radius: 6px; /* 右上角圆角 */
}

.tab {
    color: black;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 6px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
    flex: 1 1 auto;
    text-align: center;
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

.el-divider--vertical {
    height: auto !important;
    margin: 0 !important;
}
</style>
