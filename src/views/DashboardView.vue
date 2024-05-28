<template>
  <div class="container mt-4">
    <div class="tweet-form mb-4 p-4 bg-light rounded">
      <div class="d-flex align-items-center mb-3">
        <img
          :src="userProfileImage"
          alt="Profile"
          class="profile-image rounded-circle me-3"
        />
        <textarea
          v-model="tweet"
          class="form-control"
          rows="3"
          placeholder="What's happening?"
        ></textarea>
      </div>
      <div class="d-flex justify-content-between">
        <input
          type="file"
          @change="onImageChange"
          class="form-control me-2"
          style="width: 50%"
        />
        <button @click="postTweet" class="btn btn-primary">Tweet</button>
      </div>
    </div>
    <div class="tweets-list">
      <div
        v-for="tweet in tweets"
        :key="tweet.id"
        class="tweet-item mb-3 p-3 bg-light rounded"
      >
        <div class="d-flex align-items-start">
          <img
            :src="tweet.profileImage || defaultProfileImage"
            alt="Profile"
            class="profile-image-small rounded-circle me-2"
          />
          <div class="tweet-content">
            <h5>{{ tweet.username }}</h5>
            <p class="mb-1">{{ tweet.tweet }}</p>
            <div v-if="tweet.imageUrl">
              <a
                :href="tweet.imageUrl"
                data-lightbox="tweet-images"
                data-title="Tweet Image"
              >
                <img
                  :src="tweet.imageUrl"
                  alt="Tweet image"
                  class="tweet-image mt-2"
                />
              </a>
            </div>
            <div class="tweet-actions mt-2">
              <button
                @click="toggleLike(tweet.id)"
                class="btn btn-outline-primary btn-sm me-2"
              >
                Like ({{ tweet.likes || 0 }})
              </button>
              <button
                @click="deleteTweet(tweet.id)"
                class="btn btn-outline-danger btn-sm"
              >
                Delete
              </button>
              <button
                @click="toggleFollow(tweet.uid)"
                class="btn btn-outline-secondary btn-sm"
              >
                {{ followingUsers.includes(tweet.uid) ? "Unfollow" : "Follow" }}
              </button>
            </div>
            <small v-if="tweet.timestamp" class="text-muted">
              {{
                new Date(tweet.timestamp.seconds * 1000).toLocaleString()
              }}
            </small>
            <small v-else class="text-muted">Timestamp não disponível</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  getDocs,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Import lightbox2 CSS and JS
import "lightbox2/dist/css/lightbox.css"; //npm install lightbox2
import "lightbox2/dist/js/lightbox.js";
import "jquery"; //npm install jquery -> com a lightbox para abrir as imagens e fica em tamanho maior

const tweet = ref("");
const userProfileImage = ref("");
const defaultProfileImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ALtLfFX6o3KXfDw57OohwBS4-s8MU2f_VePXPx0zbA&s";
const tweetImage = ref(null);
const tweets = ref([]);
const followingUsers = ref([]);

const storage = getStorage(); // Obtenha a instância do Firebase Storage

const loadUserProfileImage = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      userProfileImage.value =
        userSnap.data().profileImage || defaultProfileImage;
    } else {
      console.error("Usuário não encontrado.");
    }
  }
};

const postTweet = async () => {
  const user = auth.currentUser;

  if (user) {
    let tweetData = {
      uid: user.uid,
      tweet: tweet.value,
      timestamp: serverTimestamp(),
      likes: 0,
    };

    if (tweetImage.value) {
      const imageRef = storageRef(
        storage,
        `tweets/${user.uid}/${tweetImage.value.name}`
      );
      const snapshot = await uploadBytes(imageRef, tweetImage.value);
      const imageUrl = await getDownloadURL(snapshot.ref);
      tweetData.imageUrl = imageUrl;
    }

    try {
      await addDoc(collection(db, "tweets"), tweetData);
      console.log("Tweet guardado com sucesso!");
    } catch (e) {
      console.error("Erro ao guardar tweet: ", e);
    }
  } else {
    console.error("Usuário não autenticado.");
  }

  tweet.value = "";
  tweetImage.value = null;
};



