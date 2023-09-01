const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;
import App from './app.js';
import PagesAbout from './pages/about.js';
import PagesHome from './pages/home.js';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: PagesHome },
        { path: '/about', component: PagesAbout }
    ]
});

const { createPinia } = Pinia;
const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(naive);
app.mount('#app');