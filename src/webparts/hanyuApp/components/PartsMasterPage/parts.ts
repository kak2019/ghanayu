import { IPartMasterItem } from './../../../../model/partitem';
import { onMounted, ref } from 'vue';
import { usePartMasterStore } from '../../../../stores/part';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { Check, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
    components: {
        Check,
        Close
    },
    setup() {
        yup.setLocale({
            mixed: {
                required: ({ path }) => `${path} は必須フィールドです。`
            },
            string: {
                min: ({ path, min }) => `${path} は少なくとも ${min} 文字である必要があります。`
            }
        });
        const queryForm = useForm({
            validationSchema:
                yup.object({
                    MLNPartNo: yup.string().label('MLN部品番号'),
                    UDPartNo: yup.string().label('UD部品番号'),
                })
            ,
            initialValues: {
                MLNPartNo: '',
                UDPartNo: ''
            },
        });
        const config = (state: { errors: string[]; required: boolean; }): { props: { validateEvent: boolean, error: string, required: boolean } } => ({
            props: {
                validateEvent: false,
                error: state.errors[0],
                required: state.required,
            },
        });
        const [MLNPartNo, MLNPartNoProps] = queryForm.defineField('MLNPartNo', config);
        const [UDPartNo, UDPartNoProps] = queryForm.defineField('UDPartNo', config);

        const tableData = ref<IPartMasterItem[]>([]);
        const filteredData = ref<IPartMasterItem[]>([]);
        const isFiltered = ref(false);
        const loading = ref(true);
        const partMasterStore = usePartMasterStore();
        const currentRowIndex = ref(-1);
        const isEditing = ref(false);
        const isInserting = ref(false);
        const tableRef = ref();

        const partForm = useForm({
            validationSchema:
                yup.object({
                    MLNPartNo: yup.string().required().min(5).label('MLN部品番号'),
                    UDPartNo: yup.string().required().min(5).label('UD部品番号'),
                    Message: yup.string().label('メッセージ'),
                })
            ,
            initialValues: {
                MLNPartNo: '',
                UDPartNo: '',
                Message: ''
            },
        });
        const { errors } = partForm;
        const [partFormMLNPartNo, partFormMLNPartNoProps] = partForm.defineField('MLNPartNo', config);
        const [partFormUDPartNo, partFormUDPartNoProps] = partForm.defineField('UDPartNo', config);
        const [partFormMessage, partFormMessageProps] = partForm.defineField('Message', config);
        const refreshFilteredData = (): void => {
            currentRowIndex.value = -1;
            tableRef.value?.setCurrentRow(undefined);
            const MLNPartNoValue = MLNPartNo.value.trim();
            const UDPartNoValue = UDPartNo.value.trim();

            filteredData.value = partMasterStore.partMasterItems.filter(
                function (value) {
                    const isEmpty1 = MLNPartNoValue === "";
                    const isEmpty2 = UDPartNoValue === "";
                    const filterByMLNPartNo = !isEmpty1 && value.MLNPartNo.indexOf(MLNPartNoValue) >= 0;
                    const filterByUDPartNo = !isEmpty2 && value.UDPartNo.indexOf(UDPartNoValue) >= 0;
                    if (isEmpty1 && isEmpty2) {
                        isFiltered.value = false;
                        return false;
                    }
                    else {
                        isFiltered.value = true;
                        if (!isEmpty1 && !isEmpty2) { return filterByMLNPartNo && filterByUDPartNo; }
                        else {
                            return filterByMLNPartNo || filterByUDPartNo;
                        }
                    }
                }

            );
        }
        const fetchData = (): void => {
            loading.value = true;
            partMasterStore.getListItems().then(() => {
                loading.value = false;
                tableData.value = partMasterStore.partMasterItems;
                refreshFilteredData();
            }).catch(error => {
                loading.value = false;
                ElMessage.error(error);
            });
        };
        onMounted(fetchData);
        const handleRowClick = (row: IPartMasterItem | undefined): void => {
            if (!isEditing.value) {
                currentRowIndex.value = isFiltered.value ? filteredData.value.indexOf(row) : tableData.value.indexOf(row);
            }

        };

        const onSubmit = queryForm.handleSubmit((_) => {
            if (isEditing.value) {
                ElMessage.error('無効な操作です。編集モードを終了して再試行してください。');
                return;
            }
            refreshFilteredData();
        });
        const onResetQuery = (): void => {
            if (isEditing.value) {
                ElMessage.error('無効な操作です。編集モードを終了して再試行してください。');
                return;
            }
            queryForm.resetForm();
            currentRowIndex.value = -1;
            tableRef.value?.setCurrentRow(undefined);
            isFiltered.value = false;
            filteredData.value = [];
        }
        const editRow = (): void => {
            const data = (isFiltered.value) ? filteredData : tableData;
            partForm.setValues({
                ...
                data.value[currentRowIndex.value]
            })
            isEditing.value = true;
        }
        const insertRow = (): void => {
            const data = (isFiltered.value) ? filteredData : tableData;
            if (currentRowIndex.value === -1) {
                data.value.push({
                    MLNPartNo: "",
                    UDPartNo: "",
                    Message: ""
                });
                currentRowIndex.value = data.value.length - 1;
            }
            else {
                data.value.splice(currentRowIndex.value, 0, {
                    MLNPartNo: "",
                    UDPartNo: "",
                    Message: ""
                });
            }
            isEditing.value = true;
            isInserting.value = true;
        }
        const deleteRow = (): void => {
            const data = (isFiltered.value) ? filteredData : tableData;
            partMasterStore.deleteListItem(+data.value[currentRowIndex.value].ID).then((data) => {
                ElMessage.success(data);
                fetchData();
            }).catch(error => ElMessage.error(error));

        }
        const onPartFormSubmit = partForm.handleSubmit((item): void => {
            if (isInserting.value) {
                partMasterStore.addListItem(item).then((data) => {
                    ElMessage.success(data);
                    isEditing.value = false;
                    isInserting.value = false;
                    partForm.resetForm();
                    fetchData();
                }).catch(error => ElMessage.error(error));
            }
            else {
                const data = (isFiltered.value) ? filteredData : tableData;
                partMasterStore.updateListItem(+data.value[currentRowIndex.value].ID, item).then((data) => {
                    ElMessage.success(data);
                    isEditing.value = false;
                    isInserting.value = false;
                    partForm.resetForm();
                    fetchData();
                }).catch(error => ElMessage.error(error));
            }

        });
        const cancelRow = (): void => {
            const data = (isFiltered.value) ? filteredData : tableData;
            if (isInserting.value) {
                if (currentRowIndex.value === -1) {
                    data.value.pop();
                }
                else {
                    data.value.splice(currentRowIndex.value, 1);
                }
                partForm.resetForm();
            }
            else {
                partForm.setValues({
                    ...data.value[currentRowIndex.value]
                });
            }
            isEditing.value = false;
            isInserting.value = false;
        }
        return {
            isFiltered,
            ElMessage,
            Check,
            Close,
            isEditing,
            currentRowIndex,
            MLNPartNo,
            MLNPartNoProps,
            UDPartNo,
            UDPartNoProps,
            tableData,
            filteredData,
            loading,
            handleRowClick,
            onSubmit,
            onResetQuery,
            editRow,
            insertRow,
            deleteRow,
            onPartFormSubmit,
            cancelRow,
            errors,
            partFormMLNPartNo,
            partFormMLNPartNoProps,
            partFormUDPartNo,
            partFormUDPartNoProps,
            partFormMessage,
            partFormMessageProps,
            tableRef,
        }
    }
}
