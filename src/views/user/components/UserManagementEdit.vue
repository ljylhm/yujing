<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="权限" prop="type" v-if="title=='添加'">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">学生</el-radio>
          <el-radio :label="2">家长</el-radio>
          <el-radio :label="3">老师</el-radio>
          <el-radio :label="4" v-if="isAdmin">管理员</el-radio>
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
      <el-form-item v-if="form.type == 1" label="生日" prop="birthday">
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
      <el-form-item v-if="form.type == 1" label="学校" prop="school">
        <el-input v-model.trim="form.school" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="form.type == 1" label="年级" prop="grade">
        <el-select v-model="form.grade" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <!-- <el-input v-model.trim="form.grade" autocomplete="off"></el-input> -->
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
  import { mapGetters } from 'vuex'
  import { doEdit } from '@/api/userManagement'
  import request from '@/utils/request'

  export default {
    name: 'UserManagementEdit',
    computed: {
      ...mapGetters({
        avatar: 'user/avatar',
        username: 'user/username',
        isAdmin: 'user/isAdmin',
      }),
    },
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
          grade: "",
          parent_id: '',
        },
        rules: {
          name: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
          birthday: [{ required: true, trigger: 'blur', message: '请选择生日' }],
          school: [{ required: true, trigger: 'blur', message: '请输入学校' }],
          grade: [{ required: true, trigger: 'blur', message: '请输入年级' }],
          password: [
            {
              trigger: 'blur',
              validator: (rule, value, callback) => {
                if (!value && this.form.type == '4') {
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
            { required: true, trigger: 'change', message: '请输入联系电话' },
            {
              pattern:
                /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
              message: '请输入正确的联系电话',
            },
          ],
          type: [{ required: true, trigger: 'blur', message: '请选择权限' }],
        },
        studedntRules: {
          name: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
          birthday: [{ required: true, trigger: 'blur', message: '请选择生日' }],
          school: [{ required: true, trigger: 'blur', message: '请输入学校' }],
          password: [
            {
              trigger: 'blur',
              validator: (rule, value, callback) => {
                if (!value && this.form.type == '4') {
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
            { required: true, trigger: 'change', message: '请输入联系电话' },
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
        options: [{
          value: "0",
          label: "学前(k0)"
        },{
          value: "1",
          label: "小班(k1)"
        },{
          value: "2",
          label: "中班(k2)"
        },{
          value: "3",
          label: "大班(k3)"
        },{
          value: "4",
          label: "一年级(k4)"
        },{
          value: "5",
          label: "二年级(k5)"
        },{
          value: "6",
          label: "三年级(k6)"
        },{
          value: "7",
          label: "四年级(k7)"
        },{
          value: "8",
          label: "五年级(k8)"
        },{
          value: "9",
          label: "六年级(k9)"
        },{
          value: "10",
          label: "初一(k10)"
        },{
          value: "11",
          label: "初二(k11)"
        },{
          value: "12",
          label: "初三(k12)"
        },{
          value: "13",
          label: "高一(k13)"
        },{
          value: "14",
          label: "高二(k14)"
        },{
          value: "15",
          label: "高三(k15)"
        },{
          value: "16",
          label: "其他"
        }]
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
              // this.$baseMessage(result.msg || this.title + '失败', 'error')
            }
          } else {
            return false
          }
        })
      },
    },
  }
</script>
