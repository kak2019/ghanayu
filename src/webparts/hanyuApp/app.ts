import { ref, onMounted, defineComponent } from 'vue';
import { usePartMasterStore } from '../../stores/part';
import { useProcessMasterStore } from '../../stores/process';
import { useFunctionsMasterStore } from '../../stores/function';
import { useSHIKYUFromStore } from '../../stores/shikyufrom';
import { useShippingToStore } from '../../stores/shippingto';
import { useUserStore } from '../../stores/user';
import { useOperationCalendarStore } from '../../stores/operationcalendar';
import { useModifiedReasonMasterStore } from '../../stores/modifiedreason';
import { ElMessage } from 'element-plus';
import { CONST } from '../../config/const';

export default defineComponent({
    name: "HanyuApp",
    setup() {
        const loading = ref(true);
        useOperationCalendarStore();
        const processMasterStore = useProcessMasterStore();
        const functionsMasterStore = useFunctionsMasterStore();
        const modifiedReasonMasterStore = useModifiedReasonMasterStore();
        const shikyuFromStore = useSHIKYUFromStore();
        const shippingToStore = useShippingToStore();
        const partMasterStore = usePartMasterStore();
        const userStore = useUserStore();


        onMounted(async (): Promise<void> => {
            console.log(`${CONST.beginOperationDate} - ${CONST.endOperationDate}`);
            loading.value = true;
            try {
                await processMasterStore.getListItems();
                await functionsMasterStore.getListItems();
                await modifiedReasonMasterStore.getListItems();
                await shikyuFromStore.getListItems();
                await shippingToStore.getListItems();
                await partMasterStore.getListItems();
                await userStore.getUser();
                await userStore.getMembersByGroupName('Business Controler');
                await userStore.getMembersByGroupName('Hanyu type 1');
                await userStore.getMembersByGroupName('Inventory Manager');
            } catch (error) {
                ElMessage.error(error.message);
            }
            loading.value = false;
        });
        return {
            loading,
        }
    }
});