import { IPartMasterItem } from '../../../../model/partitem';
import { nextTick, computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { usePartMasterStore } from '../../../../stores/part';
import { useUserStore } from '../../../../stores/user';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { Check, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
    name: "PartMaster",
    components: {
        Check,
        Close
    },
    setup() {
        yup.setLocale({
            mixed: {
                required: ({ path }) => `フィールド ${path} は空白です。入力してください。`
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

        //const tableData = ref<IPartMasterItem[]>([]);
        const filteredData = ref<IPartMasterItem[]>([]);
        const isFiltered = ref(false);
        const loading = ref(false);
        const partMasterStore = usePartMasterStore();
        const tableData = computed(() => partMasterStore.partMasterItems);
        const userStore = useUserStore();
        const isInventoryManager = computed(() => userStore.groupInfo.indexOf('Inventory Manager') >= 0);
        const currentRowIndex = ref(-1);
        const isEditing = ref(false);
        const isInserting = ref(false);
        const tableRef = ref();
        const createMLNFilter = (value: string): (s: string) => boolean => {
            return (MLNPartNo: string) => {
                return MLNPartNo.toLowerCase().indexOf(value.toLowerCase()) === 0;
            }
        }
        const queryMLNPartNo = (queryString: string, cb: (r: { value: string }[]) => void): void => {
            const results = queryString.length > 2 ? partMasterStore.partMasterMLNItems.filter(createMLNFilter(queryString)).map(s => ({ value: s })) : [];
            cb(results);
        }
        const createUDFilter = (value: string): (s: string) => boolean => {
            return (MLNPartNo: string) => {
                return MLNPartNo.toLowerCase().indexOf(value.toLowerCase()) === 0;
            }
        }
        const queryUDPartNo = (queryString: string, cb: (r: { value: string }[]) => void): void => {
            const results = queryString.length > 2 ? partMasterStore.partMasterUDItems.filter(createUDFilter(queryString)).map(s => ({ value: s })) : [];
            cb(results);
        }
        const windowHeight = ref(window.innerHeight);
        const tableHeight = computed(() => {
            const spcHeight = (windowHeight.value < 640) ? 500 : 389;
            const minHeight = (windowHeight.value < 640) ? 200 : 400;
            return windowHeight.value > minHeight + spcHeight ? windowHeight.value - spcHeight : minHeight;
        });
        const handleResize = (): void => {
            windowHeight.value = window.innerHeight;
        }
        const partForm = useForm({
            validationSchema:
                yup.object({
                    MLNPartNo: yup.string().required().matches(/^[a-zA-Z0-9]{10}$/, 'MLN部品番号は10文字の英数字でなければなりません').label('MLN部品番号'),
                    UDPartNo: yup.string().required().matches(/^[0-9]{8}$/, 'UD部品番号は8数字でなければなりません').label('UD部品番号'),
                })
            ,
            initialValues: {
                MLNPartNo: '',
                UDPartNo: '',
            },
        });
        const { errors } = partForm;
        const [partFormMLNPartNo, partFormMLNPartNoProps] = partForm.defineField('MLNPartNo', config);
        const [partFormUDPartNo, partFormUDPartNoProps] = partForm.defineField('UDPartNo', config);

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
                        if (!isEmpty1 && !isEmpty2) {
                            // If both the MLN part number and the UD part number are entered, search by the MLN part number.
                            // return filterByMLNPartNo && filterByUDPartNo; 
                            return filterByMLNPartNo;
                        }
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
                //tableData.value = partMasterStore.partMasterItems;
                refreshFilteredData();
            }).catch(error => {
                loading.value = false;
                ElMessage.error(error.message);
            });
        };

        onMounted((): void => {
            window.addEventListener('resize', handleResize);

            // fetchData();
        });
        onBeforeUnmount((): void => {
            window.removeEventListener('resize', handleResize);
        });
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
                });
                currentRowIndex.value = data.value.length - 1;
                nextTick(() => {
                    const tableElement = tableRef.value?.$el.querySelector('.el-scrollbar__wrap');
                    tableElement.scrollTop = tableElement.scrollHeight;
                }).then(undefined).catch(undefined);

            }
            else {
                data.value.splice(currentRowIndex.value, 0, {
                    MLNPartNo: "",
                    UDPartNo: "",
                });
            }
            isEditing.value = true;
            isInserting.value = true;
        }
        const deleteRow = (): void => {
            loading.value = true;
            const data = (isFiltered.value) ? filteredData : tableData;
            partMasterStore.deleteListItem(+data.value[currentRowIndex.value].ID).then((data) => {
                ElMessage.success(data);
                fetchData();
            }).catch(error => { ElMessage.error(error.message); loading.value = false; });

        }
        const onPartFormSubmit = partForm.handleSubmit((item): void => {
            loading.value = true;
            if (isInserting.value) {
                partMasterStore.addListItem(item).then((data) => {
                    ElMessage.success(data);
                    isEditing.value = false;
                    isInserting.value = false;
                    partForm.resetForm();
                    fetchData();
                }).catch(error => { ElMessage.error(error.message); loading.value = false; });
            }
            else {
                const data = (isFiltered.value) ? filteredData : tableData;
                partMasterStore.updateListItem(+data.value[currentRowIndex.value].ID, item).then((data) => {
                    ElMessage.success(data);
                    isEditing.value = false;
                    isInserting.value = false;
                    partForm.resetForm();
                    fetchData();
                }).catch(error => { ElMessage.error(error.message); loading.value = false; });
            }

        });
        const cancelRow = (): void => {
            partForm.resetForm();
            const data = (isFiltered.value) ? filteredData : tableData;
            if (isInserting.value) {
                if (currentRowIndex.value === -1) {
                    data.value.pop();
                }
                else {
                    data.value.splice(currentRowIndex.value, 1);
                }

            }
            isEditing.value = false;
            isInserting.value = false;
        }
        const onDownloadClick = (): void => {
            import( /* webpackChunkName: 'xlsx_chunk' */
                'xlsx').then(XLSX => {
                    const data = (isFiltered.value) ? filteredData : tableData;
                    const ws = XLSX.utils.json_to_sheet(data.value.map(({ MLNPartNo, UDPartNo }) => ({ MLN部品番号: MLNPartNo, UD部品番号: UDPartNo })));
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    XLSX.writeFile(wb, 'part_mater_data.xlsx');
                }).catch(error => ElMessage.error(error.message));
        }
        return {
            isFiltered,
            queryMLNPartNo,
            queryUDPartNo,
            ElMessage,
            Check,
            Close,
            isEditing,
            isInserting,
            currentRowIndex,
            MLNPartNo, MLNPartNoProps,
            UDPartNo, UDPartNoProps,
            tableHeight,
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
            partFormMLNPartNo, partFormMLNPartNoProps,
            partFormUDPartNo, partFormUDPartNoProps,
            tableRef,
            onDownloadClick,
            isInventoryManager,
        }
    }
}
