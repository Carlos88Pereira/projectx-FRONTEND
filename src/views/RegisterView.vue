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
                v-model="firstName"
              />
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
              <label for="confirmPassword" class="form-label"
                >Confirm Password</label
              >
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
import { setDoc, doc } from "firebase/firestore";

const router = useRouter();
const firstName = ref(""); // Added this line
const lastName = ref(""); // Added this line
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const validationErrors = ref({});
const isSubmitting = ref(false);

const registerAction = async () => {
  if (password.value !== confirmPassword.value) {
    validationErrors.value.password = "Passwords do not match";
    return;
  }

  isSubmitting.value = true;
  validationErrors.value = {}; // Clear previous errors

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    // Store additional user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.value, // Changed this line
      lastName: lastName.value, // Changed this line
      email: email.value,
    });

    // Redirect to the login page after registration
    router.push("/login");
  } catch (error) {
    isSubmitting.value = false;
    validationErrors.value = { error: error.message };
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
