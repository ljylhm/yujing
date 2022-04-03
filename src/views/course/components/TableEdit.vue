<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="选择学生" prop="name">
        <el-select v-model="form.student_id" filterable  placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in studentList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择科目" prop="name">
        <el-select v-model="form.course_id" placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in subjectList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课时数量" prop="name" >
        <div style="width:100px">
            <el-input v-model="form.num_class" min=1 type="number" />
        </div>
      </el-form-item>
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
          student_id: "",
          course_id: "",
          num_class: 1,
          name: '',
          description: '',
        },
        rules: {
          student_id: [{ required: true, trigger: 'change', message: '请至少选择一个学生' }],
          course_id: [{ required: true, trigger: 'change', message: '请至少选择一个学科' }],
        },
        title: '',
        dialogFormVisible: false,
        studentList: [],
        subjectList: []
      }
    },
    created() {},
    mounted(){
      console.log("this", this)
    },
    methods: {
      showEdit(row) {
        this.getStudentList()
        this.getSubjectList()
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
      // 获取学生的信息
      async getStudentList(){
         const result = await request({
              url: "https://mastercenter.cn/api/user/get_type_user_list",
              method: "post",
              data: {
                page: 1,
                limit: 1000,
                type: "1"
              }
          })
          if(result && result.data){
              this.studentList = result.data.list
          }
      },
      // 获取科目的信息
      async getSubjectList(){
         const result = await request({
              url: "https://mastercenter.cn/api/course/list",
              method: "post",
              data: {
                page: 1,
                limit: 1000
              }
          })
          if(result && result.data){
              this.subjectList = result.data.list
          }
      },
      save() {
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            const isEdit = this.title == "编辑"
            const apiName = isEdit ? "update" : "class_add"
            const result = await request({
              url: "https://mastercenter.cn/api/student/" + apiName,
              method: "post",
              data: {
                ...this.form
              }
            })
            if(result && result.data){
              this.$baseMessage(this.title + "成功", 'success')
              this.$refs['form'].resetFields()
              this.dialogFormVisible = false
              this.form = this.$options.data().form
            }else{
              this.$baseMessage(result.msg ||  this.title + "失败", 'error')
            }
          } else {
            return false
          }
        })
      },
    },
  }
</script>
