import { request } from './client'
import type { BillingCostItem, DataProductDescriptor } from '../types/dataProduct'

export const getDataProducts = () => request<DataProductDescriptor[]>('/data-products')
export const getDataProduct = (id: string) => request<DataProductDescriptor>(`/data-products/${id}`)
export const getBillingCosts = () => request<BillingCostItem[]>('/data-products/billing/costs')
