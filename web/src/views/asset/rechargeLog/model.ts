import { ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { FormSchema } from '@/components/Form';
import { defRangeShortcuts } from '@/utils/dateUtil';
import { useDictStore } from '@/store/modules/dict';
import { renderOptionTag } from '@/utils';

export interface State {
  id: number;
  memberId: number;
  orderType: string;
  productId: number;
  orderSn: string;
  money: number;
  remark: string;
  payLogOutTradeNo: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  refundReason: string;
  rejectRefundReason: string;
  payLogPayType: string;
}

export const defaultState = {
  id: 0,
  memberId: 0,
  orderType: '',
  productId: 0,
  orderSn: '',
  money: 0,
  payLogOutTradeNo: '',
  remark: '',
  status: 1,
  createdAt: '',
  updatedAt: '',
  refundReason: '',
  rejectRefundReason: '',
  payLogPayType: '',
};

export function newState(state: State | null): State {
  if (state !== null) {
    return cloneDeep(state);
  }
  return cloneDeep(defaultState);
}

const dict = useDictStore();
export const rules = {};

export const schemas = ref<FormSchema[]>([
  {
    field: 'memberId',
    component: 'NInput',
    label: '管理员ID',
    componentProps: {
      placeholder: '请输入管理员ID',
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'orderSn',
    component: 'NInput',
    label: '业务单号',
    componentProps: {
      placeholder: '请输入业务订单号',
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'payLogOutTradeNo',
    component: 'NInput',
    label: '商户单号',
    componentProps: {
      placeholder: '请输入商户订单号',
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'createdAt',
    component: 'NDatePicker',
    label: '创建时间',
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

export const columns = [
  {
    title: '订单ID',
    key: 'id',
    width: 100,
  },
  {
    title: '管理员ID',
    key: 'memberId',
    width: 100,
  },
  {
    title: '业务订单号',
    key: 'orderSn',
    width: 260,
  },
  {
    title: '商户订单号',
    key: 'payLogOutTradeNo',
    width: 260,
  },
  {
    title: '支付方式',
    key: 'payLogPayType',
    render(row) {
      return renderOptionTag('payType', row.payLogPayType);
    },
    width: 150,
  },
  {
    title: '充值金额',
    key: 'money',
    width: 100,
    render(row) {
      return '¥' + Number(row.money).toFixed(2);
    },
  },
  {
    title: '订单状态',
    key: 'status',
    render(row) {
      return renderOptionTag('orderStatus', row.status);
    },
    width: 150,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
  },
];

export function loadOptions() {
  dict.loadOptions(['payType', 'orderStatus', 'acceptRefundStatus']);
}
