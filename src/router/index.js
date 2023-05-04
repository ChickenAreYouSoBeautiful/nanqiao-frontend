import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {title: '控制台', icon: 'dashboard'}
    }]
  },

  {
    path: '/guide',
    component: Layout,
    children: [
      {
        path: 'guide',
        name: 'Guide',
        component: () => import('@/views/guide/index'),
        meta: {title: '引导页', icon: 'form'}
      }
    ]
  },

  {
    path: '/service',
    component: Layout,
    redirect: '/service/list',
    name: 'Service',
    meta: {title: '服务项目', icon: 'el-icon-s-help'},
    children: [
      {
        path: 'list',
        name: 'List',
        component: () => import('@/views/table/index'),
        meta: {title: '项目列表', icon: 'table'}
      }
    ]
  },

  {
    path: '/master',
    component: Layout,
    redirect: '/master/list',
    name: 'Example',
    meta: {title: '理疗师', icon: 'el-icon-user-solid'},
    children: [
      {
        path: 'list',
        name: 'Table',
        component: () => import('@/views/physio/index'),
        meta: {title: '理疗师列表', icon: 'el-icon-user'}
      }
    ]
  },
  // {
  //   path: '/shop',
  //   component: Layout,
  //   redirect: '/shop/list',
  //   name: 'Example',
  //   meta: {title: '商品', icon: 'el-icon-user-solid'},
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'Table',
  //       component: () => import('@/views/shop/index'),
  //       meta: {title: '商品列表', icon: 'el-icon-user'}
  //     }
  //   ]
  // },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    name: 'Nested',
    meta: {title: '订单', icon: 'nested'},
    children: [
      {
        path: 'list',
        component: () => import('@/views/orders/index'),
        name: 'Menu2',
        meta: {title: '订单列表'}
      }
    ]
  },

  {
    path: '/docs',
    component: Layout,
    children: [
      {
        path: 'http://i.heyige.cn/',
        meta: {title: '文档地址', icon: 'link'}
      }
    ]
  },

  // 404 page must be placed at the end !!!
  {path: '*', redirect: '/404', hidden: true}
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes,
  mode: 'history'
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
