<template>
  <div class="container">
    <div class="search-container">
      <input v-model="searchQuery" @keypress.enter="searchUsers" type="text" placeholder="Search by email...">
      <button @click="searchUsers">Search</button>
    </div>
    <div v-if="selectedUser">
      <div class="profile-container">
        <img :src="selectedUser.profileImage" alt="Profile Image" class="profile-image">
        <h2>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h2>
        <p><strong>Bio:</strong> {{ selectedUser.bio }}</p>
        <p><strong>Email:</strong> {{ selectedUser.email }}</p>
        <p><strong>Birthday:</strong> {{ selectedUser.birthday }}</p>
        <p><strong>Location:</strong> {{ selectedUser.location }}</p>
        <p><strong>Website:</strong> <a :href="selectedUser.website" target="_blank">{{ selectedUser.website }}</a></p>
        <button @click="toggleEditMode">Edit Profile</button>
        <button @click="deleteUser">Delete Profile</button>
      </div>
      <div v-if="isEditing" class="edit-container">
        <h3>Edit Profile</h3>
        <div class="mb-3">
          <label for="editFirstName" class="form-label">First Name</label>
          <input v-model="editFirstName" type="text" class="form-control" id="editFirstName">
        </div>
        <div class="mb-3">
          <label for="editLastName" class="form-label">Last Name</label>
          <input v-model="editLastName" type="text" class="form-control" id="editLastName">
        </div>
        <div class="mb-3">
          <label for="editBio" class="form-label">Bio</label>
          <input v-model="editBio" type="text" class="form-control" id="editLastName">
        </div>
        <div class="mb-3">
          <label for="editBirthday" class="form-label">Birthday</label>
          <input v-model="editBirthday" type="date" class="form-control" id="editBirthday">
        </div>
        <div class="mb-3">
          <label for="editLocation" class="form-label">Location</label>
          <input v-model="editLocation" type="text" class="form-control" id="editLocation">
        </div>
        <div class="mb-3">
          <label for="editWebsite" class="form-label">Website</label>
          <input v-model="editWebsite" type="url" class="form-control" id="editWebsite">
        </div>
        <button @click="saveProfile" class="btn btn-success">Save</button>
        <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
      </div>
      <div class="tweets-container">
        <h3>{{ selectedUser.firstName }}'s Tweets</h3>
        <div v-for="tweet in selectedUserTweets" :key="tweet.id" class="tweet">
          <p>{{ tweet.tweet }}</p>
          <img :src="tweet.imageUrl" alt="Tweet image" v-if="tweet.imageUrl" class="tweet-image">
          <p v-if="tweet.timestamp">{{ new Date(tweet.timestamp.seconds * 1000).toLocaleString() }}</p>
          <p v-else>Timestamp not available</p>
          <p>Likes: {{ tweet.likes }}</p>
          <button @click="deleteTweet(tweet.id)">Delete Tweet</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No user selected.</p>
    </div>
  </div>
</template>




<script setup>
import { ref } from 'vue';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const searchQuery = ref('');
const selectedUser = ref(null);
const selectedUserTweets = ref([]);
const isEditing = ref(false);

const editFirstName = ref('');
const editLastName = ref('');
const editBio = ref('');
const editBirthday = ref('');
const editLocation = ref('');
const editWebsite = ref('');

const searchUsers = async () => {
  console.log('Search query:', searchQuery.value.trim());
  if (searchQuery.value.trim() !== '') {
    const q = query(collection(db, 'users'), where('email', '==', searchQuery.value.trim()));
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot:', querySnapshot);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      selectedUser.value = userDoc.data();
      selectedUser.value.id = userDoc.id;
      await loadTweets(userDoc.id);
      resetEditFields();
      isEditing.value = false;
    } else {
      selectedUser.value = null;
      selectedUserTweets.value = [];
    }
  } else {
    selectedUser.value = null;
    selectedUserTweets.value = [];
  }
};

const loadTweets = async (userId) => {
  const userTweetsQuery = query(
    collection(db, "tweets"),
    where("uid", "==", userId),
    orderBy("timestamp", "desc")
  );

  const userTweetsSnapshot = await getDocs(userTweetsQuery);
  selectedUserTweets.value = userTweetsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  console.log('Selected user tweets:', selectedUserTweets.value);
};

const deleteTweet = async (tweetId) => {
  await deleteDoc(doc(db, "tweets", tweetId));
  selectedUserTweets.value = selectedUserTweets.value.filter(tweet => tweet.id !== tweetId);
};

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    editFirstName.value = selectedUser.value.firstName;
    editLastName.value = selectedUser.value.lastName;
    editBio.value = selectedUser.value.bio;
    editBirthday.value = selectedUser.value.birthday;
    editLocation.value = selectedUser.value.location;
    editWebsite.value = selectedUser.value.website;
  }
};

const saveProfile = async () => {
  const userDocRef = doc(db, "users", selectedUser.value.id);
  await updateDoc(userDocRef, {
    firstName: editFirstName.value,
    lastName: editLastName.value,
    birthday: editBirthday.value,
    location: editLocation.value,
    website: editWebsite.value,
  });
  selectedUser.value.firstName = editFirstName.value;
  selectedUser.value.lastName = editLastName.value;
  selectedUser.value.birthday = editBirthday.value;
  selectedUser.value.location = editLocation.value;
  selectedUser.value.website = editWebsite.value;
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const deleteUser = async () => {
  const userDocRef = doc(db, "users", selectedUser.value.id);
  await deleteDoc(userDocRef);
  selectedUser.value = null;
  selectedUserTweets.value = [];
};

const resetEditFields = () => {
  editFirstName.value = '';
  editLastName.value = '';
  editBirthday.value = '';
  editLocation.value = '';
  editWebsite.value = '';
};
</script>
<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.search-container input {
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.search-container button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #1da1f2;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.search-container button:hover {
  background-color: #0e80d2;
}

.profile-container {
  margin-bottom: 20px;
  text-align: left;
}

.edit-container {
  margin-bottom: 20px;
  text-align: left;
}

.profile-image {
  max-width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.tweet {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  text-align: left;
}

.tweet-image {
  max-width: 100%;
  height: auto;
}

button {
  margin: 5px;
}
</style>
