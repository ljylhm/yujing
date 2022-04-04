<template>
  <div class="userManagement-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="4">
        <el-button icon="el-icon-plus" type="primary" @click="handleEdit">
          添加
        </el-button>
        <!-- <el-button icon="el-icon-delete" type="danger" @click="handleDelete">
          批量删除
        </el-button> -->
      </vab-query-form-left-panel>
      <vab-query-form-right-panel :span="20">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item label="用户名：">
            <el-input
              v-model.trim="queryForm.name"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item label="用户类型：">
            <el-select v-model="queryForm.type" placeholder="请选择用户类型">
              <el-option :label="'全部'" :value="''"></el-option>
              <el-option
                v-for="(value, key) in statusList"
                :key="key"
                :label="value"
                :value="key"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="queryData">
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>

    <el-table
      v-loading="listLoading"
      :data="list"
      :height="height"
      :element-loading-text="elementLoadingText"
    >
      <el-table-column  label="序号" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        
        prop="name"
        label="用户名"
        align="center"
      ></el-table-column>
      <el-table-column
        
        prop="phone"
        label="电话号码"
        align="center"
      ></el-table-column>
      <el-table-column
        
        prop="birthday"
        label="生日"
        align="center"
      >
        <template #default="{ row }">
          {{ format(row.birthday) || '--' }}
        </template>
      </el-table-column>

      <el-table-column  label="角色" align="center">
        <template #default="{ row }">
          <el-tag :type="tagList[row.type]">
            {{ statusList[row.type] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column  label="操作" width="200">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      :current-page="queryForm.page"
      :page-size="queryForm.limit"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
    <edit ref="edit" @fetchData="fetchData"></edit>
  </div>
</template>

<script>
  import { getList, doDelete } from '@/api/userManagement'
  import Edit from './components/UserManagementEdit'
  import request from '@/utils/request'
  import { timeFormat } from '@/utils/date'

  export default {
    name: 'UserManagement',
    components: { Edit },
    data() {
      return {
        list: null,
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        selectRows: '',
        elementLoadingText: '正在加载...',
        queryForm: {
          page: 1,
          limit: 10,
          name: '',
          type: '',
        },
        statusList: {
          1: '学生',
          2: '家长',
          3: '老师',
          4: '管理员',
        },
        tagList: {
          1: 'success',
          2: 'info',
          3: 'warning',
          4: 'danger',
        },
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    created() {
      this.fetchData()
    },
    methods: {
      setSelectRows(val) {
        this.selectRows = val
      },
      format(value) {
        return timeFormat(value, 'yyyy-MM-dd')
      },
      handleEdit(row) {
        if (row.id) {
          this.$refs['edit'].showEdit(row)
        } else {
          this.$refs['edit'].showEdit()
        }
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
              const { msg } = await doDelete({ ids })
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
      queryData() {
        this.queryForm.page = 1
        this.fetchData()
      },
      async fetchData() {
        this.listLoading = true

        // 获取列表用户数据
        try {
          const result = await request({
            url: 'https://mastercenter.cn/api/user/list',
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
    },
  }
</script>
