const { ref, defineComponent } = Vue;
export default defineComponent({
    template: `
    <n-config-provider>
        <n-global-style />
        <div class="message">
            <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link>

            <router-view></router-view>
        </div>
    </n-config-provider>
    `,
    setup() {
        localStorage.setItem("user", JSON.stringify({ role: "user" }));
        const message = ref("Hello Vue!");
        return {
            message,
        };
    },
});
