import { IProcessMasterItem } from './../../../../model/processmasteritem';
import { IBillOfMaterialsItem } from '../../../../model';
import { nextTick, computed, onMounted, onBeforeUnmount, ref, defineComponent } from 'vue';
import { usePartMasterStore } from '../../../../stores/part';
import { useProcessMasterStore } from '../../../../stores/process';
import { useBillOfMaterialsStore } from '../../../../stores/billofmaterials';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { Check, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: "BillOfMaterials",
    components: {
        Check,
        Close
    },
    setup() {
        yup.setLocale({
            mixed: {
                required: ({ path }) => `フィールド ${path} は空白です。入力してください。`,
                notType: ({ path }) => `${path} 型の不一致`
            },
            string: {
                min: ({ path, min }) => `${path} は少なくとも ${min} 文字である必要があります。`
            },
            number: {
                integer: ({ path, min }) => `${path} は整数でなければなりません。`,
                min: ({ path, min }) => `${path} は  ${min}  以上でなければなりません。`,
            }
        });
        const queryForm = useForm({
            validationSchema:
                yup.object({
                    ParentPartNo: yup.string().label('当工程 - MLN部品番号'),
                    ParentProcessType: yup.string().label('当工程 - 工程区分'),
                    ChildPartNo: yup.string().label('前工程 - MLN部品番号'),
                    ChildProcessType: yup.string().label('前工程 - 工程区分'),
                })
            ,
            initialValues: {
                ParentPartNo: '',
                ParentProcessType: '',
                ChildPartNo: '',
                ChildProcessType: '',
            },
        });
        const config = (state: { errors: string[]; required: boolean; }): { props: { validateEvent: boolean, error: string, required: boolean } } => ({
            props: {
                validateEvent: false,
                error: state.errors[0],
                required: state.required,
            },
        });
        const [ParentPartNo, ParentPartNoProps] = queryForm.defineField('ParentPartNo', config);
        const [ParentProcessType, ParentProcessTypeProps] = queryForm.defineField('ParentProcessType', config);
        const [ChildPartNo, ChildPartNoProps] = queryForm.defineField('ChildPartNo', config);
        const [ChildProcessType, ChildProcessTypeProps] = queryForm.defineField('ChildProcessType', config);

        const tableData = ref<IBillOfMaterialsItem[]>([]);
        const processData = ref<IProcessMasterItem[]>([]);
        const filteredData = ref<IBillOfMaterialsItem[]>([]);
        const isFiltered = ref(false);
        const loading = ref(true);
        const processMasterStore = useProcessMasterStore();
        const partMasterStore = usePartMasterStore();
        const billOfMaterialsStore = useBillOfMaterialsStore();
        const currentRowIndex = ref(-1);
        const isEditing = ref(false);
        const isInserting = ref(false);
        const tableRef = ref();


        const windowHeight = ref(window.innerHeight);
        const tableHeight = computed(() => {
            const spcHeight = (windowHeight.value < 640) ? 478 : 367;
            const minHeight = (windowHeight.value < 640) ? 178 : 378;
            return windowHeight.value > minHeight + spcHeight ? windowHeight.value - spcHeight : minHeight;
        });

        const handleResize = (): void => {
            windowHeight.value = window.innerHeight;
        }

        const showProcessName = computed(() => (item: string): string => {
            let result = undefined;
            try {
                result = processData.value.find(p => p.ProcessType === item).ProcessName;
            } catch (_) {
                //
            }
            return result;
        });
        const bomForm = useForm({
            validationSchema:
                yup.object({
                    ParentPartNo: yup.string().required().matches(/^[a-zA-Z0-9]{10}$/, 'MLN部品番号は10文字の英数字でなければなりません').label('当工程 - MLN部品番号'),
                    ParentProcessType: yup.string().required().label('当工程 - 工程区分'),
                    ChildPartNo: yup.string().required().matches(/^[a-zA-Z0-9]{10}$/, 'MLN部品番号は10文字の英数字でなければなりません').label('前工程 - MLN部品番号'),
                    ChildProcessType: yup.string().required().label('前工程 - 工程区分'),
                    StructureQty: yup.number().integer().min(1).default(1).required().label('構成数量'),
                })
            ,
            initialValues: {
                ParentPartNo: '',
                ParentProcessType: '',
                ChildPartNo: '',
                ChildProcessType: '',
                StructureQty: 1,
            },
        });
        const { errors } = bomForm;
        const [bomFormParentPartNo, bomFormParentPartNoProps] = bomForm.defineField('ParentPartNo', config);
        const [bomFormParentProcessType, bomFormParentProcessTypeProps] = bomForm.defineField('ParentProcessType', config);
        const [bomFormChildPartNo, bomFormChildPartNoProps] = bomForm.defineField('ChildPartNo', config);
        const [bomFormChildProcessType, bomFormChildProcessTypeProps] = bomForm.defineField('ChildProcessType', config);
        const [bomFormStructureQty, bomFormStructureQtyProps] = bomForm.defineField('StructureQty', config);

        const refreshFilteredData = (): void => {
            currentRowIndex.value = -1;
            tableRef.value?.setCurrentRow(undefined);
            const ParentPartNoValue = ParentPartNo.value.trim();
            const ParentProcessTypeValue = ParentProcessType.value.trim();
            const ChildPartNoValue = ChildPartNo.value.trim();
            const ChildProcessTypeValue = ChildProcessType.value.trim();

            filteredData.value = billOfMaterialsStore.billOfMaterialsItems.filter(
                function (value) {
                    const isEmpty1 = ParentPartNoValue === "";
                    const isEmpty2 = ParentProcessTypeValue === "";
                    const isEmpty3 = ChildPartNoValue === "";
                    const isEmpty4 = ChildProcessTypeValue === "";
                    const filterByParentPartNo = !isEmpty1 && value.ParentPartNo.indexOf(ParentPartNoValue) >= 0;
                    const filterByParentProcessType = !isEmpty2 && value.ParentProcessType.indexOf(ParentProcessTypeValue) >= 0;
                    const filterByChildPartNo = !isEmpty3 && value.ChildPartNo.indexOf(ChildPartNoValue) >= 0;
                    const filterByChildProcessType = !isEmpty4 && value.ChildProcessType.indexOf(ChildProcessTypeValue) >= 0;

                    if (isEmpty1 && isEmpty2 && isEmpty3 && isEmpty4) {
                        isFiltered.value = false;
                        return false;
                    }
                    else {
                        isFiltered.value = true;
                        let result = true;
                        if (!isEmpty1) {
                            result = result && filterByParentPartNo;
                        }
                        if (!isEmpty2) {
                            result = result && filterByParentProcessType;
                        }
                        if (!isEmpty3) {
                            result = result && filterByChildPartNo;
                        }
                        if (!isEmpty4) {
                            result = result && filterByChildProcessType;
                        }
                        return result;
                    }
                }

            );
        }
        const fetchData = (): void => {
            loading.value = true;
            processMasterStore.getListItems().then(() => {
                processData.value = processMasterStore.processMasterItems;
                partMasterStore.getListItems().then(() => {
                    billOfMaterialsStore.getListItems().then(() => {
                        loading.value = false;
                        tableData.value = billOfMaterialsStore.billOfMaterialsItems;
                        refreshFilteredData();
                    }).catch(error => {
                        loading.value = false;
                        ElMessage.error(error.message);
                    });
                }).catch(error => ElMessage.error(error.message));
            }).catch(error => ElMessage.error(error.message));

        };
        const queryMLNPartNo = (queryString: string, cb: (r: { value: string }[]) => void): void => {
            cb(queryString.length > 2 ? partMasterStore.partMasterMLNItems.filter(i => i.toLowerCase().indexOf(queryString.toLowerCase()) === 0).map(s => ({ value: s })) : []);
        }
        onMounted((): void => {
            window.addEventListener('resize', handleResize);
            fetchData();

        });
        onBeforeUnmount((): void => {
            window.removeEventListener('resize', handleResize);
        });
        const handleRowClick = (row: IBillOfMaterialsItem | undefined): void => {
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
            bomForm.setValues({
                ...
                data.value[currentRowIndex.value]
            })
            isEditing.value = true;
        }
        const insertRow = (): void => {
            const data = (isFiltered.value) ? filteredData : tableData;
            if (currentRowIndex.value === -1) {
                data.value.push({
                    ParentPartNo: '',
                    ParentProcessType: '',
                    ChildPartNo: '',
                    ChildProcessType: '',
                    StructureQty: 1,
                });
                currentRowIndex.value = data.value.length - 1;
                nextTick(() => {
                    const tableElement = tableRef.value?.$el.querySelector('.el-scrollbar__wrap');
                    tableElement.scrollTop = tableElement.scrollHeight;
                }).then(undefined).catch(error => ElMessage.error(error.message));

            }
            else {
                data.value.splice(currentRowIndex.value, 0, {
                    ParentPartNo: '',
                    ParentProcessType: '',
                    ChildPartNo: '',
                    ChildProcessType: '',
                    StructureQty: 1,
                });
            }
            isEditing.value = true;
            isInserting.value = true;
        }
        const deleteRow = async (): Promise<void> => {
            const data = (isFiltered.value) ? filteredData : tableData;
            loading.value = true;
            const item = data.value[currentRowIndex.value];
            try {
                let d = await billOfMaterialsStore.getItemCountByUniqueKeySubstring(`${item.ParentPartNo}-${item.ParentProcessType}`);
                if (d === 1) {
                    await partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ParentPartNo).ID, undefined, item.ParentProcessType, false);
                }
                d = 0;
                d = await billOfMaterialsStore.getItemCountByUniqueKeySubstring(`${item.ChildPartNo}-${item.ChildProcessType}`);
                if (d === 1) {
                    await partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ChildPartNo).ID, undefined, item.ChildProcessType, false);
                }
                const data = await billOfMaterialsStore.deleteListItem(+item.ID);
                ElMessage.success(data);
                fetchData();
            }
            catch (error) {
                ElMessage.error(error.message);
            }
        }
        const onbomFormSubmit = bomForm.handleSubmit((item): void => {
            if (isInserting.value) {
                loading.value = true;
                billOfMaterialsStore.addListItem(item).then((data) => {

                    isEditing.value = false;
                    isInserting.value = false;
                    bomForm.resetForm();
                    partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ParentPartNo).ID, undefined, item.ParentProcessType).then(() => {
                        partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ChildPartNo).ID, undefined, item.ChildProcessType).then(() => {
                            //
                        }).catch(error => ElMessage.error(error.message));
                    }).catch(error => ElMessage.error(error.message));

                    ElMessage.success(data);
                    fetchData();
                }).catch(error => ElMessage.error(error.message));
            }
            else {
                const data = (isFiltered.value) ? filteredData : tableData;
                loading.value = true;
                billOfMaterialsStore.updateListItem(+data.value[currentRowIndex.value].ID, item).then((data) => {

                    isEditing.value = false;
                    isInserting.value = false;
                    bomForm.resetForm();
                    partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ParentPartNo).ID, undefined, item.ParentProcessType).then(() => {
                        partMasterStore.updateListItem(+partMasterStore.partMasterItems.find(i => i.MLNPartNo === item.ChildPartNo).ID, undefined, item.ChildProcessType).then(() => {
                            //
                        }).catch(error => ElMessage.error(error.message));
                    }).catch(error => ElMessage.error(error.message));

                    ElMessage.success(data);
                    fetchData();
                }).catch(error => ElMessage.error(error.message));
            }

        });
        const cancelRow = (): void => {
            bomForm.resetForm();
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
                    const ws = XLSX.utils.json_to_sheet(data.value.map((
                        { ParentPartNo, ParentProcessType, ChildPartNo, ChildProcessType, StructureQty }) => ({
                            ParentPartNo,
                            ParentProcessType: processData.value.find(p => p.ProcessType === ParentProcessType).ProcessName,
                            ChildPartNo,
                            ChildProcessType: processData.value.find(p => p.ProcessType === ChildProcessType).ProcessName,
                            StructureQty
                        })));
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    XLSX.writeFile(wb, 'billOfMaterials_data.xlsx');
                }).catch(error => ElMessage.error(error.message));
        }
        return {
            showProcessName,
            queryMLNPartNo,
            isFiltered,
            ElMessage,
            Check,
            Close,
            isEditing,
            isInserting,
            currentRowIndex,
            ParentPartNo, ParentPartNoProps,
            ParentProcessType, ParentProcessTypeProps,
            ChildPartNo, ChildPartNoProps,
            ChildProcessType, ChildProcessTypeProps,
            tableHeight,
            tableData,
            filteredData,
            processData,
            loading,
            handleRowClick,
            onSubmit,
            onResetQuery,
            editRow,
            insertRow,
            deleteRow,
            onbomFormSubmit,
            cancelRow,
            errors,
            bomFormParentPartNo, bomFormParentPartNoProps,
            bomFormParentProcessType, bomFormParentProcessTypeProps,
            bomFormChildPartNo, bomFormChildPartNoProps,
            bomFormChildProcessType, bomFormChildProcessTypeProps,
            bomFormStructureQty, bomFormStructureQtyProps,
            tableRef,
            onDownloadClick,
        }
    }
});
