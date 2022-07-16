<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel>
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">
          添加
        </el-button>
        <!-- <el-button icon="el-icon-delete" type="danger" @click="handleDelete">
          删除
        </el-button> -->
        <!-- <el-button type="primary" @click="testMessage">baseMessage</el-button>
        <el-button type="primary" @click="testALert">baseAlert</el-button>
        <el-button type="primary" @click="testConfirm">baseConfirm</el-button>
        <el-button type="primary" @click="testNotify">baseNotify</el-button> -->
      </vab-query-form-left-panel>
      <vab-query-form-right-panel>
        <el-form
          ref="form"
          :model="queryForm"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item>
            <el-input v-model="queryForm.name" placeholder="请输入教室名查询" />
          </el-form-item>
          <el-form-item>
            <el-button
              icon="el-icon-search"
              type="primary"
              native-type="submit"
              @click="handleQuery"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>

    <el-table
      ref="tableSort"
      v-loading="listLoading"
      :data="list"
      :element-loading-text="elementLoadingText"
      :height="height"
      @selection-change="setSelectRows"
      @sort-change="tableSortChange"
    >
      <el-table-column
        
        label="序号"
        width="95"
        align="center"
      >
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        
        label="教室名"
        prop="name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="教室描述"
        prop="description"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="创建时间"
        prop="created_at"
        width="200"
      ></el-table-column>
      <el-table-column  label="操作" width="180px" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :background="background"
      :current-page="queryForm.page"
      :layout="layout"
      :page-size="queryForm.limit"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
    <table-edit ref="edit" @fetchData="fetchData"></table-edit>
  </div>
</template>

<script>
  import { getList, doDelete } from '@/api/table'
  import TableEdit from './components/TableEdit'
  import request from '@/utils/request'
  export default {
    name: 'ComprehensiveTable',
    components: {
      TableEdit,
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger',
        }
        return statusMap[status]
      },
    },
    data() {
      return {
        imgShow: true,
        list: [],
        imageList: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加载...',
        queryForm: {
          page: 1,
          limit: 20,
          name: '',
        },
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    async created() {
      this.fetchData()
    },
    beforeDestroy() {},
    mounted() {},
    methods: {
      tableSortChange() {
        const imageList = []
        this.$refs.tableSort.tableData.forEach((item, index) => {
          imageList.push(item.img)
        })
        this.imageList = imageList
      },
      setSelectRows(val) {
        this.selectRows = val
      },
      handleAdd() {
        this.$refs['edit'].showEdit()
      },
      handleEdit(row) {
        this.$refs['edit'].showEdit(row)
      },
      handleDelete(row) {
        this.$baseConfirm('你确定要删除此项吗', null, async () => {
          const result = await request({
            url: 'https://mastercenter.cn/api/classroom/delete',
            method: 'post',
            data: {
              id: row.id,
            },
          })
          if (result && result.data) {
            this.$baseMessage('删除成功', 'success')
          } else {
            this.$baseMessage(result.msg || '删除失败', 'error')
          }
          this.fetchData()
        })
      },
      handleSizeChange(val) {
        this.queryForm.limit = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.queryForm.page = val
        this.fetchData()
      },
      handleQuery() {
        this.queryForm.page = 1
        this.fetchData()
      },
      async fetchData() {
        this.listLoading = true
        try {
          const result = await request({
            url: 'https://mastercenter.cn/api/classroom/list',
            method: 'post',
            data: {
              ...this.queryForm,
            },
          })
          if (result && result.data && result.data.list) {
            this.list = result.data.list
            this.total = result.data.total
          }
        } catch (error) {}
        this.listLoading = false
      },
      testMessage() {
        this.$baseMessage('test1', 'success')
      },
      testALert() {
        this.$baseAlert('11')
        this.$baseAlert('11', '自定义标题', () => {
          /* 可以写回调; */
        })
        this.$baseAlert('11', null, () => {
          /* 可以写回调; */
        })
      },
      testConfirm() {
        this.$baseConfirm(
          '你确定要执行该操作?',
          null,
          () => {
            /* 可以写回调; */
          },
          () => {
            /* 可以写回调; */
          }
        )
      },
      testNotify() {
        this.$baseNotify('测试消息提示', 'test', 'success', 'bottom-right')
      },
    },
  }
</script>
