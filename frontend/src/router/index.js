import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/auctions',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/auctions',
    name: 'Auctions',
    component: () => import('@/views/AuctionsView.vue'),
  },
  {
    path: '/auctions/:id',
    name: 'AuctionDetail',
    component: () => import('@/views/AuctionDetailView.vue'),
  },
  {
    path: '/create',
    name: 'CreateAuction',
    component: () => import('@/views/CreateAuctionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-auctions',
    name: 'MyAuctions',
    component: () => import('@/views/MyAuctionsView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
