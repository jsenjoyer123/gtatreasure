import { createRouter, createWebHistory } from 'vue-router'
import PhoneFrame from '../components/PhoneFrame.vue'
import Home from '../views/Home.vue'
import Browser from '../views/Browser.vue'
import OnlineStore from '../views/OnlineStore.vue'
import BrowserHome from '../views/BrowserHome.vue'
import Work from '../views/Work.vue'
import Camera from '../views/Camera.vue'
import UploadPosition from '../views/UploadPosition.vue'
import Auth from '../views/Auth.vue'

const routes = [
  // Новый маршрут авторизации
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
  path: '/register',
  name: 'Register',
  component: () => import('../views/RegisterView.vue')
},
  // Основной интерфейс приложения
  {
    path: '/',
    component: PhoneFrame,
    children: [
      { path: '', name: 'Home', component: Home }
    ]
  },
  { 
    path: '/browser',
    component: Browser,
    children: [
      { path: '', name: 'BrowserHome', component: BrowserHome },
      { path: 'store', name: 'Store', component: OnlineStore },
      { path: 'work', name: 'Work', component: Work },
      { path: 'upload', name: 'Upload', component: UploadPosition }
    ]
  },
  { path: '/camera', name: 'Camera', component: Camera }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router