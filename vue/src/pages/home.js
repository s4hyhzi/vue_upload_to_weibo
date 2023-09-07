const { ref, defineComponent } = Vue;
import { useAuthStore } from "../stores/auth-store.js";
export default defineComponent({
    /*html*/
    template: `
    <div class="home_message">
        <span>Home</span>
        <n-upload
            ref="upload"
            :default-upload="false"
            list-type="image-card"
            multiple
            :default-file-list="previewFileList"
            @preview="handlePreview"
            @before-upload="devUploadImage"
        >
            <ion-icon name="add-outline" size="large"></ion-icon>
        </n-upload>

        <n-modal
            v-model:show="showModal"
            preset="card"
            style="width: 600px"
            title="一张很酷的图片"
        >
            <img :src="previewImageUrl" style="width: 100%">
        </n-modal>

    </div>`,
    /*javascript*/
    setup() {
        const message = ref('home')
        const authStore = useAuthStore();
        const previewImageUrl = ref("");
        const showModal = ref(false);
        const previewFileList = ref([]);

        const handlePreview = (file) => {
            console.log("handlePreview", file);
            previewImageUrl.value = file.url;
            showModal.value = true;
        };

        /*
        const uploadImage = async (options) => {
            console.log("uploadImage", options, chrome);

            const { file, name } = options.file;
            // 上传图片
            const base64 = await getBase64(file);
            console.log(base64);

            var targetExtensionId = "olfihoaamfnkhaapkjpjhaaphobflohm"; // 插件的ID
            chrome.runtime.sendMessage(targetExtensionId, {
                type: 'UploadToWeibo', data: {
                    base64,
                    fileName: name
                }
            }, function (response) {
                console.log(response);
            });
        }
        */

        // 传入一个File对象返回一个base64字符串
        const getBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    let res = reader.result;
                    resolve(res);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
            });
        };

        // 这个函数的作用是将图片上传到微博图床
        const devUploadImage = async (options) => {
            console.log("devUploadImage", options);
            const { file, name } = options.file;
            // 上传图片
            const base64 = await getBase64(file);
            var targetExtensionId = "pbkddelnhmoolfngnligdopenpknlddk"; // 插件的ID
            chrome.runtime.sendMessage(targetExtensionId, {
                type: 'UploadToWeibo', data: {
                    base64,
                    fileName: name
                }
            }, function (response) {
                console.log("response", response);
                if (response.code == 0) {
                    previewFileList.value.push({
                        id: response.data.pid,
                        name: response.data.file_name,
                        status: "finished",
                        url: response.data.url,
                    });
                }
                return false;
            });

            return false;
        };

        console.log(authStore.userInfo);
        return {
            message,
            previewImageUrl,
            showModal,
            previewFileList,
            // uploadImage,
            devUploadImage,
            handlePreview
        }
    },
});