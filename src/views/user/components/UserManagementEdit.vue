<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="权限" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">学生</el-radio>
          <el-radio :label="2">家长</el-radio>
          <el-radio :label="3">老师</el-radio>
          <el-radio :label="4">管理员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.type == 1" label="家长名单" prop="parent_id">
        <el-select
          v-model="form.parent_id"
          placeholder="请选择"
          :disabled="title == '编辑'"
        >
          <el-option
            v-for="item in parentList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户名" prop="name">
        <el-input v-model.trim="form.name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model.trim="form.phone" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model.trim="form.birthday"
          type="date"
          format="yyyy 年 MM 月 dd 日"
          value-format="timestamp"
          placeholder="选择日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input
          v-model.trim="form.description"
          type="textarea"
          :rows="2"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="学校" prop="school">
        <el-input v-model.trim="form.school" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="form.type == 4" label="密码" prop="password">
        <el-input
          v-model.trim="form.password"
          type="password"
          autocomplete="off"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/userManagement'
  import request from '@/utils/request'

  export default {
    name: 'UserManagementEdit',
    data() {
      return {
        form: {
          name: '',
          phone: '',
          password: '',
          birthday: '',
          school: '',
          description: '',
          type: 1,
          parent_id: '',
        },
        rules: {
          name: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
          password: [
            {
              trigger: 'blur',
              validator: (rule, value, callback) => {
                if (value === '' && this.form.type == '4') {
                  callback(new Error('请输入密码'))
                } else {
                  callback()
                }
              },
            },
          ],
          parent_id: [
            {
              required: true,
              trigger: 'change',
              validator: (rule, value, callback) => {
                if (value === '' && this.form.type == '1') {
                  callback(
                    new Error('请选择一个家长，若无对应家长，请先为其添加')
                  )
                } else {
                  callback()
                }
              },
            },
          ],
          phone: [
            { required: true, trigger: 'blur', message: '请输入联系电话' },
            {
              pattern:
                /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
              message: '请输入正确的联系电话',
            },
          ],
          type: [{ required: true, trigger: 'blur', message: '请选择权限' }],
        },
        title: '',
        dialogFormVisible: false,
        parentList: [],
      }
    },
    methods: {
      showEdit(row) {
        this.getParentList()
        if (!row) {
          this.title = '添加'
        } else {
          this.title = '编辑'
          this.form = Object.assign({}, row, {
            type: parseInt(row.type),
          })
        }
        this.dialogFormVisible = true
      },
      close() {
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetchData')
      },
      // 获取家长的信息
      async getParentList() {
        const result = await request({
          url: 'https://mastercenter.cn/api/user/get_type_user_list',
          method: 'post',
          data: {
            page: 1,
            limit: 1000,
          },
        })
        if (result && result.data) {
          this.parentList = result.data.list
        }
      },
      save() {
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            console.log('form', this.form)

            const { msg } = await doEdit(this.form)
            const isEdit = this.title == '编辑'
            const apiName = isEdit ? 'update' : 'add'
            const result = await request({
              url: 'https://mastercenter.cn/api/user/' + apiName,
              method: 'post',
              data: {
                ...this.form,
              },
            })
            if (result && result.data) {
              this.$baseMessage(this.title + '成功', 'success')
              this.$refs['form'].resetFields()
              this.dialogFormVisible = false
              this.form = this.$options.data().form
            } else {
              this.$baseMessage(result.msg || this.title + '失败', 'error')
            }
          } else {
            return false
          }
        })
      },
    },
  }
</script>
