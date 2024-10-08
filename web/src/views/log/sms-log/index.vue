<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="短信记录">
        在这里，您可以方便地查看平台的所有短信发送记录
      </n-card>
    </div>
    <n-card :bordered="false" class="proCard">
      <BasicForm
        @register="register"
        @submit="handleSubmit"
        @reset="handleReset"
        ref="searchFormRef"
      >
        <template #statusSlot="{ model, field }">
          <n-input v-model:value="model[field]" />
        </template>
      </BasicForm>

      <BasicTable
        :openChecked="true"
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
        :scroll-x="scrollX"
        :resizeHeightOffset="-20000"
      >
        <template #tableTitle>
          <n-button type="error" @click="batchDelete" :disabled="batchDeleteDisabled">
            <template #icon>
              <n-icon>
                <DeleteOutlined />
              </n-icon>
            </template>
            批量删除
          </n-button>
        </template>
      </BasicTable>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { getLogList, Delete } from '@/api/log/smslog';
  import { DeleteOutlined } from '@vicons/antd';
  import { adaTableScrollX } from '@/utils/hotgo';
  import { defRangeShortcuts } from '@/utils/dateUtil';
  import { useDictStore } from '@/store/modules/dict';
  import { renderOptionTag } from '@/utils';

  const dict = useDictStore();

  const columns = [
    {
      title: 'ID',
      key: 'id',
      width: 100,
    },
    {
      title: '事件模板',
      key: 'event',
      render(row) {
        return renderOptionTag('config_sms_template', row.event);
      },
      width: 150,
    },
    {
      title: '手机号',
      key: 'mobile',
      render(row) {
        return row.mobile;
      },
      width: 180,
    },
    {
      title: '验证码或短信内容',
      key: 'code',
      width: 200,
    },
    {
      title: '验证次数',
      key: 'times',
      width: 100,
    },
    {
      title: '发送者IP',
      key: 'ip',
      width: 200,
    },
    {
      title: '状态',
      key: 'status',
      render(row) {
        return renderOptionTag('CodeStatusOptions', row.status);
      },
      width: 100,
    },
    {
      title: '发送时间',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      width: 180,
    },
  ];

  const dialog = useDialog();
  const message = useMessage();
  const actionRef = ref();
  const batchDeleteDisabled = ref(true);
  const checkedIds = ref([]);
  const searchFormRef = ref<any>({});

  const schemas = ref<FormSchema[]>([
    {
      field: 'event',
      component: 'NSelect',
      label: '事件模板',
      componentProps: {
        placeholder: '请选择事件模板',
        options: dict.getOption('config_sms_template'),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'mobile',
      component: 'NInput',
      label: '手机号',
      componentProps: {
        placeholder: '请输入手机号',
        onInput: (e: any) => {
          console.log(e);
        },
      },
      rules: [{ trigger: ['blur'] }],
    },
    {
      field: 'ip',
      component: 'NInput',
      label: '发送者IP',
      componentProps: {
        placeholder: '请输入IP',
        onInput: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'status',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: dict.getOption('CodeStatusOptions'),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'createdAt',
      component: 'NDatePicker',
      label: '发送时间',
      componentProps: {
        type: 'datetimerange',
        clearable: true,
        shortcuts: defRangeShortcuts(),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
  ]);

  const actionColumn = reactive({
    width: 80,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            onClick: handleDelete.bind(null, record),
          },
        ],
      });
    },
  });

  const scrollX = computed(() => {
    return adaTableScrollX(columns, actionColumn.width);
  });

  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  function onCheckedRow(rowKeys) {
    batchDeleteDisabled.value = rowKeys.length <= 0;
    checkedIds.value = rowKeys;
  }

  function handleDelete(record: Recordable) {
    console.log('点击了删除', record);
    dialog.warning({
      title: '警告',
      content: '你确定要删除？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        Delete(record).then((_res) => {
          message.success('操作成功');
          reloadTable();
        });
      },
    });
  }

  function batchDelete() {
    dialog.warning({
      title: '警告',
      content: '你确定要删除？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        Delete({ id: checkedIds.value }).then((_res) => {
          message.success('操作成功');
          reloadTable();
        });
      },
    });
  }

  const loadDataTable = async (res) => {
    return await getLogList({ ...searchFormRef.value?.formModel, ...res });
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function loadOptions() {
    dict.loadOptions(['config_sms_template', 'CodeStatusOptions']);
  }

  onMounted(() => {
    loadOptions();
  });
</script>

<style lang="less" scoped></style>
