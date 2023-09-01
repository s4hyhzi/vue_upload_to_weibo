const { ref, defineComponent } = Vue;
export default defineComponent({
    /*html*/
    template: `
    <div class="message">
        {{ message }}

        
    </div>`,
    setup() {
        const message = ref('about')
        return {
            message
        }
    }
});