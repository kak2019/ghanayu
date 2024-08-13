<template>
<el-container>
    <el-header height="36px" :style="{padding:0}">
        <el-form label-position="top" label-width="auto" size="small" @submit="onSubmit">
            <el-row class="row-bg" justify="space-evenly" :gutter="8">
                <el-col :span="4">
                    <el-form-item label="MLN部品番号" label-position="top" :style="{ margin: 0 }" v-bind="MLNPartNoProps">
                        <el-input v-model="MLNPartNo" />
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="UD部品番号" label-position="top" v-bind="UDPartNoProps">
                        <el-input v-model="UDPartNo" />
                    </el-form-item>
                </el-col>
                <el-col :span="2">

                </el-col>
                <el-col :span="12">
                    <el-button plain size="large" type="primary" native-type="submit">検索</el-button>
                    <el-button plain size="large" @click="onResetQuery">キャンセル</el-button>
                    <el-button plain size="large" @click="onDownloadClick">ダウンロード</el-button>
                </el-col>
                <el-col :span="2">

                </el-col>
            </el-row>
        </el-form>
    </el-header>
    <el-main :style="{paddingLeft:0,paddingRight:0}">
        <el-form size="small" @submit="onPartFormSubmit" :inline-message="false" :status-icon="true" :scroll-to-error="true">
            <el-table :header-cell-style="{ backgroundColor: '#366093', color: '#fff', textAlign: 'center' }" :data="isFiltered?filteredData:tableData" :highlight-current-row="!isEditing" @current-change="handleRowClick" v-loading="loading" ref="tableRef" :height="tableHeight">
                <el-table-column fixed prop="MLNPartNo" label="MLN部品番号" width="140">
                    <template #default="scope">
                        <el-form-item v-if="isInserting && currentRowIndex === scope.$index" v-bind="partFormMLNPartNoProps">
                            <el-input v-model="partFormMLNPartNo" />
                        </el-form-item>
                        <span v-else>{{ scope.row.MLNPartNo }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="UDPartNo" label="UD部品番号" width="120">
                    <template #default="scope">
                        <el-form-item v-if="isEditing && currentRowIndex === scope.$index" v-bind="partFormUDPartNoProps">
                            <el-input v-model="partFormUDPartNo" />
                        </el-form-item>
                        <span v-else>{{ scope.row.UDPartNo }}</span>
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
                <el-button plain size="large" @click="editRow" :disabled="isEditing || currentRowIndex === -1">登録</el-button>
                <el-button plain size="large" @click="insertRow" :disabled="isEditing">行追加</el-button>
                <el-popconfirm confirm-button-text="はい" cancel-button-text="いいえ" title="これを削除してもよろしいですか?" @confirm="deleteRow">
                    <template #reference>
                        <el-button plain size="large" :disabled="isEditing || currentRowIndex === -1">行削除</el-button>
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
module.exports = require('./parts');
</script>

<style scoped>
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
    align-items: center;
    background-color: #DDDDDD;
    padding: 4px
}

.el-form-item {
    margin: 0;
}

.el-form-item :deep(.el-form-item__label) {
    margin-bottom: 0;
    text-align: center;
    background-color: #92cddc;
}

.el-alert {
    --el-alert-padding: 1px 8px;
    --el-alert-title-font-size: 0.8em;
}
</style>