// Função para curtir um tweet
const toggleLike = async (tweetId) => {
  const user = auth.currentUser;
  if (user) {
    const likeRef = doc(db, "likes", `${user.uid}_${tweetId}`);
    const likeSnap = await getDoc(likeRef);
    const tweet = tweets.value.find((tweet) => tweet.id === tweetId);
    if (likeSnap.exists()) {
      await deleteDoc(likeRef); // Unlike the tweet
      tweet.likes--; // Decrease the likes count
    } else {
      await setDoc(likeRef, {
        uid: user.uid,
        tweetId: tweetId,
      }); // Like the tweet
      tweet.likes++; // Increase the likes count
    }
  }
};
// Função para deletar um tweet
const deleteTweet = async (tweetId) => {
  const tweetRef = doc(db, "tweets", tweetId);
  await deleteDoc(tweetRef);
};

// Recupera tweets do Firestore e atualiza a lista de tweets
const loadTweets = async () => {
  const tweetsQuery = query(
    collection(db, "tweets"),
    orderBy("timestamp", "desc")
  );
  onSnapshot(tweetsQuery, async (querySnapshot) => {
    const tweetsData = querySnapshot.docs.map(async (doc) => {
      const likesSnapshot = await getDocs(
        query(collection(db, "likes"), where("tweetId", "==", doc.id))
      );
      return { ...doc.data(), id: doc.id, likes: likesSnapshot.size };
    });
    tweets.value = await Promise.all(tweetsData);
  });
};

const loadFollowingUsers = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = doc(db, "followers", user.uid);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists() && userSnap.data().following) {
      followingUsers.value = userSnap.data().following;
    }
  }
};

// Função para seguir/deixar de seguir um usuário e atualizar a lista de seguidores
const toggleFollow = async (uid) => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = doc(db, "followers", user.uid);
    const userSnap = await getDoc(userDoc);

    const targetUserDoc = doc(db, "followers", uid);
    const targetUserSnap = await getDoc(targetUserDoc);

    if (userSnap.exists() && targetUserSnap.exists()) {
      const currentFollowing = userSnap.data().following || [];
      const isFollowing = currentFollowing.includes(uid);
      const updatedFollowing = isFollowing
        ? currentFollowing.filter((id) => id !== uid)
        : [...currentFollowing, uid];

      await updateDoc(userDoc, { following: updatedFollowing });
      followingUsers.value = updatedFollowing;

      // Atualiza a lista de seguidores do usuário seguido/deixado de seguir
      const currentFollowers = targetUserSnap.data().followers || [];
      const updatedFollowers = isFollowing
        ? currentFollowers.filter((id) => id !== user.uid)
        : [...currentFollowers, user.uid];

      await updateDoc(targetUserDoc, { followers: updatedFollowers });
    } else {
      // Se o documento de seguidores não existir, crie-o
      if (!userSnap.exists()) {
        await setDoc(userDoc, { following: [uid] });
        followingUsers.value = [uid];
      }
      if (!targetUserSnap.exists()) {
        await setDoc(targetUserDoc, { followers: [user.uid] });
      }
    }
  }
};

onMounted(() => {
  loadUserProfileImage();
  loadFollowingUsers();
  loadTweets();
});
</script>

<style scoped>
.profile-image {
  width: 50px;
  height: 50px;
}

.profile-image-small {
  width: 30px;
  height: 30px;
}

.tweet-image {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
}

.post-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.tweets-list {
  width: 100%;
  margin-top: 20px;
}

.tweet-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.tweet-content {
  margin-left: 10px;
  flex-grow: 1;
}

.tweet-content p {
  margin: 0;
}

.tweet-content small {
  display: block;
  color: #888;
  margin-top: 5px;
}

.tweet-actions button {
  margin-right: 10px;
}
</style>
