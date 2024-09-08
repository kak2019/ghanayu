import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import(/* webpackChunkName: "home-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/Home.vue')
    },
    {
        path: '/stockresultmodification',
        component: () => import(/* webpackChunkName: "stockresultmodification-chunk" */
            '../webparts/hanyuApp/components/StockResultModification/StockResultModification.vue')
    },
    {
        path: '/stockreport',
        component: () => import(/* webpackChunkName: "stockreport-chunk" */
            '../webparts/hanyuApp/components/StockReportPage/StockReport.vue')
    },
    {
        path: '/goodsInventory',
        component: () => import(/* webpackChunkName: "goodsInventory-chunk" */
            '../webparts/hanyuApp/components/GoodsInventoryPage/GoodsInventory.vue')
    },
    {
        path: '/processcompletion',
        component: () => import(/* webpackChunkName: "processcompletion-chunk" */
            '../webparts/hanyuApp/components/ProcessCompletePage/ProcessComplete.vue')
    },
    {
        path: '/shippingrecord',
        //component: shippingRecord
        component: () => import(/* webpackChunkName: "shippingrecord-chunk" */
            '../webparts/hanyuApp/components/ShippingRecordPage/ShippingRecord.vue')
    },
    {
        path: '/partsmaster',
        component: () => import(/* webpackChunkName: "partsmaster-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/PartsMaster.vue')
    },
    {
        path: '/goodsreceive',
        component: () => import(/* webpackChunkName: "goodsreceive-chunk" */
            '../webparts/hanyuApp/components/GoodsReceivePage/GoodsReceive.vue')
    },
    {
        path: '/billofmaterials',
        component: () => import(/* webpackChunkName: "billofmaterials-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/BillOfMaterials.vue')
    },
    {
        path: '/:patchMatch(.*)',
        component: () => import(/* webpackChunkName: "notfound-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/NotFound.vue')
    }
]
const router = createRouter({
    routes,
    history: createWebHashHistory()
})
export default router;