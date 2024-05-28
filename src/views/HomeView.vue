<template>
  <div class="container mt-5">
    <div class="row">
      <!-- Feed de Notícias -->
      <div class="col-md-8">
        <h2>Feed de Notícias</h2>
        <div v-if="loading" class="text-center">Carregando notícias...</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else>
          <div v-for="article in articles" :key="article.url" class="card mb-4">
            <img
              :src="article.urlToImage"
              class="card-img-top"
              alt="Imagem da notícia"
              v-if="article.urlToImage"
            />
            <div class="card-body">
              <h5 class="card-title">{{ article.title }}</h5>
              <p class="card-text">{{ article.description }}</p>
              <a :href="article.url" target="_blank" class="btn btn-primary"
                >Leia mais</a
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Barra Lateral -->
      <div class="col-md-4">
        <!-- Tendências -->
        <div class="mb-4">
          <h2>Tendências</h2>
          <ul class="list-group">
            <li class="list-group-item" v-for="trend in trends" :key="trend">
              {{ trend }}
            </li>
          </ul>
        </div>

        <!-- Sugestões de Seguimento -->
        <div>
          <h2>Sugestões de Seguimento</h2>
          <ul class="list-group">
            <li
              class="list-group-item"
              v-for="user in users"
              :key="user.uid"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <h5>{{ user.firstname }}</h5>
                  <p>{{ user.handle }}</p>
                </div>
                <button @click="followUser(user.uid)" class="btn btn-outline-primary">Seguir</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const articles = ref([]);
const trends = ref(["#Tendência1", "#Tendência2", "#Tendência3"]); // Tendências simuladas
const users = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchNews = async () => {
  const apiKey = '3e3ba585f86a421c89a727d58f2b037a';  // Chave da API fornecida
  const url = `https://newsapi.org/v2/top-headlines?country=br&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    articles.value = response.data.articles;
  } catch (err) {
    error.value = 'Falha ao carregar notícias';
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  users.value = usersSnapshot.docs.map(doc => doc.data());
};



onMounted(() => {
  fetchNews();
  fetchUsers();
});
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>