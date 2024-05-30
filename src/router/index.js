import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref } from "vue";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

import LoginPage from "../views/LoginView.vue";
import RegisterPage from "../views/RegisterView.vue";
import Dashboard from "../views/DashboardView.vue";
import Profile from "../views/ProfileView.vue";
import Home from "../views/HomeView.vue";
import AdminPanel from "../views/AdminView.vue";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: Home
  },
  {
    path: "/register",
    name: "RegisterPage",
    component: RegisterPage
  },
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const auth = getAuth();
const db = getFirestore();
let isAuthenticated = ref(false);
let userEmail = ref(null);
let isAdmin = ref(false);

const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isAuthenticated.value = true;
      userEmail.value = user.email;

      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        isAdmin.value = userData.email === 'admin@x.com'; 

        if (isAdmin.value) {
          router.push({ name: 'AdminPanel' });
        }
      } else {
        await setDoc(userDoc, { email: user.email, name: "User" });
        console.log("No such document, creating default user document.");
        isAdmin.value = user.email === 'admin@x.com'; 

        if (isAdmin.value) {
          router.push({ name: 'AdminPanel' });
        }
      }
    } else {
      isAuthenticated.value = false;
      userEmail.value = null;
      isAdmin.value = false;
    }
    resolve();
  });
});

router.beforeEach(async (to, from, next) => {
  await authReady;

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'LoginPage' });
  } else if (to.meta.requiresAdmin && !isAdmin.value) {
    next({ name: 'Home' });  
  } else {
    next();
  }
});

export default router;
