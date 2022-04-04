<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-right-panel :span="24">
        <el-form
          ref="form"
          :model="queryForm"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item label="老师">
            <el-input
              v-model="queryForm.user_name"
              placeholder="请输入调课人查询"
            />
          </el-form-item>
          <el-form-item label="确认人">
            <el-input
              v-model="queryForm.event_confirm_user"
              placeholder="请输入确认人查询"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="queryForm.status" placeholder="请选择">
              <el-option :label="'全部'" :value="''"></el-option>
              <el-option
                v-for="item in tagStatusList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
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
      stripe
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
        label="调课人"
        prop="name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="确认审批人"
        prop="event_confirm_user"
        width="220"
        align="center"
      >
        <template #default="{ row }">
          {{ row.event_confirm_user || '--' }}
        </template>
      </el-table-column>
      <el-table-column
        label="原课时"
        prop="pre_real_time"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="现课时"
        prop="now_real_time"
        align="center"
      >
      </el-table-column>
      <el-table-column
        
        label="课时状态"
        width="180px"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="tagStatusList[row.status].type">
            {{ tagStatusList[row.status].name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="调课时原因"
        prop="description"
        width="220"
        align="center"
      >
      </el-table-column>
      <el-table-column
        
        label="类型"
        width="120px"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="typeStatusList[row.type].type">
            {{ typeStatusList[row.type].name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column  label="操作" width="180px">
        <template #default="{ row }">
          <el-button
            v-if="row.status == 0"
            type="text"
            @click="checkVacation(row, 1)"
          >
            确认
          </el-button>
          <el-button
            v-if="row.status == 0"
            type="text"
            @click="checkVacation(row, 2)"
          >
            驳回
          </el-button>
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
  import { timeFormat } from '@/utils/date'

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
          user_name: '',
          event_confirm_user: '',
          status: '',
          event: [3],
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
            id: '0',
            name: '未处理',
            type: 'info',
          },
          1: {
            id: '1',
            name: '处理成功',
            type: 'warning',
          },
          2: {
            id: '2',
            name: '驳回',
            type: 'success',
          },
        },
        typeStatusList: {
          1: {
            id: '1',
            name: '学生',
            type: 'info',
          },
          2: {
            id: '2',
            name: '家长',
            type: 'warning',
          },
          3: {
            id: '3',
            name: '老师',
            type: 'warning',
          },
          4: {
            id: '4',
            name: '管理员',
            type: 'warning',
          },
        },
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    async created() {
      const id = this.$router.currentRoute.params.id
      this.queryForm.arranging_id = id
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
                url: 'https://mastercenter.cn/api/student/class_add_check',
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
      checkVacation(row, status) {
        const text = status == 1 ? '通过' : '驳回'
        this.$baseConfirm(`你确定要${text}审批吗`, null, async () => {
          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/event_check',
            method: 'post',
            data: {
              id: row.id,
              status,
              event: status == 1 ? '8' : '',
            },
          })
          if (result && result.data) {
            this.$baseMessage('已' + text, 'success')
          } else {
            this.$baseMessage(result.msg || text + '失败', 'error')
          }
          this.fetchData()
        })
      },
      handleHistory(row) {
        this.$refs['edit'].showHistory(row)
      },
      format(value) {
        return timeFormat(value, 'yyyy-MM-dd hh:mm')
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
      async fetchData() {
        this.listLoading = true
        try {
          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/event_list',
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
