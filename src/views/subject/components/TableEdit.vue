<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="名字" prop="name">
        <el-input
          v-model.trim="form.name"
          autocomplete="off"
          placeholder="请输入学科名字"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="描述" prop="description">
        <el-input
          v-model.trim="form.description"
          type="textarea"
          :rows="2"
          autocomplete="off"
          placeholder="请输入学科描述"
        ></el-input>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { doEdit } from '@/api/table'
  import request from '@/utils/request'
  import { siteUrl } from '@/config'

  export default {
    name: 'TableEdit',
    data() {
      return {
        form: {
          name: '',
          description: '',
        },
        rules: {
          name: [
            { required: true, trigger: 'blur', message: '请输入学科名字' },
          ],
          description: [
            { required: true, trigger: 'blur', message: '请输入学科描述' },
          ],
        },
        title: '',
        dialogFormVisible: false,
      }
    },
    created() {},
    mounted() {
      
    },
    methods: {
      showEdit(row) {
        if (!row) {
          this.title = '添加'
        } else {
          this.title = '编辑'
          this.form = Object.assign({}, row)
        }
        this.dialogFormVisible = true
      },
      close() {
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetchData')
      },
      save() {
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            const isEdit = this.title == '编辑'
            const apiName = isEdit ? 'update' : 'add'
            const result = await request({
              url: 'https://mastercenter.cn/api/course/' + apiName,
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
