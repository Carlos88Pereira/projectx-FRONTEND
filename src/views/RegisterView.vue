<template>
  <div class="row justify-content-md-center mt-5">
    <div class="col-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-4">Register</h5>
          <form @submit.prevent="registerAction" class="register-form">
            <div class="mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input
                type="text"
                class="form-control"
                id="firstName"
                name="firstName"
                v-model="firstName"/>
            </div>
            <div class="mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                type="text"
                class="form-control"
                id="lastName"
                name="lastName"
                v-model="lastName"
              />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                name="email"
                v-model="email"
              />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                name="password"
                v-model="password"
              />
              
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                name="confirmPassword"
                v-model="confirmPassword"
              />
            </div>
            <div class="d-grid gap-2">
              <button
                :disabled="isSubmitting"
                type="submit"
                class="btn btn-primary btn-block"
              >
                Register Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../firebase/firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";

const router = useRouter();
const firstName = ref(""); 
const lastName = ref(""); 
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const validationErrors = ref({});
const isSubmitting = ref(false);

const registerAction = async () => {
  validationErrors.value = {};

  if (firstName.value === "") {
    validationErrors.value.firstName = "First Name is required";
    alert("First Name is required");
    return;
  }

  if (lastName.value === "") {
    validationErrors.value.lastName = "Last Name is required";
    alert("Last Name is required");
    return;
  }

  if (email.value === "") {
    validationErrors.value.email = "Email is required";
    alert("Email is required");
    return;
  }

  if (password.value !== confirmPassword.value) {
    validationErrors.value.password = "Passwords do not match";
    alert("Passwords do not match");
    return;
  }

  if (password.value.length < 6) {
    validationErrors.value.password = "Password must be at least 6 characters";
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email.value));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      validationErrors.value.email = "Email is already registered";
      alert("This email is already registered. Please use a different email.");
      return;
    }
  } catch (error) {
    console.error("Erro ao verificar email: ", error);
    alert("An error occurred while checking the email. Please try again.");
    return;
  }

  isSubmitting.value = true;
  validationErrors.value = {}; 

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {

      firstName: firstName.value, 
      lastName: lastName.value, 
      email: email.value,
    });

    alert("User registered successfully!");
    router.push("/dashboard");
  } catch (error) {
    console.error("Erro ao registrar usuário: ", error);
    isSubmitting.value = false;
    validationErrors.value = { error: error.message };
    alert("An error occurred during registration. Please try again.");
  }
};
</script>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
}

.register-form .form-control {
  margin-bottom: 10px;
}

.register-form .btn {
  width: 100%;
  padding: 10px;
  background-color: #1da1f2;
  color: white;
  border: none;
  cursor: pointer;
}

.register-form .btn:hover {
  background-color: #0e80d2;
}
</style>
