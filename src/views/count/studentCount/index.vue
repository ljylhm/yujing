<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-right-panel :span="1">
         <el-button type="primary" @click="handleExport">导出</el-button>
      </vab-query-form-right-panel>
      <vab-query-form-right-panel :span="23">
        <el-form
          ref="form"
          :model="queryForm"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item label="学生">
            <el-input
              v-model="queryForm.student_name"
              placeholder="请输入学生查询"
            />
          </el-form-item>
          <el-form-item label="学科">
            <el-input
              v-model="queryForm.course_name"
              placeholder="请输学科查询"
            />
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
        
        label="学科名"
        prop="course_name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="学生"
        prop="student_name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="剩余课时"
        prop="total"
        align="center"
      ></el-table-column>
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
          course_name: '',
          student_name: '',
        },
        tagList: {
          1: {
            id: 1,
            name: '天',
            type: 'info',
          },
          2: {
            id: 2,
            name: '周',
            type: 'warning',
          },
        },
        tagStatusList: {
          0: {
            id: 0,
            name: '待确认',
            type: 'info',
          },
          1: {
            id: 1,
            name: '已通过',
            type: 'warning',
          },
          2: {
            id: 2,
            name: '未通过',
            type: 'success',
          },
        }
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
      exportUrl(){
        const { course_name, student_name } = this.queryForm
        return `https://mastercenter.cn/api/surplus_export?course_name=${course_name}&student_name=${student_name}`
      } 
    },
    async created() {
      this.fetchData()
    },
    beforeDestroy() {},
    mounted() {},
    methods: {
      async checkStatus(id, status) {
        this.$baseConfirm(
          `你确定要${status == 1 ? '通过' : '不通过'}当前项吗`,
          null,
          async () => {
            this.listLoading = true
            try {
              const result = await request({
                url: 'https://mastercenter.cn/api/schedul/arranging_modify',
                method: 'post',
                data: {
                  id,
                  status,
                },
              })
              this.listLoading = false
              if (result && result.data) {
                this.$baseMessage('完成审核', 'success')
                this.fetchData()
              }
            } catch (error) {
              this.$baseMessage(result.msg || '网络异常', 'error')
              this.listLoading = false
            }
          }
        )
      },
      toDetail(id) {
        this.$router.push({
          path: `/schedule_detail/${id}`,
        })
      },
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
      handleDescEdit(row) {
        this.$refs['edit'].showDescEdit(row)
      },
      handleDelete(row) {
        if (row.id) {
          this.$baseConfirm('你确定要删除当前项吗', null, async () => {
            const { msg } = await doDelete({ ids: row.id })
            this.$baseMessage(msg, 'success')
            this.fetchData()
          })
        } else {
          if (this.selectRows.length > 0) {
            const ids = this.selectRows.map((item) => item.id).join()
            this.$baseConfirm('你确定要删除选中项吗', null, async () => {
              const { msg } = await doDelete({ ids: ids })
              this.$baseMessage(msg, 'success')
              this.fetchData()
            })
          } else {
            this.$baseMessage('未选中任何行', 'error')
            return false
          }
        }
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
      handleExport(){
          window.open(this.exportUrl)
      },
      async fetchData() {
        this.listLoading = true
        try {
          const result = await request({
            url: 'https://mastercenter.cn/api/stat/student_surplus',
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
