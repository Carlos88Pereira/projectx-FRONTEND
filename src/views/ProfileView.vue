<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header text-center">
            <h2>Perfil</h2>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              Carregando...
              
            </div>
            <div v-else class="profile-info text-center">
              <img :src="user.profileImage" alt="Profile" class="profile-image rounded-circle mb-3" />
              <h4 class="mb-3">{{ user.firstName }} {{ user.lastName }}</h4>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Bio:</strong> {{ user.bio }}</p>
              <p><strong>Localização:</strong> {{ user.location }}</p>
              <p><strong>Website:</strong> <a :href="user.website" target="_blank">{{ user.website }}</a></p>
              <p><strong>Aniversário:</strong> {{ user.birthday }}</p>
              <button @click="editing = true" class="btn btn-primary mt-3">Editar Perfil</button>
            </div>
            <div v-if="editing" class="edit-form mt-4">
              <h3 class="text-center">Editar Perfil</h3>
              <form @submit.prevent="editProfile">
                <div class="mb-3">
                  <label for="firstName" class="form-label">Nome:</label>
                  <input id="firstName" v-model="user.firstName" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="lastName" class="form-label">Apelido:</label>
                  <input id="lastName" v-model="user.lastName" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="bio" class="form-label">Bio:</label>
                  <input id="bio" v-model="user.bio" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                  <label for="location" class="form-label">Localização:</label>
                  <input id="location" v-model="user.location" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                  <label for="website" class="form-label">Website:</label>
                  <input id="website" v-model="user.website" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                  <label for="birthday" class="form-label">Aniversário:</label>
                  <input id="birthday" v-model="user.birthday" type="date" class="form-control" :max="today" />
                </div>
                <div class="mb-3">
                  <label for="profileImage" class="form-label">Imagem de Perfil:</label>
                  <input id="profileImage" type="file" @change="onImageChange" class="form-control" />
                </div>
                <div class="d-flex justify-content-between">
                  <button type="submit" class="btn btn-success">Salvar</button>
                  <button @click="editing = false" class="btn btn-secondary">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const user = ref({
  firstName: "",
  lastName: "",
  email: "",
  joinedDate: "",
  bio: "",
  location: "",
  website: "",
  birthday: "",
  profileImage: ""
});
const loading = ref(true);
const editing = ref(false);
const selectedImage = ref(null);
const today = new Date().toISOString().split("T")[0]; 

const getUserData = async () => {
  const userDoc = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userDoc);

  if (userSnap.exists()) {
    user.value = {
      ...user.value,
      ...userSnap.data(),
    };
  } else {
    console.log("Usuário não encontrado!");
  }
  loading.value = false;
};

const editProfile = async () => {
  if (!validateProfile()) return;

  const userDoc = doc(db, "users", auth.currentUser.uid);
  const updatedData = {
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    bio: user.value.bio || "",
    location: user.value.location || "",
    website: user.value.website || "",
    birthday: user.value.birthday || "",
    profileImage: user.value.profileImage || ""
  };

  if (selectedImage.value) {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profileImages/${auth.currentUser.uid}`);
    const snapshot = await uploadBytes(imageRef, selectedImage.value);
    const imageUrl = await getDownloadURL(snapshot.ref);
    updatedData.profileImage = imageUrl;
  }

  await updateDoc(userDoc, updatedData);
  editing.value = false;
};

const onImageChange = (event) => {
  selectedImage.value = event.target.files[0];
};

const validateProfile = () => {
  if (!user.value.firstName) {
    alert("Nome é obrigatório.");
    return false;
  }
  if (user.value.birthday > today) {
    alert("A data de aniversário não pode ser futura.");
    return false;
  }
  return true;
};

onMounted(getUserData);
</script>

<style>
.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}
</style>
