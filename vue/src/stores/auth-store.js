const { defineStore } = Pinia
const { ref, computed } = Vue

export const useAuthStore = defineStore('auth', () => {
    const userInfo = ref(JSON.parse(localStorage.getItem("user")));

    const isLoggedIn = computed(() => {
        if (userInfo.value === null) {
            return false;
        };
        return true;
    });

    const getUserRole = computed(() => {
        if (isLoggedIn.value) {
            return userInfo.value.role;
        };
        return "guest";
    });

    return {
        userInfo,
        isLoggedIn,
        getUserRole,
    };
});