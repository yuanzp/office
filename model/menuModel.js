let menus = [
    {
        id: '1',
        label: '工作日志',
        parentId:0,
        children: [{
            id: '11',
            label: '个人日志',
            path: '/checkin/views/my.vae',
            fixed: true
        },
        {
            id: '12',
            label: '部门日志',
            path: '/worklog/views/departmentWorklog.vae'
        },
        {
            id: '13',
            label: '分组日志',
            path: '/worklog/views/groupWorklog.vae'
        }
        ]
    },
    {
        id: '2',
        label: '项目管理',
        parentId:0,
        children: [{
            id: '21',
            label: '项目任务',
            path: '/project/views/projectView.vae'
        },
        {
            id: '22',
            label: '分组任务',
            path: '/project/views/groupView.vae'
        },
        {
            id: '23',
            label: '项目信息管理',
            path: '/project/views/workItem.vae'
        }
        ]
    },
    /*  {
        id: '3',
        label: '部门工作',
        parentId:0,
        children: [{
            id: '31',
            label: '月度绩效自评',
            path: 'void'
        },
        {
            id: '32',
            label: '月度绩效考核',
            path: 'void'
        }
        ]
    },*/
  {
        id: '4',
        label: '系统管理',
        parentId:0,
        children: [{
            id: '41',
            label: '人员信息',
            path: '/admin/views/employee.vae'
        },
        {
            id: '42',
            label: '导航菜单',
            path: '/admin/views/menu.vae'
        },
        {
            id: '43',
            label: '角色管理',
            path: '/admin/views/role.vae'
        },
        {
            id: '44',
            label: '用户管理',
            path: '/admin/views/user.vae'
        },
        ]
    },

]
module.exports = {
    menus
}