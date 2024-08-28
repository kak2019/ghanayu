<template>
<el-container>
    <el-header height="58px" :style="{padding:0}">
        <el-form label-position="top" label-width="auto" size="small" @submit="onSubmit">
            <div class="row-bg">
                <table class="tbQueryForm">
                        <tr>
                            <th colspan="2" clsss="el-form-item__label" :style="{ borderCollapse: 'collapse'}">当工程</th>
                        </tr>
                        <tr>
                            <td>
                                <el-form-item label="MLN部品番号" label-position="top" :style="{ margin: 0 }" v-bind="ParentPartNoProps">
                                    <el-autocomplete v-model="ParentPartNo" :fetch-suggestions="queryMLNPartNo" clearable />
                                </el-form-item>
                            </td>
                            <td>
                                <el-form-item label="工程区分" label-position="top" :style="{ margin: 0 }" v-bind="ParentProcessTypeProps">
                                    <el-select v-model="ParentProcessType" placeholder="" :style="{width:'120px'}">
                                        <el-option v-for="item in processData" :key="item.ProcessType" :label="item.ProcessName" :value="item.ProcessType" />
                                    </el-select>
                                </el-form-item>
                            </td>
                        </tr>
                    </table>
                <div class="small-space"></div>
                <table class="tbQueryForm">
                        <tr>
                            <th colspan="2" clsss="el-form-item__label" :style="{ borderCollapse: 'collapse'}">前工程</th>
                        </tr>
                        <tr>
                            <td>
                                <el-form-item label="MLN部品番号" label-position="top" :style="{ margin: 0 }" v-bind="ChildPartNoProps">
                                    <el-autocomplete v-model="ChildPartNo" :fetch-suggestions="queryMLNPartNo" clearable />
                                </el-form-item>
                            </td>
                            <td>
                                <el-form-item label="工程区分" label-position="top" :style="{ margin: 0 }" v-bind="ChildProcessTypeProps">
                                    <el-select v-model="ChildProcessType" placeholder="" :style="{width:'120px'}">
                                        <el-option v-for="item in processData" :key="item.ProcessType" :label="item.ProcessName" :value="item.ProcessType" />
                                    </el-select>
                                </el-form-item>
                            </td>
                        </tr>
                    </table>
                <div class="flex-grow"></div>
                <div class="buttons">
                    <el-button plain size="large" type="primary" native-type="submit">検索</el-button>
                    <el-button plain size="large" @click="onResetQuery">キャンセル</el-button>
                    <el-button plain size="large" @click="onDownloadClick">ダウンロード</el-button>
                </div>
                <div class="small-space"></div>
            </div>
        </el-form>
    </el-header>
    <el-main :style="{paddingLeft:0,paddingRight:0}">
        <el-form size="small" @submit="onbomFormSubmit" :inline-message="false" :status-icon="true" :scroll-to-error="true">
            <el-table :header-cell-style="{ backgroundColor: '#366093', color: '#fff', textAlign: 'center' }" :data="isFiltered?filteredData:tableData" :highlight-current-row="!isEditing" @current-change="handleRowClick" v-loading="loading" ref="tableRef" :height="tableHeight">
                <el-table-column label="当工程">
                    <el-table-column fixed prop="ParentPartNo" label="MLN部品番号" width="140" align="center">
                        <template #default="scope">
                            <el-form-item v-if="isInserting && currentRowIndex === scope.$index" v-bind="bomFormParentPartNoProps">
                                <el-autocomplete v-model="bomFormParentPartNo" :fetch-suggestions="queryMLNPartNo"  />
                            </el-form-item>
                            <span v-else>{{ scope.row.ParentPartNo }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ParentProcessType" label="工程区分" width="120" align="center">
                        <template #default="scope">
                            <el-form-item v-if="isInserting && currentRowIndex === scope.$index" v-bind="bomFormParentProcessTypeProps">
                                <el-select v-model="bomFormParentProcessType" placeholder="">
                                    <el-option v-for="item in processData" :key="item.ProcessType" :label="item.ProcessName" :value="item.ProcessType" />
                                </el-select>
                            </el-form-item>
                            <span v-else>{{ showProcessName(scope.row.ParentProcessType) || scope.row.ChildProcessType}}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column label="前工程">
                    <el-table-column fixed prop="ChildPartNo" label="MLN部品番号" width="140" align="center">
                        <template #default="scope">
                            <el-form-item v-if="isInserting && currentRowIndex === scope.$index" v-bind="bomFormChildPartNoProps">
                                <el-autocomplete v-model="bomFormChildPartNo" :fetch-suggestions="queryMLNPartNo"  />
                            </el-form-item>
                            <span v-else>{{ scope.row.ChildPartNo }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ChildProcessType" label="工程区分" width="120" align="center">
                        <template #default="scope">
                            <el-form-item v-if="isInserting && currentRowIndex === scope.$index" v-bind="bomFormChildProcessTypeProps">
                                <el-select v-model="bomFormChildProcessType" placeholder="">
                                    <el-option v-for="item in processData" :key="item.ProcessType" :label="item.ProcessName" :value="item.ProcessType" />
                                </el-select>
                            </el-form-item>
                            <span v-else>{{showProcessName(scope.row.ChildProcessType) || scope.row.ChildProcessType }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column prop="StructureQty" label="構成数量" width="80" align="right">
                    <template #default="scope">
                        <el-form-item v-if="isEditing && currentRowIndex === scope.$index" v-bind="bomFormStructureQtyProps">
                            <el-input v-model="bomFormStructureQty" />
                        </el-form-item>
                        <span v-else>{{ scope.row.StructureQty }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="" width="108">
                    <template #default="scope">
                        <el-button v-if="isEditing && currentRowIndex === scope.$index" title="保存" type="primary" native-type="submit" :icon="Check" />
                        <el-button v-if="isEditing && currentRowIndex === scope.$index" @click="cancelRow" title="キャンセル" :icon="Close" />
                    </template>
                </el-table-column>
                <el-table-column prop="Message" label="メッセージ">
                    <template #default="scope">
                        <div v-if="scope.$index == currentRowIndex && Object.keys(errors).length>0">
                            <el-tag v-for="(value,key) in errors" :key="key" type="danger" closable effect="plain">{{ value }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <template #empty>
                    <el-empty description="データなし"></el-empty>
                </template>
            </el-table>
        </el-form>
    </el-main>
    <el-footer>
        <el-row class="row-bg" justify="space-evenly" :gutter="20">
            <el-col :span="14">

            </el-col>
            <el-col :span="8">
                <el-button plain size="large" @click="editRow" :disabled="(!isInventoryManager && !isBusinessControler) || isEditing || currentRowIndex === -1">登録</el-button>
                <el-button plain size="large" @click="insertRow" :disabled="!isInventoryManager || isEditing">行追加</el-button>
                <el-popconfirm confirm-button-text="はい" cancel-button-text="いいえ" title="これを削除してもよろしいですか?" @confirm="deleteRow">
                    <template #reference>
                        <el-button plain size="large" :disabled="!isInventoryManager || isEditing || currentRowIndex === -1">行削除</el-button>
                    </template>
                </el-popconfirm>
                <el-button plain size="large" v-show="false">キャンセル</el-button>
            </el-col>
            <el-col :span="2">

            </el-col>
        </el-row>
    </el-footer>
</el-container>
</template>

<script>
module.exports = require('./index');
</script>

<style scoped>
.tbQueryForm {
    border-collapse: collapse !important;
}

.tbQueryForm tr {
    margin-bottom: 0;
    text-align: center;
    background-color: #92cddc;
    font-size: 12px;
}

.tbQueryForm td,
th {
    border: 1px solid;
}

.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.row-bg {

    background-color: #DDDDDD;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
}

.fixed-width {
    width: 200px;
}

.flex-grow {
    flex-grow: 1;
}

.small-space {
    width: 20px;
}

.el-form-item {
    margin: 0;
}

.el-form-item :deep(.el-form-item__label) {
    margin-bottom: 0;
    text-align: center;
    background-color: #92cddc;
    text-wrap: nowrap;
}

.el-alert {
    --el-alert-padding: 1px 8px;
    --el-alert-title-font-size: 0.8em;
}
</style>
