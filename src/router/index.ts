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
        path: '/about',
        //component: About
        component: () => import(/* webpackChunkName: "about-chunk" */
            '../webparts/hanyuApp/components/RouterComponents/About.vue')
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