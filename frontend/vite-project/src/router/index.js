import { createRouter, createWebHistory } from 'vue-router'
import PhoneFrame from '../components/PhoneFrame.vue'
import Home from '../views/Home.vue'
import Browser from '../views/Browser.vue'
import OnlineStore from '../views/OnlineStore.vue'
import BrowserHome from '../views/BrowserHome.vue' // Добавьте импорт
import Work from '../views/Work.vue' // Создайте новый компонент Work
import Camera from '../views/Camera.vue' // Добавьте эту строку

const routes = [
  {
    path: '/',
    component: PhoneFrame,
    children: [
      { path: '', name: 'Home', component: Home },
      { 
        path: '/browser',
        component: Browser,
        children: [
          { path: '', name: 'BrowserHome', component: BrowserHome },
          { path: 'store', name: 'Store', component: OnlineStore },
          { path: 'work', name: 'Work', component: Work }
        ]
      }
    ]
  },
  { path: '/camera', name: 'Camera', component: Camera }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router