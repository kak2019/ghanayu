import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '../webparts/hanyuApp/components/RouterComponents/Home.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/stockreport',
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/Stockreport.vue')
    },
    {
        path: '/goodsInventory',
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/GoodsInventoryPage/GoodsInventory.vue')
    },
    {
        path: '/processcompletion',
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/ProcessCompletion.vue')
    },
    {
        path: '/shippingrecord',
        //component: shippingRecord
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/ShippingRecordPage/ShippingRecord.vue')
    },
    {
        path: '/partsmaster',
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/PartsMaster.vue')
    },
    {
        path: '/goodsreceive',
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/GoodsReceivePage/GoodsReceive.vue')
    },
    {
        path: '/billofmaterials',
        component: () => import(/* webpackChunkName: "about-chunk" */
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