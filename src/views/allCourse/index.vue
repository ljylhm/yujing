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
          <el-form-item label="学科">
            <el-input
              v-model="queryForm.course_name"
              placeholder="请输入学科查询"
            />
          </el-form-item>
          <el-form-item label="学生">
            <el-input
              v-model="queryForm.student_name"
              placeholder="请输入学生查询"
            />
          </el-form-item>
          <el-form-item label="老师">
            <el-input
              v-model="queryForm.teacher_name"
              placeholder="请输入学生查询"
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
          <el-form-item label="">
            <el-date-picker
              v-model="queryForm.date"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
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
      <el-table-column label="序号" width="95" align="center">
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
        prop="start_time"
        label="开始日期"
        width="220"
        align="center"
      >
        <template slot-scope="scope">
          {{ format(scope.row.start_time * 1000) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="end_time"
        label="结束日期"
        width="220"
        align="center"
      >
        <template slot-scope="scope">
          {{ format(scope.row.end_time * 1000) }}
        </template>
      </el-table-column>
      <el-table-column
        label="学生"
        prop="student_name"
        align="center"
      ></el-table-column>
      <el-table-column
        label="老师"
        prop="teacher_name"
        align="center"
      ></el-table-column>
      <el-table-column
        label="实际课时"
        prop="real_time"
        align="center"
      ></el-table-column>
      <el-table-column label="课时状态" width="160px" align="center">
        <template #default="{ row }">
          <el-tag :type="tagStatusList[row.status].type">
            {{ tagStatusList[row.status].name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否生效" width="120px" align="center">
        <template #default="{ row }">
          <el-tag :type="validStatusList[row.is_valid].type">
            {{ validStatusList[row.is_valid].name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        prop="description"
        align="center"
        width="200"
      ></el-table-column>
      <el-table-column label="操作" width="180px" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.is_valid == 2"
            type="text"
            @click="handleEdit(row)"
          >
            修改
          </el-button>
          <el-button v-if="row.status == 1" type="text" @click="checkSign(row)">
            确认签到
          </el-button>
          <el-button type="text" @click="handleHistory(row)">
            历史记录
          </el-button>
          <el-button
            v-if="
              row.is_valid != 1 &&
              Date.now() < Number(row.start_time) * 1000 &&
              row.status != 2
            "
            type="text"
            @click="deleteCourse(row)"
          >
            删除
          </el-button>
          <!-- this.$refs['edit'].showEdit(row) -->
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
    <table-add ref="add" @fetchData="fetchData"></table-add>
  </div>
</template>

<script>
  import { getList, doDelete } from '@/api/table'
  import TableEdit from './components/TableEdit'
  import TableAdd from './components/TableAdd'
  import request from '@/utils/request'
  import { timeFormat } from '@/utils/date'

  export default {
    name: 'ComprehensiveTable',
    components: {
      TableEdit,
      TableAdd,
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
          teacher_name: '',
          status: '',
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
            name: '未签到',
            type: 'info',
          },
          1: {
            id: 1,
            name: '签到待确认',
            type: 'warning',
          },
          2: {
            id: 2,
            name: '签到已确认',
            type: 'success',
          },
        },
        validStatusList: {
          0: {
            id: '0',
            name: '待确认',
            type: 'info',
          },
          1: {
            id: '1',
            name: '已失效',
            type: 'warning',
          },
          2: {
            id: '2',
            name: '已生效',
            type: 'success',
          },
        },
        exportUrl: '',
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
      this.exportUrl = `https://mastercenter.cn/api/export?arranging_id=${id}`
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
      checkSign(row) {
        this.$baseConfirm('你确定要确认签到吗', null, async () => {
          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/schedul_modify',
            method: 'post',
            data: {
              id: row.id,
              status: 2,
            },
          })
          if (result && result.data) {
            this.$baseMessage('已确认', 'success')
          } else {
            this.$baseMessage(result.msg || '确认' + '失败', 'error')
          }
          this.fetchData()
        })
      },
      handleHistory(row) {
        this.$refs['edit'].showHistory(row)
      },
      deleteCourse(row) {
        this.$baseConfirm('你确定要删除此项吗', null, async () => {
          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/delete_course',
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
        const row = this.list[0]
        const form = {
          ...row,
          type: 1,
          arranging_id: this.queryForm.arranging_id,
          start_time: '',
        }
        this.$refs['add'].showEdit(form)
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
        const { date } = this.queryForm
        let start_time = ''
        let end_time = ''
        if (this.queryForm.date) {
          start_time = this.queryForm.date[0].getTime() / 1000
          end_time = this.queryForm.date[1].getTime() / 1000
        }
        this.listLoading = true
        const wrapForm = {
          ...this.queryForm,
          page: this.queryForm.page,
          limit: this.queryForm.limit,
          start_time,
          end_time,
        }
        try {
          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/list',
            method: 'post',
            data: wrapForm,
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
